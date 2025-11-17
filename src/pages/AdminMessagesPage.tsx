// src/pages/AdminMessagesPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, IconButton, List, ListItemButton,
  ListItemText, Badge, Divider, CircularProgress, InputAdornment, Snackbar, Alert
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "../lib/supabase";

type Profile = { id: string; full_name: string | null; email: string | null };
type CandidateRow = {
  user_id: string;
  submission_id: string | null;
  created_at: string;
  profile?: Profile | null; // profils via table profiles, fallback via submissions
};

type Msg = {
  id: string;
  candidate_id: string;
  author_id: string | null;
  author_role: "admin" | "candidate" | null;
  sender_role: "admin" | "candidate" | null;
  content: string; // text || body (normalisé)
  created_at: string;
  read_by_admin?: boolean;
};

// --- helpers
const normalizeMsg = (row: any): Msg => ({
  id: row.id,
  candidate_id: row.candidate_id,
  author_id: row.author_id ?? null,
  author_role: (row.author_role ?? null) as "admin" | "candidate" | null,
  sender_role: (row.sender_role ?? row.author_role ?? null) as "admin" | "candidate" | null,
  content: row.text ?? row.body ?? "",
  created_at: row.created_at,
  read_by_admin: row.read_by_admin,
});

const displayName = (c: CandidateRow | null) => {
  if (!c) return "Sélectionnez un candidat";
  const p = c.profile;
  return p?.full_name || p?.email || "Candidat";
};

async function resolveSubmissionId(userId: string) {
  const { data } = await supabase
    .from("propulse_candidates")
    .select("submission_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.submission_id ?? null;
}

const AdminMessagesPage: React.FC = () => {
  const [me, setMe] = useState<any>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [unreads, setUnreads] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<CandidateRow | null>(null);
  const [rows, setRows] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [snack, setSnack] = useState<{open:boolean; msg:string; sev:"success"|"error"|"info"}>({
    open:false, msg:"", sev:"success"
  });

  const listRef = useRef<HTMLDivElement>(null);
  const scrollBottom = () =>
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));

  // recherche côté client
  const filtered = useMemo(() => {
    if (!query.trim()) return candidates;
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      const p = c.profile;
      return (p?.full_name || "").toLowerCase().includes(q) || (p?.email || "").toLowerCase().includes(q);
    });
  }, [candidates, query]);

  // ---- bootstrap (liste candidats + non-lus)
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      setMe(data?.user || null);

      // 1) derniers candidats (dédup par user_id)
      const { data: candsRaw } = await supabase
        .from("propulse_candidates")
        .select("user_id, submission_id, created_at")
        .order("created_at", { ascending: false });

      const map = new Map<string, CandidateRow>();
      (candsRaw || []).forEach((c: any) => {
        if (!map.has(c.user_id)) map.set(c.user_id, c as CandidateRow);
      });
      const dedup = Array.from(map.values());

      // 2) profils direct
      const userIds = dedup.map((c) => c.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profMap = new Map((profs || []).map((p: any) => [p.id, p as Profile]));

      // 3) fallback via submissions si profil absent (pour éviter d’afficher l’ID)
      const subIds = dedup.map((c) => c.submission_id).filter(Boolean) as string[];
      let subMap = new Map<string, any>();
      if (subIds.length) {
        const { data: subs } = await supabase
          .from("campaign_submissions")
          .select("id, form_data")
          .in("id", subIds);
        subMap = new Map((subs || []).map((s: any) => [s.id, s.form_data || {}]));
      }

      const withProfiles = dedup.map((c) => {
        const p = profMap.get(c.user_id);
        if (p) return { ...c, profile: p };
        const fd = c.submission_id ? subMap.get(c.submission_id) : null;
        if (fd) {
          const fallback: Profile = {
            id: c.user_id,
            full_name: fd.full_name || null,
            email: fd.email || null,
          };
          return { ...c, profile: fallback };
        }
        return { ...c, profile: { id: c.user_id, full_name: null, email: null } as Profile };
      });

      setCandidates(withProfiles);

      // 4) non lus globaux (messages entrants du candidat)
      const { data: unreadRows } = await supabase
        .from("propulse_messages")
        .select("candidate_id, sender_role, read_by_admin")
        .eq("sender_role", "candidate")
        .eq("read_by_admin", false);

      const unreadMap: Record<string, number> = {};
      (unreadRows || []).forEach((m: any) => {
        unreadMap[m.candidate_id] = (unreadMap[m.candidate_id] || 0) + 1;
      });
      setUnreads(unreadMap);

      setLoading(false);
    };
    run();
  }, []);

  // ---- charger un fil + live + marquer lus
  useEffect(() => {
    if (!selected) return;

    const loadThread = async () => {
      // on sécurise le submission_id (peut être manquant sur l’objet sélectionné)
      const sid = selected.submission_id || await resolveSubmissionId(selected.user_id);

      // 1) lecture : par candidate_id OU par submission_id (pour rattraper les lignes mal indexées)
      let querySel = supabase
        .from("propulse_messages")
        .select("id,candidate_id,author_id,author_role,sender_role,text,body,created_at,read_by_admin")
        .order("created_at", { ascending: true });

      if (sid) {
        querySel = querySel.or(`candidate_id.eq.${selected.user_id},submission_id.eq.${sid}`);
      } else {
        // fallback sain si pas de submission
        querySel = querySel.eq("candidate_id", selected.user_id);
      }

      const { data: thr } = await querySel;
      setRows((thr || []).map(normalizeMsg));
      scrollBottom();

      // 2) marquer comme lus ce qui vient du candidat
      await supabase
        .from("propulse_messages")
        .update({ read_by_admin: true })
        .eq("candidate_id", selected.user_id)
        .eq("sender_role", "candidate")
        .eq("read_by_admin", false);

      setUnreads((u) => ({ ...u, [selected.user_id]: 0 }));

      // 3) realtime : 2 filtres → candidate_id et submission_id (si dispo)
      const ch = supabase
        .channel(`pm_admin_${selected.user_id}_${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "propulse_messages", filter: `candidate_id=eq.${selected.user_id}` },
          (payload: any) => {
            const m = normalizeMsg(payload.new);
            setRows((r) => (r.some(x => x.id === m.id) ? r : [...r, m]));
            if (m.sender_role === "candidate") {
              setUnreads((u) => ({ ...u, [selected.user_id]: 0 }));
              supabase
                .from("propulse_messages")
                .update({ read_by_admin: true })
                .eq("candidate_id", selected.user_id)
                .eq("sender_role", "candidate")
                .eq("read_by_admin", false);
            }
            scrollBottom();
          }
        );

      if (sid) {
        ch.on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "propulse_messages", filter: `submission_id=eq.${sid}` },
          (payload: any) => {
            const m = normalizeMsg(payload.new);
            setRows((r) => (r.some(x => x.id === m.id) ? r : [...r, m]));
            // Pas besoin de marquer ici, seuls les messages candidats sont concernés pour read_by_admin
            scrollBottom();
          }
        );
      }

      ch.subscribe();

      return () => { supabase.removeChannel(ch); };
    };

    const unsub = loadThread();
    return () => { /* cleanup via retour de loadThread */ };
  }, [selected?.user_id, selected?.submission_id]);

  // ---- envoyer (on garantit un submission_id avant insert)
  const send = async () => {
    if (!me?.id || !selected || !text.trim() || sending) return;

    // 1) Garantir un submission_id
    const sid = selected.submission_id || await resolveSubmissionId(selected.user_id);
    if (!sid) {
      setSnack({
        open: true,
        msg: "Ce candidat n’a pas encore de soumission (Phase 2). Message non envoyé.",
        sev: "error",
      });
      return;
    }
    // mémorise localement pour les prochains envois
    if (!selected.submission_id) {
      setSelected((s) => (s ? { ...s, submission_id: sid } : s));
      setCandidates((list) =>
        list.map((c) => (c.user_id === selected.user_id ? { ...c, submission_id: sid } : c))
      );
    }

    // 2) Insertion
    const value = text.trim();
    setText("");
    setSending(true);

    const payload = {
      candidate_id: selected.user_id,   // fil du candidat (affichage)
      submission_id: sid,               // clé de regroupement (rattrape les lignes mal indexées)
      author_id: me.id,
      author_role: "admin" as const,
      sender_role: "admin" as const,
      text: value,
      body: value,
    };

    const { data, error } = await supabase
      .from("propulse_messages")
      .insert(payload)
      .select("id,candidate_id,author_id,author_role,sender_role,text,body,created_at")
      .single();

    setSending(false);

    if (error) {
      setSnack({ open: true, msg: error.message || "Échec de l’envoi", sev: "error" });
      setText(value);
      return;
    }

    if (data) {
      setRows((r) => [...r, normalizeMsg(data)]);
      scrollBottom();
    }
    
  };

  // ---- UI
  return (
    <Box p={4} sx={{ display: "grid", gridTemplateColumns: { md: "340px 1fr" }, gap: 2 }}>
      {/* Liste candidats */}
      <Box>
        <Typography variant="h5" fontWeight={800} gutterBottom>Candidats</Typography>
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box p={1.5}>
            <TextField
              fullWidth size="small" placeholder="Rechercher…"
              value={query} onChange={(e) => setQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
          </Box>
          <Divider />
          <List dense sx={{ maxHeight: 520, overflow: "auto" }}>
            {loading && (
              <Box p={2} display="flex" justifyContent="center">
                <CircularProgress size={20} />
              </Box>
            )}
            {!loading && filtered.map((c) => {
              const title = c.profile?.full_name || c.profile?.email || "Candidat";
              const subtitle = c.profile?.email || (c.profile?.full_name ? "" : "—");
              return (
                <ListItemButton
                  key={c.user_id}
                  selected={c.user_id === selected?.user_id}
                  onClick={() => setSelected(c)}
                >
                  <ListItemText primary={title} secondary={subtitle} />
                  <Badge color="error" badgeContent={unreads[c.user_id] || 0} />
                </ListItemButton>
              );
            })}
          </List>
        </Card>
      </Box>

      {/* Fil */}
      <Box>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          {displayName(selected)}
        </Typography>
        <Card sx={{ height: "70vh", display: "flex", flexDirection: "column", borderRadius: 3 }}>
          <CardContent sx={{ flex: 1, overflow: "auto" }} ref={listRef}>
            {!selected && <Box p={2}><Typography color="text.secondary">— Aucun fil ouvert —</Typography></Box>}
            {selected && rows.map((m) => {
              const mine = m.sender_role === "admin" || m.author_role === "admin";
              return (
                <Box
                  key={m.id}
                  sx={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    bgcolor: mine ? "primary.main" : "grey.100",
                    color: mine ? "white" : "text.primary",
                    borderRadius: 2,
                    p: 1.2,
                    my: .5,
                    maxWidth: "75%",
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: .8 }}>
                    {new Date(m.created_at).toLocaleString("fr-FR")}
                  </Typography>
                </Box>
              );
            })}
          </CardContent>
          <Divider />
          <Box p={2} display="flex" gap={1} alignItems="center">
            <TextField
              fullWidth size="small" placeholder="Écrire un message…"
              value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={!selected || sending}
            />
            <IconButton color="primary" onClick={send} disabled={!selected || sending}>
              <SendIcon />
            </IconButton>
          </Box>
        </Card>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({...s, open:false}))}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack(s => ({...s, open:false}))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminMessagesPage;

// src/pages/MessagesPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, IconButton,
  CircularProgress, List, ListItem, ListItemText, Tooltip, Snackbar, Alert
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { supabase } from "../lib/supabase";

type DbMsg = {
  id: string;
  candidate_id: string;
  author_id: string | null;
  author_role: "admin" | "candidate" | null;
  sender_role: "admin" | "candidate" | null;
  body: string | null;
  text: string | null;
  read_by_admin: boolean | null;
  read_by_candidate: boolean | null;
  created_at: string;
};

const MessagesPage: React.FC = () => {
  const [me, setMe] = useState<any>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [rows, setRows] = useState<DbMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" }>({
    open: false, msg: "", sev: "success",
  });
  const listRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => {
    requestAnimationFrame(() =>
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
    );
  };

  const getMsgText = (m: DbMsg) => m.text ?? m.body ?? "";

  // —————————————————————————————————————————————
  // Marquer comme lus les messages ADMIN de ce fil
  // (uniquement via candidate_id pour éviter le 400)
  // —————————————————————————————————————————————
  const markThreadReadCandidate = async (candidateId: string) => {
    try {
      await supabase
        .from("propulse_messages")
        .update({ read_by_candidate: true })
        .eq("candidate_id", candidateId)
        .eq("sender_role", "admin")
        .eq("read_by_candidate", false);
    } catch {
      /* no-op */
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      // 1) Utilisateur
      const { data: userRes } = await supabase.auth.getUser();
      const u = userRes?.user || null;
      setMe(u);
      if (!u?.id) { setLoading(false); return; }

      // 2) Dernière submission liée (utile pour l’affichage des anciens msgs)
      const { data: candRow } = await supabase
        .from("propulse_candidates")
        .select("submission_id")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const sid = candRow?.submission_id ?? null;
      setSubmissionId(sid);

      // 3) Charger le fil (par candidate_id OU submission_id)
      let q = supabase
        .from("propulse_messages")
        .select("id,candidate_id,author_id,author_role,sender_role,body,text,read_by_admin,read_by_candidate,created_at")
        .order("created_at", { ascending: true });

      if (sid) {
        q = q.or(`candidate_id.eq.${u.id},submission_id.eq.${sid}`);
      } else {
        q = q.eq("candidate_id", u.id);
      }

      const { data: msgs, error } = await q;
      if (error) setSnack({ open: true, msg: error.message, sev: "error" });

      // dédoublonnage par id (au cas où un msg ressort par les 2 clauses)
      const unique = Array.from(new Map((msgs || []).map(m => [m.id, m])).values());
      setRows(unique as DbMsg[]);

      // 4) Marquer lus les messages admin (via candidate_id)
      await markThreadReadCandidate(u.id);

      // 5) Realtime
      const channel = supabase
        .channel(`pm_${u.id}_${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "propulse_messages", filter: `candidate_id=eq.${u.id}` },
          async (payload: any) => {
            const m = payload.new as DbMsg;
            setRows((r) => (r.some(x => x.id === m.id) ? r : r.concat(m)));
            if ((m.sender_role ?? m.author_role) === "admin") {
              await markThreadReadCandidate(u.id);
            }
            scrollBottom();
          }
        );

      if (sid) {
        channel.on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "propulse_messages", filter: `submission_id=eq.${sid}` },
          async (payload: any) => {
            const m = payload.new as DbMsg;
            setRows((r) => (r.some(x => x.id === m.id) ? r : r.concat(m)));
            if ((m.sender_role ?? m.author_role) === "admin") {
              await markThreadReadCandidate(u.id);
            }
            scrollBottom();
          }
        );
      }

      channel.subscribe();

      setLoading(false);
      scrollBottom();

      return () => { supabase.removeChannel(channel); };
    };

    run();
  }, []);

  useEffect(scrollBottom, [rows.length]);

  const send = async () => {
    const value = text.trim();
    if (!me?.id || !value || sending) return;

    if (!submissionId) {
      setSnack({
        open: true,
        msg: "Impossible d’envoyer : aucune soumission Phase 2 liée à votre compte.",
        sev: "error",
      });
      return;
    }

    setSending(true);
    setText("");

    const payload = {
      submission_id: submissionId,
      candidate_id: me.id,
      author_id: me.id,
      author_role: "candidate" as const,
      sender_role: "candidate" as const,
      text: value,
      body: value,
    };

    // optimistic UI
    const optimistic: DbMsg = {
      id: `tmp_${Date.now()}`,
      candidate_id: me.id,
      author_id: me.id,
      author_role: "candidate",
      sender_role: "candidate",
      body: value,
      text: value,
      read_by_admin: false,
      read_by_candidate: true,
      created_at: new Date().toISOString(),
    };
    setRows((r) => r.concat(optimistic));

    const { data, error } = await supabase
      .from("propulse_messages")
      .insert(payload)
      .select("id,candidate_id,author_id,author_role,sender_role,body,text,read_by_admin,read_by_candidate,created_at")
      .single();

    setSending(false);

    if (error) {
      setRows((r) => r.filter((x) => x.id !== optimistic.id));
      setText(value);
      setSnack({ open: true, msg: error.message || "Échec de l’envoi", sev: "error" });
      return;
    }

    setRows((r) => r.filter((x) => x.id !== optimistic.id).concat(data as DbMsg));
    scrollBottom();
  };

  if (loading) {
    return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (!me) {
    return <Box p={4}><Typography>Connectez-vous pour accéder à la messagerie.</Typography></Box>;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={800} gutterBottom>💬 Messagerie</Typography>

      <Card sx={{ height: "70vh", display: "flex", flexDirection: "column", borderRadius: 3 }}>
        <CardContent sx={{ flex: 1, overflow: "auto", p: 2 }} ref={listRef}>
          <List sx={{ display: "flex", flexDirection: "column", gap: 1, p: 0 }}>
            {rows.map((m) => {
              const mine = (m.sender_role ?? m.author_role) === "candidate";
              return (
                <ListItem
                  key={m.id}
                  sx={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    bgcolor: mine ? "primary.main" : "grey.100",
                    color: mine ? "primary.contrastText" : "text.primary",
                    borderRadius: 2,
                    maxWidth: "80%",
                    boxShadow: 1,
                    px: 1.5,
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{ sx: { whiteSpace: "pre-wrap" } }}
                    primary={getMsgText(m)}
                    secondary={new Date(m.created_at).toLocaleString("fr-FR")}
                    secondaryTypographyProps={{
                      sx: { opacity: .8, color: mine ? "rgba(255,255,255,.8)" : "text.secondary" },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>

        <Box p={2} display="flex" gap={1} alignItems="center">
          <TextField
            fullWidth size="small"
            placeholder="Écrire un message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            multiline
            minRows={1}
            maxRows={5}
          />
          <Tooltip title="Envoyer (Entrée)">
            <span>
              <IconButton color="primary" onClick={send} disabled={sending || !text.trim()}>
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagesPage;

// src/pages/AdminPhase2Page.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, TextField, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Alert, CircularProgress, Divider, IconButton
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { fetchApi } from "../lib/fetcher";
import { supabase } from "../lib/supabase";

const colorByStatus: Record<string, any> = {
  phase2: "default",
  interview_scheduled: "info",
  rejected: "error",
  completed: "success",
};

const storageKeyFromUrl = (url: string) => {
  const idx = url.indexOf("/documents/");
  if (idx >= 0) return url.substring(idx + "/documents/".length);
  return url;
};
const formatDate = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

export default function AdminPhase2Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // détails
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [docs, setDocs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      // On garde ton endpoint existant qui renvoie déjà les jointures utiles
      const res = await fetchApi("/propulse/phase2");
      setRows(res?.data || []);
    } catch (e: any) {
      setErr(e?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r: any) => {
      const name = r.profiles?.full_name || "";
      const proj = r.campaign_submissions?.form_data?.project_name || "";
      const email = r.profiles?.email || "";
      return (name + " " + proj + " " + email).toLowerCase().includes(q);
    });
  }, [rows, search]);

  // -- Quand on ouvre un dossier, charge messages + docs via Supabase (RLS)
  useEffect(() => {
    const run = async () => {
      if (!selected?.id) return;
      const sid = selected?.campaign_submissions?.id;
      const uid = selected?.user_id;

      const { data: msgs } = await supabase
        .from("propulse_messages")
        .select("*")
        .eq("submission_id", sid)
        .order("created_at", { ascending: true });
      setMessages(msgs || []);

      const { data: d } = await supabase
        .from("documents_investor")
        .select("*")
        .eq("user_id", uid)
        .ilike("file_type", "propulse_%")
        .order("uploaded_at", { ascending: false });
      setDocs(d || []);
    };
    run();
  }, [selected?.id]);

  const updateStatus = async (patch: any) => {
    if (!selected) return;
    try {
      setSaving(true);
      await fetchApi(`/propulse/phase2/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await load();
      setSelected((s: any) => ({ ...s, ...patch }));
    } catch (e: any) {
      alert(e?.message || "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const sendAdminMessage = async () => {
    if (!selected?.campaign_submissions?.id || !msg.trim()) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("propulse_messages").insert({
        submission_id: selected.campaign_submissions.id,
        author_role: "admin",
        body: msg.trim(),
      });
      if (error) throw error;
      setMsg("");
      const { data: msgs } = await supabase
        .from("propulse_messages")
        .select("*")
        .eq("submission_id", selected.campaign_submissions.id)
        .order("created_at", { ascending: true });
      setMessages(msgs || []);
    } catch (e: any) {
      alert(e.message || "Envoi impossible");
    } finally {
      setSaving(false);
    }
  };

  const openDoc = async (doc: any) => {
    try {
      const key = storageKeyFromUrl(doc.file_url);
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(key, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      alert(e.message || "Ouverture impossible");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Propulse — Phase 2</Typography>

      <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Recherche candidat/projet..." fullWidth sx={{ mb: 3 }} />

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {loading && <Box py={6} display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box>}

      {!loading && filtered.length === 0 && !err && (
        <Alert severity="info">Aucun dossier en Phase 2 pour le moment.</Alert>
      )}

      {!loading && filtered.map((r: any) => (
        <Box
          key={r.id}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb", cursor: "pointer" }}
          onClick={() => setSelected(r)}
        >
          <Typography fontWeight={600}>
            {r.profiles?.full_name || "—"} — {r.campaign_submissions?.form_data?.project_name || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {r.campaign_submissions?.city || "—"}, {r.campaign_submissions?.country || "—"} • {r.profiles?.email || "—"}
          </Typography>
          <Box mt={1}>
            <Chip size="small" label={r.status || "phase2"} color={colorByStatus[r.status] || "default"} />
          </Box>
        </Box>
      ))}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>Dossier — {selected?.profiles?.full_name}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2}>
              <Typography><strong>Projet :</strong> {selected.campaign_submissions?.form_data?.project_name || "—"}</Typography>
              <Typography><strong>Pitch vidéo :</strong> {selected.campaign_submissions?.youtube_link || "—"}</Typography>

              <Divider />

              <Typography variant="subtitle1" fontWeight={700}>Documents</Typography>
              {docs.length === 0 && <Typography variant="body2" color="text.secondary">Aucun document.</Typography>}
              {docs.map((d) => {
                const name = storageKeyFromUrl(d.file_url).split("/").pop();
                return (
                  <Stack key={d.id} direction="row" alignItems="center" gap={1}>
                    <Chip size="small" label={d.file_type} variant="outlined" />
                    <Typography variant="body2">{name}</Typography>
                    <IconButton size="small" onClick={() => openDoc(d)}><OpenInNewIcon fontSize="small" /></IconButton>
                    <Typography variant="caption" color="text.secondary">({d.status || "en_attente"})</Typography>
                  </Stack>
                );
              })}

              <Divider />

              <Typography variant="subtitle1" fontWeight={700}>Échanges</Typography>
              {messages.length === 0 && (
                <Alert severity="info">Aucun message pour l’instant.</Alert>
              )}
              <Stack spacing={1}>
                {messages.map((m) => (
                  <Box key={m.id} sx={{ p: 1.2, borderRadius: 1, bgcolor: m.author_role === "admin" ? "rgba(0,120,255,.08)" : "rgba(0,200,83,.08)" }}>
                    <Typography variant="caption" color="text.secondary">
                      {m.author_role === "admin" ? "Admin" : "Candidat"} • {formatDate(m.created_at)}
                    </Typography>
                    <Typography variant="body2">{m.body}</Typography>
                  </Box>
                ))}
              </Stack>
              <TextField
                placeholder="Envoyer un message (visible par le candidat)"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                multiline minRows={2}
              />

              <Divider />

              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button onClick={sendAdminMessage} disabled={!msg.trim() || saving} variant="contained">Envoyer</Button>
                <Button onClick={() => updateStatus({ status: "interview_scheduled" })}>Planifier entretien</Button>
                <Button color="error" onClick={() => updateStatus({ status: "rejected" })}>Rejeter</Button>
                <Button color="success" onClick={() => updateStatus({ status: "completed" })}>Marquer “traité”</Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// src/pages/PropulsePhase2Page.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Stepper, Step, StepLabel,
  Grid, TextField, Chip, LinearProgress, IconButton, Link as MLink,
  Tooltip, Divider, Alert, Snackbar, Stack
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { supabase } from "../lib/supabase";

type DocItem = {
  id: string;
  user_id: string;
  file_type: string;
  file_url: string;
  status?: "en_attente" | "valide" | "rejete";
  uploaded_at?: string;
  commentaire?: string | null;
};

const REQUIRED_TYPES = [
  { code: "propulse_pitch_deck", label: "Pitch deck (PDF)", accept: ".pdf", hint: "PDF, 50 Mo max" },
  { code: "propulse_id", label: "Pièce d’identité (PDF/JPG/PNG)", accept: ".pdf,.jpg,.jpeg,.png", hint: "PDF/JPG/PNG, 20 Mo max" },
];

const formatDate = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

const storageKeyFromUrl = (url: string) => {
  const idx = url.indexOf("/documents/");
  if (idx >= 0) return url.substring(idx + "/documents/".length);
  return url;
};

export default function PropulsePhase2Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [phase1, setPhase1] = useState<any>(null);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [youtube, setYoutube] = useState("");
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
    open: false, msg: "", severity: "success",
  });

  const docByType = (t: string) => docs.find((d) => d.file_type === t);
  const allRequiredUploaded = REQUIRED_TYPES.every((t) => !!docByType(t.code));
  const youtubeOk = useMemo(() => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(youtube), [youtube]);
  const progress = useMemo(() => {
    const total = REQUIRED_TYPES.length + 1;
    let done = REQUIRED_TYPES.filter((t) => !!docByType(t.code)).length;
    if (youtubeOk) done += 1;
    return Math.round((done / total) * 100);
  }, [docs, youtubeOk]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const u = userRes?.user || null;
        setUser(u);
        if (!u?.id) {
          setSnack({ open: true, msg: "Vous devez être connecté pour accéder à la Phase 2.", severity: "error" });
          setLoading(false);
          return;
        }

        // A) Candidat rattaché (dernier en date)
        const { data: cand } = await supabase
          .from("propulse_candidates")
          .select("id, user_id, submission_id, status, created_at")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setCandidate(cand || null);

        // B) Submission Phase 2
        if (cand?.submission_id) {
          const { data: sub } = await supabase
            .from("campaign_submissions")
            .select("id, form_data, city, country, youtube_link, analytics_data, created_at")
            .eq("id", cand.submission_id)
            .maybeSingle();
          setSubmission(sub || null);
          setYoutube(sub?.youtube_link || "");
        } else {
          setSubmission(null);
        }

        // C) Dernière Phase 1 validée (lecture seule)
        const { data: p1 } = await supabase
          .from("campaign_submissions")
          .select("id, form_data, created_at")
          .eq("form_data->>email", u.email as string)
          .eq("phase", 1)
          .eq("status", "validated")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setPhase1(p1 || null);

        // D) Documents propulse_* du user (⚠️ table correcte)
        const { data: myDocs } = await supabase
          .from("propulse_documents")
          .select("*")
          .eq("user_id", u.id)
          .ilike("file_type", "propulse_%")
          .order("uploaded_at", { ascending: false });
        setDocs(myDocs || []);
      } catch (e: any) {
        console.error(e);
        setSnack({ open: true, msg: e.message || "Erreur de chargement", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const openDoc = async (doc: DocItem) => {
    try {
      const key = storageKeyFromUrl(doc.file_url);
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(key, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || "Ouverture impossible (URL signée)", severity: "error" });
    }
  };

  const handleUpload = async (file: File, typeCode: string) => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const ext = file.name.split(".").pop() || "bin";
      const path = `propulse/${user.id}/${typeCode}_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
      if (upErr) throw upErr;

      const { error: insErr, data } = await supabase
        .from("propulse_documents")
        .insert({
          user_id: user.id,
          file_type: typeCode,
          file_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/private/documents/${path}`,
          status: "en_attente",
          commentaire: null,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      setDocs((prev) => [data as any].concat(prev.filter((d) => d.file_type !== typeCode)));
      setSnack({ open: true, msg: "Fichier envoyé ✅", severity: "success" });
    } catch (e: any) {
      console.error(e);
      setSnack({ open: true, msg: e.message || "Échec de l’upload", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (doc: DocItem) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      setSaving(true);
      const storageKey = storageKeyFromUrl(doc.file_url);
      if (storageKey) {
        await supabase.storage.from("documents").remove([storageKey]);
      }
      await supabase.from("propulse_documents").delete().eq("id", doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || "Suppression impossible", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveYoutube = async () => {
    if (!submission?.id) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("campaign_submissions")
        .update({ youtube_link: youtube })
        .eq("id", submission.id);
      if (error) throw error;
      setSnack({ open: true, msg: "Lien vidéo enregistré ✅", severity: "success" });
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || "Échec de la mise à jour", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async () => {
    if (!submission?.id) return;
    try {
      setSaving(true);
      const analytics = {
        ...(submission.analytics_data || {}),
        phase2_submitted: true,
        phase2_submitted_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("campaign_submissions")
        .update({ analytics_data: analytics })
        .eq("id", submission.id);
      if (error) throw error;
      setSubmission((s: any) => ({ ...s, analytics_data: analytics }));
      setSnack({ open: true, msg: "Phase 2 envoyée 🎉", severity: "success" });
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || "Échec de l’envoi", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography variant="h5" fontWeight={700} mb={2}>Propulse — Phase 2</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!user) {
    return <Box p={4}><Alert severity="error">Connectez-vous pour accéder à votre espace Propulse.</Alert></Box>;
  }

  if (!submission) {
    return (
      <Box p={4}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Propulse — Phase 2</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucune candidature phase 2 trouvée pour <strong>{user.email}</strong>.
        </Alert>
        <Typography color="text.secondary">
          Si vous venez d’être validé(e), réessayez dans quelques minutes ou contactez l’équipe.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {phase1 && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Votre dossier Phase 1 (lecture seule) — envoyé le {formatDate(phase1.created_at)}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}><strong>Nom</strong><div>{phase1.form_data?.full_name || "—"}</div></Grid>
              <Grid item xs={12} md={4}><strong>Projet</strong><div>{phase1.form_data?.project_name || "—"}</div></Grid>
              <Grid item xs={12} md={4}><strong>Besoin de financement</strong><div>{phase1.form_data?.funding_need || "—"}</div></Grid>
            </Grid>
            <MLink href="/dashboard/propulse-phase1" underline="hover">Voir tout le dossier Phase 1</MLink>
          </CardContent>
        </Card>
      )}

      <Typography variant="h4" fontWeight={800} gutterBottom>🚀 Propulse — Phase 2</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={700}>Votre check-list</Typography>
                <Chip
                  label={submission?.analytics_data?.phase2_submitted ? "Envoyée" : "En préparation"}
                  color={submission?.analytics_data?.phase2_submitted ? "success" : "default"}
                  size="small"
                />
              </Box>

              <Box mb={2}>
                <LinearProgress variant="determinate" value={progress} />
                <Box mt={0.5}><Typography variant="caption" color="text.secondary">Progression : {progress}%</Typography></Box>
              </Box>

              <Stepper
                activeStep={Math.min(
                  REQUIRED_TYPES.filter((t) => !!docByType(t.code)).length + (youtubeOk ? 1 : 0),
                  REQUIRED_TYPES.length + 1
                )}
                alternativeLabel
              >
                {REQUIRED_TYPES.map((t) => (
                  <Step key={t.code} completed={!!docByType(t.code)}><StepLabel>{t.label}</StepLabel></Step>
                ))}
                <Step key="video" completed={youtubeOk}><StepLabel>Pitch vidéo (YouTube)</StepLabel></Step>
              </Stepper>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                {REQUIRED_TYPES.map((t) => {
                  const existing = docByType(t.code);
                  const fileName = existing ? storageKeyFromUrl(existing.file_url).split("/").pop() : "";
                  return (
                    <Grid item xs={12} md={6} key={t.code}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={700}>{t.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.hint}</Typography>

                          <Stack direction="row" gap={1} alignItems="center" mt={2} flexWrap="wrap">
                            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} disabled={saving}>
                              Importer
                              <input
                                hidden type="file" accept={t.accept}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  e.currentTarget.value = "";
                                  if (f) handleUpload(f, t.code);
                                }}
                              />
                            </Button>

                            {existing ? (
                              <>
                                <Chip
                                  size="small"
                                  icon={
                                    existing.status === "valide" ? (
                                      <CheckCircleIcon color="success" />
                                    ) : existing.status === "rejete" ? (
                                      <DeleteOutlineIcon color="error" />
                                    ) : (
                                      <HourglassEmptyIcon />
                                    )
                                  }
                                  label={existing.status || "en_attente"}
                                  variant="outlined"
                                />
                                <Tooltip title={`Ouvrir ${fileName || "le fichier"}`}>
                                  <IconButton size="small" onClick={() => openDoc(existing)}>
                                    <OpenInNewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton size="small" onClick={() => deleteDoc(existing)}>
                                    <DeleteOutlineIcon fontSize="small" color="error" />
                                  </IconButton>
                                </Tooltip>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                  {fileName}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="caption" color="text.secondary">Aucun fichier</Typography>
                            )}
                          </Stack>

                          {existing?.commentaire && (
                            <Alert sx={{ mt: 2 }} severity={existing.status === "rejete" ? "error" : "info"}>
                              {existing.commentaire}
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <Card variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Pitch vidéo (YouTube)</Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField fullWidth placeholder="https://youtube.com/..." value={youtube} onChange={(e) => setYoutube(e.target.value)} size="small" />
                    <Button variant="outlined" onClick={saveYoutube} disabled={!youtube} sx={{ whiteSpace: "nowrap" }}>Enregistrer</Button>
                  </Box>
                  {!youtubeOk && !!youtube && (
                    <Typography mt={1} variant="caption" color="error">Lien YouTube invalide.</Typography>
                  )}
                </CardContent>
              </Card>

              <Box display="flex" gap={2} mt={3}>
                <Button variant="contained" color="success" onClick={markCompleted} disabled={!allRequiredUploaded || !youtubeOk || saving}>
                  J’ai terminé – Envoyer ma phase 2
                </Button>
                <MLink href="https://djivede.com/propulse" target="_blank" rel="noreferrer" underline="hover" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  En savoir plus sur Propulse <OpenInNewIcon fontSize="small" />
                </MLink>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Récapitulatif candidature</Typography>
              <Box mb={1}>
                <Typography variant="body2"><strong>Nom :</strong> {submission?.form_data?.full_name}</Typography>
                <Typography variant="body2"><strong>Email :</strong> {submission?.form_data?.email}</Typography>
                <Typography variant="body2"><strong>Projet :</strong> {submission?.form_data?.project_name}</Typography>
                <Typography variant="body2"><strong>Ville :</strong> {submission?.city} — <strong>Pays :</strong> {submission?.country}</Typography>
                <Typography variant="caption" color="text.secondary">Créé le {formatDate(submission?.created_at)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>Statut d’examen des pièces</Typography>
              <Box display="grid" gap={1}>
                {REQUIRED_TYPES.map((t) => {
                  const d = docByType(t.code);
                  return (
                    <Chip
                      key={t.code}
                      label={`${t.label} — ${d ? (d.status || "en_attente") : "manquant"}`}
                      color={d ? (d.status === "valide" ? "success" : d.status === "rejete" ? "error" : "warning") : "default"}
                      variant="outlined" size="small"
                    />
                  );
                })}
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Une fois envoyée, l’équipe vous proposera un créneau d’entretien. Les échanges se font ici.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} onClose={() => setSnack((s) => ({ ...s, open: false }))} autoHideDuration={3000} message={snack.msg} />
    </Box>
  );
}

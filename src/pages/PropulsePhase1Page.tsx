// src/pages/PropulsePhase1Page.tsx
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, Chip, Divider, Alert, LinearProgress } from "@mui/material";
import { supabase } from "../lib/supabase";

const formatDate = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

export default function PropulsePhase1Page() {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: ures } = await supabase.auth.getUser();
      const u = ures?.user || null;
      setUser(u);
      if (!u?.email) { setLoading(false); return; }
      const { data: p1 } = await supabase
        .from("campaign_submissions")
        .select("id, form_data, created_at, status")
        .eq("form_data->>email", u.email as string)
        .eq("phase", 1)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubmission(p1 || null);
      setLoading(false);
    };
    run();
  }, []);

  if (loading) {
    return (
      <Box p={4}><Typography variant="h5" fontWeight={700} mb={2}>Votre dossier Phase 1</Typography><LinearProgress /></Box>
    );
  }

  if (!submission) {
    return (
      <Box p={4}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Votre dossier Phase 1</Typography>
        <Alert severity="info">Aucun dossier Phase 1 trouvé pour {user?.email}.</Alert>
      </Box>
    );
  }

  const f = submission.form_data || {};

  const fields: { key: string; label: string }[] = [
    { key: "full_name", label: "Nom complet" },
    { key: "project_name", label: "Nom du projet" },
    { key: "funding_need", label: "Besoin de financement" },
    { key: "project_stage", label: "Maturité du projet" },
    { key: "business_model", label: "Modèle économique" },
    { key: "project_summary", label: "Résumé" },
    { key: "social_impact", label: "Impact social" },
    { key: "success_metrics", label: "Indicateurs de succès" },
    { key: "target_audience", label: "Public cible" },
    { key: "challenges_faced", label: "Défis" },
    { key: "marketing_strategy", label: "Stratégie marketing" },
    { key: "previous_experience", label: "Expériences" },
    { key: "competition_analysis", label: "Concurrence" },
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={800} gutterBottom>Votre dossier Phase 1 (lecture seule)</Typography>
      <Typography variant="caption" color="text.secondary">
        Envoyé le {formatDate(submission.created_at)} — <Chip size="small" label={submission.status} />
      </Typography>

      <Card sx={{ mt: 2, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {fields.map((it) => (
              <Grid item xs={12} md={6} key={it.key}>
                <Typography variant="overline" color="text.secondary">{it.label}</Typography>
                <Typography variant="body1">{f[it.key] || "—"}</Typography>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary">Email</Typography>
          <Typography>{f.email || user?.email}</Typography>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Toute modification de ces informations doit passer par l’équipe Djivèdé.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

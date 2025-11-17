// src/pages/AdminEditProjectPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  InputAdornment,
  Switch,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

type ProjectForm = {
  title: string;
  summary: string;
  description: string;
  expected_return: number;
  duration_months: number;
  target_amount: number;
  minimum_investment: number;
  risk_level: string;
  start_date: string;
  image_url: string;
  type: string;
  prix_par_module: number;
  parts_par_module: number;
  rendement_par_module: number;
  module_label: string;
  video_url: string;
  is_open?: boolean;
};

const AdminEditProjectPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProjectForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---------- style “filled” doux pour tous les champs
  const filledFieldSx = {
    "& .MuiFilledInput-root": {
      borderRadius: 8,
      backgroundColor: "grey.50",
      "&:before, &:after": { borderBottom: "none" },
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
    },
    "& .MuiFilledInput-root.Mui-focused": {
      boxShadow: (theme: any) => `inset 0 0 0 2px ${theme.palette.primary.main}33`,
      backgroundColor: "grey.50",
    },
    "& .MuiInputLabel-root": { fontWeight: 500 },
  } as const;

  // ---------- load project
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("invest_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErrorMsg(error?.message || "Projet introuvable");
      } else {
        setForm({
          title: data.title ?? "",
          summary: data.summary ?? "",
          description: data.description ?? "",
          expected_return: Number(data.expected_return ?? 0),
          duration_months: Number(data.duration_months ?? 0),
          target_amount: Number(data.target_amount ?? 0),
          minimum_investment: Number(data.minimum_investment ?? 0),
          risk_level: data.risk_level ?? "",
          start_date: (data.start_date ?? "").slice(0, 10),
          image_url: data.image_url ?? "",
          type: data.type ?? "modulaire",
          prix_par_module: Number(data.prix_par_module ?? 0),
          parts_par_module: Number(data.parts_par_module ?? 0),
          rendement_par_module: Number(data.rendement_par_module ?? 0),
          module_label: data.module_label ?? "",
          video_url: data.video_url ?? "",
          is_open: data.is_open ?? true,
        });
      }
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const numericKeys = new Set<keyof ProjectForm>([
    "expected_return",
    "duration_months",
    "target_amount",
    "minimum_investment",
    "prix_par_module",
    "parts_par_module",
    "rendement_par_module",
  ]);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (!form) return;
    const { name, value } = e.target as HTMLInputElement;
    const key = name as keyof ProjectForm;

    setForm((prev) => {
      if (!prev) return prev;
      if (numericKeys.has(key)) {
        const num = value === "" ? 0 : Number(value);
        return { ...prev, [key]: isNaN(num) ? 0 : num } as ProjectForm;
        }
      return { ...prev, [key]: value } as ProjectForm;
    });
  };

  const handleSave = async () => {
    if (!form || !id) return;
    setSaving(true);
    setErrorMsg(null);

    // Optionnel : nettoyage de valeurs numériques (éviter NaN côté DB)
    const cleanForm: ProjectForm = {
      ...form,
      expected_return: Number(form.expected_return || 0),
      duration_months: Number(form.duration_months || 0),
      target_amount: Number(form.target_amount || 0),
      minimum_investment: Number(form.minimum_investment || 0),
      prix_par_module: Number(form.prix_par_module || 0),
      parts_par_module: Number(form.parts_par_module || 0),
      rendement_par_module: Number(form.rendement_par_module || 0),
    };

    const { error } = await supabase
      .from("invest_projects")
      .update(cleanForm)
      .eq("id", id);

    setSaving(false);
    if (error) setErrorMsg(error.message);
    else navigate("/dashboard/admin/projects");
  };

  const projectTitle = useMemo(() => form?.title || "Projet", [form]);

  if (loading) {
    return (
      <MDBox p={4}>
        <CircularProgress />
      </MDBox>
    );
  }
  if (errorMsg) {
    return (
      <MDBox p={4}>
        <Alert severity="error">{errorMsg}</Alert>
        <Box mt={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Retour
          </Button>
        </Box>
      </MDBox>
    );
  }
  if (!form) return null;

  return (
    <MDBox p={0} bgcolor="#F8FAFC">
      {/* ✅ Fil d’Ariane global (une seule source de vérité) */}
      

      <MDBox p={4} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            ✏️ Modifier le projet
          </Typography>
          {form.is_open !== undefined && (
            <Chip
              label={form.is_open ? "Ouvert" : "Fermé"}
              color={form.is_open ? "success" : "default"}
              variant="outlined"
            />
          )}
          <Chip label={projectTitle} variant="outlined" />
        </Stack>

        {/* Formulaire */}
        <Grid container spacing={3}>
          {/* Bloc informations principales */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, bgcolor: "background.paper" }}>
              <CardContent sx={{ display: "grid", rowGap: 2 }}>
                <TextField
                  label="Titre du projet"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="filled"
                  sx={filledFieldSx}
                  placeholder="Ex : Ferme Aquacole Durable au Bénin"
                />
                <TextField
                  label="Résumé"
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  variant="filled"
                  sx={filledFieldSx}
                  placeholder="Phrase d’accroche courte…"
                />
                <TextField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={5}
                  variant="filled"
                  sx={filledFieldSx}
                  placeholder="Détaillez le projet, l’équipe, le modèle économique…"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Bloc paramètres financiers */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, bgcolor: "background.paper" }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Rendement prévu"
                      name="expected_return"
                      type="number"
                      value={form.expected_return}
                      onChange={handleChange}
                      fullWidth
                      variant="filled"
                      sx={filledFieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Durée"
                      name="duration_months"
                      type="number"
                      value={form.duration_months}
                      onChange={handleChange}
                      fullWidth
                      variant="filled"
                      sx={filledFieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">mois</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Objectif global"
                      name="target_amount"
                      type="number"
                      value={form.target_amount}
                      onChange={handleChange}
                      fullWidth
                      variant="filled"
                      sx={filledFieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Investissement minimum"
                      name="minimum_investment"
                      type="number"
                      value={form.minimum_investment}
                      onChange={handleChange}
                      fullWidth
                      variant="filled"
                      sx={filledFieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Prix par module"
                      name="prix_par_module"
                      type="number"
                      value={form.prix_par_module}
                      onChange={handleChange}
                      fullWidth
                      variant="filled"
                      sx={filledFieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Rendement par module"
                      name="rendement_par_module"
                      type="number"
                      value={form.rendement_par_module}
                      onChange={handleChange}
                      fullWidth
                      variant="filled"
                      sx={filledFieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Parts par module"
                      name="parts_par_module"
                      type="number"
                      value={form.parts_par_module}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ min: 1 }}
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Libellé du module"
                      name="module_label"
                      value={form.module_label}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Ex : Cage, Bassin, Panneau…"
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Bloc paramètres additionnels */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, bgcolor: "background.paper" }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Niveau de risque"
                      name="risk_level"
                      value={form.risk_level}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Faible / Modéré / Élevé"
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date de démarrage"
                      name="start_date"
                      type="date"
                      value={form.start_date}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="URL image"
                      name="image_url"
                      value={form.image_url}
                      onChange={handleChange}
                      fullWidth
                      placeholder="https://…"
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      fullWidth
                      placeholder="modulaire"
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Lien vidéo"
                      name="video_url"
                      value={form.video_url}
                      onChange={handleChange}
                      fullWidth
                      placeholder="https://youtu.be/…"
                      variant="filled"
                      sx={filledFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Switch
                        checked={!!form.is_open}
                        onChange={(e) =>
                          setForm({ ...(form as ProjectForm), is_open: e.target.checked })
                        }
                      />
                      <Typography>Ouvert aux investissements</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barre d’actions collante */}
        <Paper
          elevation={3}
          sx={{
            position: "sticky",
            bottom: 0,
            mt: 4,
            p: 2,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            bgcolor: "rgba(248,250,252,0.9)", // même ton que le fond de page
            backdropFilter: "blur(4px)",
          }}
        >
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ px: 3 }}>
            {saving ? "Enregistrement…" : "💾 Enregistrer"}
          </Button>
        </Paper>
      </MDBox>
    </MDBox>
  );
};

export default AdminEditProjectPage;

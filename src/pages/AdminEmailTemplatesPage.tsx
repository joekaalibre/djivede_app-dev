import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  Paper,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

const templateTypes = [
  { type: "investment_recorded", label: "✅ Investissement enregistré" },
  { type: "investment_validated", label: "✅ Investissement validé" },
  { type: "investment_rejected", label: "❌ Investissement rejeté" },
  { type: "project_launched", label: "🚀 Lancement de projet" },
];

const AdminEmailTemplatesPage = () => {
  const [selectedType, setSelectedType] = useState("investment_recorded");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ success?: string; error?: string }>({});

  useEffect(() => {
    fetchTemplate(selectedType);
  }, [selectedType]);

  const fetchTemplate = async (type: string) => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("subject, body")
      .eq("code", type)
      .single();

    if (data) {
      setSubject(data.subject);
      setBody(data.body);
      setStatus({});
    } else {
      setSubject("");
      setBody("");
      setStatus({ error: "Modèle non trouvé." });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("email_templates")
      .update({ subject, body, updated_at: new Date().toISOString() })
      .eq("code", selectedType);

    if (error) setStatus({ error: "Erreur lors de la sauvegarde." });
    else setStatus({ success: "Modèle enregistré avec succès." });
  };

  return (
    <MDBox p={4} maxWidth={800} mx="auto" bgcolor="#F8FAFC">
      <Typography variant="h4" fontWeight="bold" gutterBottom color="#0D9488">
        Modèles d'e-mails automatiques
      </Typography>

      <Paper sx={{ p: 4 }} elevation={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Type de modèle"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {templateTypes.map((tpl) => (
                <MenuItem key={tpl.type} value={tpl.type}>
                  {tpl.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Sujet"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Contenu de l'e-mail"
              multiline
              minRows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#0D9488" }}>
              Enregistrer les modifications
            </Button>
          </Grid>

          {status.success && (
            <Grid item xs={12}>
              <Alert severity="success">{status.success}</Alert>
            </Grid>
          )}

          {status.error && (
            <Grid item xs={12}>
              <Alert severity="error">{status.error}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
    </MDBox>
  );
};

export default AdminEmailTemplatesPage;

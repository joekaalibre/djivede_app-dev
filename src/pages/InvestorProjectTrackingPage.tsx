// ✅ InvestorProjectTrackingPage.tsx — avec fil d’Ariane, messages, suivi dynamique

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Chip,
  Breadcrumbs
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface Engagement {
  id: string;
  contract_url?: string;
  contract_signed: boolean;
  project_title: string;
  validated: boolean;
}

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  image_url?: string;
  document_url?: string;
  media_urls?: string;
}

const statusColors: Record<string, any> = {
  terminé: "success",
  en_cours: "warning",
  prévu: "info",
};

const InvestorProjectTrackingPage = () => {
  const { id } = useParams();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEngagement = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("invest_engagements")
        .select("id, contract_url, contract_signed, status, invest_projects(title)")
        .eq("project_id", id)
        .maybeSingle();

      if (error) {
        console.error("Erreur récupération engagement:", error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        navigate("/dashboard/mes-projets");
        return;
      }

      const current: Engagement = {
        id: data.id,
        contract_url: data.contract_url,
        contract_signed: data.contract_signed,
        validated: data.status === "validé",
        project_title: data.invest_projects?.title || "Projet inconnu",
      };

      setEngagement(current);

      // Toujours afficher les phases si l'investissement est validé
      if (current.validated) {
        const { data: updates } = await supabase
          .from("project_updates")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: true });

        setSteps((updates || []) as ProjectStep[]);
      }

      setLoading(false);
    };

    if (id) fetchEngagement();
  }, [id]);

  return (
    <MDBox p={4}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link to="/dashboard">Accueil</Link>
            <Link to="/dashboard/mes-projets">Mes projets</Link>
            <Typography color="text.primary">{engagement?.project_title}</Typography>
          </Breadcrumbs>

          <MDTypography variant="h4" fontWeight="bold" gutterBottom mt={2}>
            Suivi — {engagement?.project_title}
          </MDTypography>

          {!engagement?.validated ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Votre investissement n'a pas encore été validé par l'équipe. Merci de patienter.
            </Alert>
          ) : steps.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Aucune étape enregistrée pour ce projet pour l’instant.
            </Alert>
          ) : (
            <Stepper orientation="vertical" nonLinear activeStep={steps.length - 1} sx={{ mt: 2 }}>
              {steps.map((step) => (
                <Step key={step.id} completed={step.status === "terminé"}>
                  <StepLabel>
                    <Typography fontWeight={600}>{step.title}</Typography>
                    <Chip
                      label={step.status}
                      color={statusColors[step.status] || "default"}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    {step.image_url && (
                      <Box my={2}>
                        <img src={step.image_url} alt="étape" style={{ maxWidth: "100%", borderRadius: 8 }} />
                      </Box>
                    )}
                    {step.media_urls && (
                      <Box mt={2}>
                        {step.media_urls.split(",").map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            📎 Média {i + 1}
                          </a>
                        ))}
                      </Box>
                    )}
                    {step.document_url && (
                      <Box mt={2}>
                        <a href={step.document_url} target="_blank" rel="noopener noreferrer">
                          📄 Voir document associé
                        </a>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      {new Date(step.created_at).toLocaleDateString("fr-FR")} — Statut : {step.status}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}

          <Box mt={3}>
            <Button variant="outlined" onClick={() => navigate("/dashboard/mes-projets")}>🔙 Retour</Button>
          </Box>
        </>
      )}
    </MDBox>
  );
};

export default InvestorProjectTrackingPage;

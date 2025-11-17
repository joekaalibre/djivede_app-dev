import React, { useEffect, useState } from "react";
import { Typography, Button, Box, Grid, CircularProgress, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get("email");

  const [intention, setIntention] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!emailParam) {
      setLoading(false);
      return;
    }

    const fetchIntention = async () => {
      const { data } = await supabase
        .from("investment_intentions")
        .select("*")
        .eq("email", emailParam)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setIntention(data);
      setLoading(false);
    };

    fetchIntention();
  }, [emailParam]);

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!intention) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h5" color="error">
          Aucune intention d’investissement trouvée pour cet email.
        </Typography>
      </Box>
    );
  }

  const method = intention.method;
  const methodText =
    method === "carte"
      ? "Votre paiement par carte a été initié. Vous recevrez un reçu par email dès validation."
      : method === "virement"
      ? "Veuillez finaliser votre virement bancaire pour activer votre investissement."
      : "Votre promesse d’investissement est enregistrée. Merci de finaliser votre paiement prochainement.";

  return (
    <Box className="max-w-3xl mx-auto p-6">
      <Paper elevation={3} className="p-6 bg-white rounded-lg shadow-md">
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          🎉 Merci {intention.full_name || ""} !
        </Typography>

        <Typography variant="body1" className="mb-4 text-neutral-700">
          {methodText}
        </Typography>

        <Box className="bg-accent-50 rounded-lg p-4 border border-accent-200 mb-6">
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            📊 Détail de votre engagement :
          </Typography>
          <Typography>
            <strong>Montant engagé :</strong> {intention.amount ? intention.amount.toLocaleString("fr-FR") : "-"} €
          </Typography>
          <Typography>
            <strong>Méthode :</strong> {intention.method || "-"}
          </Typography>
          <Typography>
            <strong>Date :</strong> {intention.created_at ? new Date(intention.created_at).toLocaleString("fr-FR") : "-"}
          </Typography>
        </Box>

        <Typography className="text-sm text-purple-600 italic mb-4">
          Un email contenant vos informations de connexion a été envoyé à <strong>{intention.email}</strong>. Connectez-vous à votre espace personnel pour suivre votre investissement.
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          {(method === "carte" || method === "virement") && (
            <Grid item>
              <Button variant="contained" color="primary" onClick={() => navigate("/dashboard/wallet")}>
                💼 Accéder à mon portefeuille
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button variant="outlined" onClick={() => navigate("/dashboard/mes-engagements")}>
              🛡️ Voir mes engagements
            </Button>
          </Grid>
          <Grid item>
            <Button variant="text" onClick={() => navigate("/auth")}>
              🔐 Me connecter
            </Button>
          </Grid>
          <Grid item>
            <Button variant="text" onClick={() => navigate("/projects")}>
              ↩️ Retour aux projets
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ThankYouPage;

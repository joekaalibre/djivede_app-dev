// 📁 src/pages/SubscribePage.tsx
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import Breadcrumbs from "../ui/components/Breadcrumbs";
import { Button, CircularProgress, Grid, Paper } from "@mui/material";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribePage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = async (yearly: boolean) => {
    setLoading(true);
    setErrorMsg(null);

    const stripe = await stripePromise;
    if (!stripe) {
      console.error("❌ Stripe non initialisé");
      setErrorMsg("Erreur de chargement du paiement. Veuillez réessayer plus tard.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: yearly ? "yearly" : "monthly" }),
      });

      const session = await response.json();

      if (!session.id) {
        console.error("❌ ID session manquant :", session);
        setErrorMsg("Erreur de session Stripe. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      await stripe.redirectToCheckout({ sessionId: session.id });

    } catch (err) {
      console.error("💥 Erreur Stripe :", err);
      setErrorMsg("Une erreur est survenue. Merci de réessayer.");
      setLoading(false);
    }
  };

  return (
    <MDBox p={4} bgcolor="#F8FAFC" maxWidth="960px" mx="auto">
      <Breadcrumbs />
      <MDTypography variant="h4" fontWeight="bold" gutterBottom color="#0D9488">
        🎟️ Abonnement Investisseur
      </MDTypography>
      <MDTypography variant="body1" mb={4}>
        Devenez membre du réseau d'investisseurs Djivedé et accédez à des projets exclusifs au Bénin.
        Choisissez votre formule :
      </MDTypography>

      {errorMsg && (
        <MDTypography variant="body2" color="error" mb={2}>
          {errorMsg}
        </MDTypography>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <MDTypography variant="h6" fontWeight="bold">💶 Mensuel</MDTypography>
            <MDTypography variant="body2" mb={2}>4.99€/mois, sans engagement.</MDTypography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleSubscribe(false)}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Chargement..." : "Souscrire"}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <MDTypography variant="h6" fontWeight="bold">📅 Annuel</MDTypography>
            <MDTypography variant="body2" mb={2}>49€/an, soit 2 mois offerts.</MDTypography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => handleSubscribe(true)}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Chargement..." : "Souscrire"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default SubscribePage;

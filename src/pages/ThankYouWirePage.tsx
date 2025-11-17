import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ThankYouWirePage = () => {
  const navigate = useNavigate();

  return (
    <Box p={4} maxWidth="600px" mx="auto" textAlign="center">
      <Typography variant="h4" gutterBottom>
        ✅ Votre intention a été enregistrée
      </Typography>
      <Typography variant="body1" mt={2} mb={3}>
        Vous avez choisi de régler par <strong>virement bancaire</strong>.
        <br />
        Veuillez utiliser les coordonnées ci-dessous pour effectuer votre virement
        dans un délai de <strong>5 jours</strong>.
      </Typography>

      <Box bgcolor="#f1f5f9" p={3} borderRadius={2} textAlign="left" mt={2}>
        <Typography variant="subtitle2">Coordonnées bancaires :</Typography>
        <Typography fontSize={14} mt={1}>
          Titulaire : <strong>DJIVEDE INVEST</strong><br />
          IBAN : <strong>FR76 3000 4000 0500 0001 2345 678</strong><br />
          BIC : <strong>BNPAFRPP</strong><br />
          Banque : <strong>BNP Paribas</strong><br />
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mt={2}>
        ℹ️ Veuillez indiquer votre nom ou votre adresse e-mail en référence du virement.
        Un email de confirmation vous a été envoyé.
      </Typography>

      <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")} sx={{ mt: 4 }}>
        Retour au tableau de bord
      </Button>
    </Box>
  );
};

export default ThankYouWirePage;

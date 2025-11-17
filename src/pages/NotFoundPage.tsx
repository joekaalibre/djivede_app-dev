// 📁 src/pages/NotFoundPage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box p={6} textAlign="center">
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Oups ! Cette page n’existe pas.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/")}>
        Retour à l’accueil
      </Button>
    </Box>
  );
};

export default NotFoundPage;

import React from "react";
import { Box, Container, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "#1e293b",
        color: "white",
        py: 2,
        px: 2,
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          © {new Date().getFullYear()} Djivèdé — Plateforme d’investissement & de formation.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

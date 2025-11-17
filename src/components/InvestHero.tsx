import React from "react";
import { motion } from "framer-motion";
import { Button, Box, Typography } from "@mui/material";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
}

const Hero = ({ title, subtitle, image }: HeroProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "90vh",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "white",
      }}
    >
      {/* Overlay dégradé */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
          zIndex: 1,
        }}
      />

      {/* Contenu texte et boutons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: "relative", zIndex: 2, maxWidth: 800, padding: "0 16px" }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" mb={4}>
          {subtitle}
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            href="#investir"
            sx={{ textTransform: "none", bgcolor: "#14b8a6", "&:hover": { bgcolor: "#0d9488" } }}
          >
            💸 Je souhaite investir
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ textTransform: "none", borderColor: "white", color: "white", "&:hover": { borderColor: "#ccc" } }}
            href="https://wa.me/2290152532323?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20les%20projets%20d'investissement%20Djivedé"
            target="_blank"
          >
            📲 Discuter sur WhatsApp
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Hero;

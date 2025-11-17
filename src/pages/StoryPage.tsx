// ✅ ProjectInvestPage.tsx — Version enrichie avec animations, storytelling, visuel & engagement
import React from "react";
import { Box, Typography, Button, Container, Grid, Chip } from "@mui/material";
import AnimatedSection from "../components/AnimatedSection";
import InvestFormInline from "../components/InvestFormInline";
import { motion } from "framer-motion";

const ProjectInvestPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-section-light text-gray-900"
    >
      {/* Hero visuel */}
      <div
        className="relative min-h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage:
            "url(https://pmdjjakfzzcyqtscefkt.supabase.co/storage/v1/object/public/media/uploads/1747883701807_djivede_invest_fish1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-teal-900/70 z-0" />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Pisciculture Lac Village
          </h1>
          <p className="mt-4 text-lg text-gray-100 max-w-2xl mx-auto">
            Un projet de pisciculture durable et solidaire avec les riverains du lac.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#investir"
              className="flex items-center px-6 py-2 text-sm font-medium rounded-full text-white bg-teal-500 hover:bg-teal-600 transition-colors duration-200"
            >
              💸 Je souhaite investir
            </a>
            <a
              href="https://wa.me/2290152532323?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20les%20projets%20d'investissement%20Djivedé"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-6 py-2 text-sm font-medium rounded-full text-white border border-white hover:bg-white hover:text-teal-700 transition-colors duration-200"
            >
              📲 Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Section storytelling */}
        <AnimatedSection>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <img
                src="https://pmdjjakfzzcyqtscefkt.supabase.co/storage/v1/object/public/media/1747882436482_djivede_invest.jpg"
                alt="Pitch projet"
                className="rounded-xl shadow-md w-full"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Chip label="Campagne Spéciale" color="success" size="small" sx={{ mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Propulsez un projet avec Djivedé
              </Typography>
              <Typography mb={2}>
                Nous vous proposons un modèle d’investissement concret, durable et équitable.
                Vous contribuez à une économie locale et recevez des rendements transparents et suivis.
              </Typography>
              <ul className="list-disc pl-5 space-y-1">
                <li>✔️ Étude de faisabilité solide</li>
                <li>✔️ Rendement brut jusqu'à 30 %</li>
                <li>✔️ Accompagnement & reporting</li>
              </ul>
              <Button
                href="#investir"
                variant="contained"
                sx={{ mt: 3 }}
                color="success"
              >
                Je participe au projet
              </Button>
            </Grid>
          </Grid>
        </AnimatedSection>

        {/* Section vidéo + texte */}
        <AnimatedSection>
          <Grid container spacing={4} alignItems="center" mt={6}>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
                <iframe
                  src="https://www.youtube.com/embed/5qap5aO4i9A"
                  title="Présentation du projet"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                ></iframe>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎥 Découvrez le projet en vidéo
              </Typography>
              <Typography>
                Cette vidéo vous offre une immersion dans l’univers du projet : ses objectifs, son impact local et les personnes engagées à vos côtés.
              </Typography>
            </Grid>
          </Grid>
        </AnimatedSection>

        {/* Section double colonne */}
        <AnimatedSection>
          <Box mt={10} textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Nos deux promesses
            </Typography>
            <Typography color="text.secondary">
              Clarté pour l’investisseur. Impact pour le territoire.
            </Typography>
          </Box>
          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={6}>
              <Box bgcolor="#E0F2F1" p={4} borderRadius={4}>
                <Typography variant="h6" fontWeight="bold">Transparence</Typography>
                <Typography mt={1}>
                  Vous bénéficiez d’un suivi régulier : opérations visibles, bilans trimestriels et échanges directs avec les porteurs du projet.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box bgcolor="#F3E8FF" p={4} borderRadius={4}>
                <Typography variant="h6" fontWeight="bold">Rentabilité</Typography>
                <Typography mt={1}>
                  Nous visons un rendement net stable de 18 %, tout en sécurisant votre capital via des garanties structurelles solides.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AnimatedSection>

        {/* Section chiffres et barres */}
        <AnimatedSection>
          <Box mt={10} textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📊 Performances estimées
            </Typography>
            <Typography color="text.secondary">
              Nos données historiques donnent un aperçu clair des retours potentiels pour les investisseurs engagés.
            </Typography>
          </Box>
          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={6}>
              <Typography fontWeight="medium">Rentabilité brute</Typography>
              <Box className="bg-gray-200 rounded-full h-4 mt-1 overflow-hidden">
                <motion.div className="bg-teal-500 h-4" initial={{ width: 0 }} whileInView={{ width: "90%" }} transition={{ duration: 1 }} viewport={{ once: true }} />
              </Box>
              <Typography variant="caption">30 %</Typography>

              <Typography mt={2} fontWeight="medium">Taux de réinvestissement</Typography>
              <Box className="bg-gray-200 rounded-full h-4 mt-1 overflow-hidden">
                <motion.div className="bg-teal-500 h-4" initial={{ width: 0 }} whileInView={{ width: "70%" }} transition={{ duration: 1 }} viewport={{ once: true }} />
              </Box>
              <Typography variant="caption">70 %</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography fontWeight="medium">Taux de réussite projet</Typography>
              <Box className="bg-gray-200 rounded-full h-4 mt-1 overflow-hidden">
                <motion.div className="bg-teal-500 h-4" initial={{ width: 0 }} whileInView={{ width: "95%" }} transition={{ duration: 1 }} viewport={{ once: true }} />
              </Box>
              <Typography variant="caption">95 %</Typography>

              <Typography mt={2} fontWeight="medium">Satisfaction investisseurs</Typography>
              <Box className="bg-gray-200 rounded-full h-4 mt-1 overflow-hidden">
                <motion.div className="bg-teal-500 h-4" initial={{ width: 0 }} whileInView={{ width: "92%" }} transition={{ duration: 1 }} viewport={{ once: true }} />
              </Box>
              <Typography variant="caption">92 %</Typography>
            </Grid>
          </Grid>
        </AnimatedSection>

        {/* Section formulaire */}
        <AnimatedSection id="investir">
          <Box mt={10}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              💰 Je souhaite investir
            </Typography>
            <InvestFormInline />
            <Button
              variant="outlined"
              size="large"
              sx={{ mt: 2, textTransform: 'none' }}
              color="success"
              href="https://wa.me/2290152532323?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20les%20projets%20d'investissement%20Djivedé"
              target="_blank"
            >
              📲 Discuter sur WhatsApp
            </Button>
          </Box>
        </AnimatedSection>

        {/* CTA final */}
        <AnimatedSection>
          <Box textAlign="center" mt={10}>
            <Typography variant="h5" fontWeight="bold">
              Rejoignez une communauté d’investisseurs engagés.
            </Typography>
            <Typography mb={2}>Investissez avec sens, impact et rendement.</Typography>
            <Button variant="contained" size="large" href="#investir">
              Je commence maintenant
            </Button>
          </Box>
        </AnimatedSection>
      </Container>
    </motion.div>
  );
};

export default ProjectInvestPage;

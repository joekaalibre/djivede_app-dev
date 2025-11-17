// ✅ InvestorProjectsPage.tsx — version harmonisée avec navigation vers page de suivi

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";
import {
  Box, Card, CardContent, Typography, Grid, Avatar,
  Chip, LinearProgress, Button, CircularProgress
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";
import { platformCurrency } from "../lib/constants";
import MDTypography from "../ui/components/MDTypography";

interface ProjectInfo {
  id: string;
  title: string;
  image_url: string;
  total_invested: number;
  target_amount: number;
  is_modular?: boolean;
  status?: string;
}

const InvestorProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .rpc("get_investor_projects", { investor_id: user?.id });

      if (error) {
        console.error("Erreur récupération projets :", error.message);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };

    if (user?.id) fetchProjects();
  }, [user?.id]);

  const renderProgress = (amount: number, target: number) => {
    const progress = target > 0 ? Math.min(100, (amount / target) * 100) : 0;
    return (
      <Box sx={{ mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progress >= 100 ? "success" : "primary"}
        />
        <Typography variant="caption">
          {progress.toFixed(1)}% de l’objectif atteint
        </Typography>
      </Box>
    );
  };

  return (
    <Box p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h5" fontWeight="bold" mb={3} color="primary">
        📁 Mes Projets Investis
      </MDTypography>

      {loading ? (
        <CircularProgress />
      ) : projects.length === 0 ? (
        <Typography color="textSecondary">
          Vous n’avez encore investi dans aucun projet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
                    <img
                      src={project.image_url}
                      alt={project.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Chip
                      label={project.is_modular ? "Modulaire" : "Classique"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: project.is_modular ? "secondary.main" : "primary.main",
                        color: "#fff",
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {project.title}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <FolderIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">
                        Investi : {(project.total_invested || 0).toLocaleString()} {platformCurrency}
                      </Typography>
                    </Box>

                    {renderProgress(project.total_invested || 0, project.target_amount)}

                    {project.status === "validated" && (
                      <Chip
                        label="Validé"
                        color="success"
                        icon={<CheckCircleIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}

                    <Box mt={2}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/dashboard/projets/${project.id}/suivi`)}
                      >
                        Voir le projet
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default InvestorProjectsPage;

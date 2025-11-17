import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ProjectList = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("invest_projects").select("*");
      if (!error) setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) return <Typography>Chargement des projets...</Typography>;

  return (
    <Box p={4} sx={{ maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        🌍 Projets disponibles à l’investissement
      </Typography>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              {project.image_url && (
                <CardMedia
                  component="img"
                  height="180"
                  image={project.image_url}
                  alt={project.title}
                  sx={{ objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {project.title}
                </Typography>
                {project.is_modular && (
                  <Chip label="Projet modulaire" color="primary" size="small" sx={{ mt: 1 }} />
                )}
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {project.summary}
                </Typography>
                {project.funded_amount && project.total_amount && (
                  <Box mt={2}>
                    <Typography variant="caption">
                      Progression : {Math.round((project.funded_amount / project.total_amount) * 100)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(project.funded_amount / project.total_amount) * 100}
                      sx={{ height: 6, borderRadius: 5, mt: 0.5 }}
                    />
                  </Box>
                )}
              </CardContent>
              <Box p={2}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/projects/${project.id}`}
                >
                  Voir le projet
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProjectList;

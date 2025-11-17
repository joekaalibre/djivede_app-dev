import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Grid, CardMedia } from "@mui/material";
import { supabase } from "../lib/supabase";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("invest_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setProject(data);
    };

    if (id) fetch();
  }, [id]);

  if (!project) return <Typography>Chargement...</Typography>;

  return (
    <Grid container spacing={4} sx={{ maxWidth: "1100px", mx: "auto", p: 4 }}>
      <Grid item xs={12}>
        <Typography variant="h4" fontWeight="bold">
          {project.title}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1, color: "text.secondary" }}>
          {project.summary}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        {project.image_url && (
          <CardMedia
            component="img"
            height="300"
            image={project.image_url}
            alt={project.title}
            sx={{ borderRadius: 2, objectFit: "cover" }}
          />
        )}
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" mb={3}>
          {project.description}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          📆 Durée : {project.duration_months} mois
        </Typography>
        <Typography variant="body2" color="text.secondary">
          💸 Rendement estimé : {project.expected_return_min}% – {project.expected_return_max}%
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          onClick={() => navigate(`/projects/${project.id}/investir`)}
        >
          💰 Investir maintenant
        </Button>
      </Grid>
    </Grid>
  );
};

export default ProjectDetails;

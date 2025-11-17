import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Chip,
  Grid,
  Button,
} from "@mui/material";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface Update {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  image_url: string;
  document_url: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  image_url: string;
  updates: Update[];
}

const AdminProjectTrackingPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectList, error } = await supabase
        .from("invest_projects")
        .select(`
          id, title, image_url,
          updates:project_updates (
            id, title, description, progress, status, image_url, document_url, created_at
          )
        `)
        .order("created_at", { foreignTable: "updates", ascending: false });

      if (error) {
        console.error("Erreur récupération projets :", error.message);
        return;
      }

      setProjects(projectList || []);
    };

    fetchData();
  }, []);

  const renderProgress = (value: number) => (
    <Box>
      <LinearProgress variant="determinate" value={value} />
      <Typography variant="caption">{value}% d’avancement</Typography>
    </Box>
  );

  return (
    <DashboardLayout>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Suivi des Projets
        </Typography>

        {projects.map((project) => (
          <Box key={project.id} mt={4}>
            <Typography variant="h6">{project.title}</Typography>
            <img
              src={project.image_url}
              alt={project.title}
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
            />

            {project.updates.length === 0 ? (
              <Typography color="textSecondary" mt={2}>
                Aucun update enregistré pour ce projet.
              </Typography>
            ) : (
              <Grid container spacing={2} mt={1}>
                {project.updates.map((update) => (
                  <Grid item xs={12} md={6} key={update.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between">
                          <Typography fontWeight="bold">{update.title}</Typography>
                          <Chip label={update.status} size="small" color="info" />
                        </Box>
                        <Typography variant="body2" mt={1}>
                          {update.description}
                        </Typography>

                        {update.progress !== null && renderProgress(update.progress)}

                        {update.document_url && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={update.document_url}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            Voir document
                          </Button>
                        )}

                        {update.image_url && (
                          <img
                            src={update.image_url}
                            alt="update"
                            style={{
                              width: "100%",
                              marginTop: 10,
                              borderRadius: 4,
                              maxHeight: 160,
                              objectFit: "cover",
                            }}
                          />
                        )}

                        <Typography variant="caption" color="textSecondary" mt={1} display="block">
                          Ajouté le {new Date(update.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Divider sx={{ mt: 4 }} />
          </Box>
        ))}
      </Box>
    </DashboardLayout>
  );
};

export default AdminProjectTrackingPage;

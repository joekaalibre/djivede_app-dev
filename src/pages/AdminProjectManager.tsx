// 📁 AdminProjectManager.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Skeleton
} from "@mui/material";
import { Eye, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";

interface Project {
  id: string;
  title: string;
  status: string;
  description: string;
  created_at: string;
  image_url?: string;
  deleted_at?: string | null;
  type?: string;
}

const AdminProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("invest_projects")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message || "Erreur de chargement.");
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleDisable = async (projectId: string) => {
    const { error } = await supabase
      .from("invest_projects")
      .update({ status: "inactif" })
      .eq("id", projectId);

    if (!error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "inactif" } : p))
      );
    }
  };

  const renderCard = (project: Project) => (
    <Card
      key={project.id}
      sx={{
        position: "relative",
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        transition: "transform 0.2s",
        '&:hover': { transform: "translateY(-2px)" }
      }}
    >
      {project.image_url && (
        <CardMedia
          component="img"
          height="160"
          image={project.image_url}
          alt={project.title}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="#0D9488" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {project.description?.substring(0, 100) || "Pas de description"}...
        </Typography>
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "space-between", px: 2, pb: 2 }}>
        <Box display="flex" gap={1}>
          <IconButton onClick={() => window.location.href = (`https://djivede.com/projects/${project.id}`)} title="Aperçu">
            <Eye size={18} color="#9333EA" />
          </IconButton>
          <Button
            size="small"
            onClick={() => navigate(`/dashboard/admin/projects/${project.id}/edit`)}
            sx={{ color: "#0D9488", fontSize: "0.75rem", px: 1 }}
          >
            ✏️ Modifier
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => navigate(`/dashboard/admin/projects/${project.id}/phases`)}
            sx={{ fontSize: "0.75rem", px: 1 }}
          >
            📊 Phases
          </Button>
        </Box>
        {project.status === "actif" && (
          <IconButton onClick={() => handleDisable(project.id)} title="Désactiver">
            <X size={18} color="#dc2626" />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" color="#9333EA">
          📁 Gestion des projets
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: "#9333EA", "&:hover": { bgcolor: "#7e22ce" } }}
          onClick={() => navigate("/dashboard/admin/nouveau-projet")}
        >
          + Ajouter un projet
        </Button>
      </Box>

      {loading ? (
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={180}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : errorMsg ? (
        <Typography color="error">❗ {errorMsg}</Typography>
      ) : projects.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Aucun projet enregistré pour l’instant.
        </Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
          gap={3}
        >
          {projects.map((project) => renderCard(project))}
        </Box>
      )}
    </MDBox>
  );
};

export default AdminProjectManager;

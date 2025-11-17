import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  image_url?: string;
  document_url?: string;
  media_urls?: string[];
  created_at: string;
}

const AdminProjectPhasesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [phases, setPhases] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectUpdate | null>(null);
  const [feedback, setFeedback] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "en_cours",
    progress: 0,
    image_url: "",
    document_url: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      // Récupérer le projet
      const { data: projectData, error: projError } = await supabase
        .from("invest_projects")
        .select("id, title")
        .eq("id", id)
        .single();

      if (projError) throw projError;
      setProject(projectData);

      // Récupérer les phases
      const { data: phasesData, error: phasesError } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true });

      if (phasesError) throw phasesError;
      setPhases(phasesData || []);
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (phase?: ProjectUpdate) => {
    if (phase) {
      setEditingPhase(phase);
      setFormData({
        title: phase.title,
        description: phase.description || "",
        status: phase.status || "en_cours",
        progress: phase.progress || 0,
        image_url: phase.image_url || "",
        document_url: phase.document_url || "",
      });
    } else {
      setEditingPhase(null);
      setFormData({
        title: "",
        description: "",
        status: "en_cours",
        progress: 0,
        image_url: "",
        document_url: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPhase(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setFeedback("Le titre est requis");
      return;
    }

    try {
      if (editingPhase) {
        // Update
        const { error } = await supabase
          .from("project_updates")
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            progress: formData.progress,
            image_url: formData.image_url || null,
            document_url: formData.document_url || null,
          })
          .eq("id", editingPhase.id);

        if (error) throw error;
        setFeedback("✅ Phase mise à jour avec succès");
      } else {
        // Insert
        const { error } = await supabase.from("project_updates").insert({
          project_id: id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          progress: formData.progress,
          image_url: formData.image_url || null,
          document_url: formData.document_url || null,
        });

        if (error) throw error;
        setFeedback("✅ Phase ajoutée avec succès");
      }

      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      console.error("Erreur save:", err);
      setFeedback("❌ " + err.message);
    }
  };

  const handleDelete = async (phaseId: string) => {
    if (!confirm("Supprimer cette phase ?")) return;

    try {
      const { error } = await supabase
        .from("project_updates")
        .delete()
        .eq("id", phaseId);

      if (error) throw error;
      setFeedback("✅ Phase supprimée");
      fetchData();
    } catch (err: any) {
      setFeedback("❌ " + err.message);
    }
  };

  const statusColors: Record<string, "default" | "warning" | "success" | "info"> = {
    prévu: "info",
    en_cours: "warning",
    terminé: "success",
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={4}>
        <Alert severity="error">Projet introuvable</Alert>
      </Box>
    );
  }

  return (
    <Box p={4} bgcolor="#F8FAFC" minHeight="100vh">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          📊 Phases du projet : {project.title}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter une phase
          </Button>
          <Button variant="outlined" onClick={() => navigate("/dashboard/admin/projects")}>
            Retour
          </Button>
        </Box>
      </Box>

      {feedback && (
        <Alert
          severity={feedback.startsWith("✅") ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setFeedback("")}
        >
          {feedback}
        </Alert>
      )}

      {phases.length === 0 ? (
        <Alert severity="info">
          Aucune phase créée pour ce projet. Cliquez sur "Ajouter une phase" pour commencer.
        </Alert>
      ) : (
        <List>
          {phases.map((phase, index) => (
            <Card key={phase.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Chip label={`Phase ${index + 1}`} size="small" color="primary" />
                      <Chip label={phase.status} size="small" color={statusColors[phase.status]} />
                      <Chip label={`${phase.progress}%`} size="small" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {phase.title}
                    </Typography>
                    {phase.description && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {phase.description}
                      </Typography>
                    )}
                    {phase.image_url && (
                      <Box mt={2}>
                        <img
                          src={phase.image_url}
                          alt={phase.title}
                          style={{ maxWidth: "300px", borderRadius: "8px" }}
                        />
                      </Box>
                    )}
                    {phase.document_url && (
                      <Box mt={1}>
                        <a href={phase.document_url} target="_blank" rel="noopener noreferrer">
                          📄 Document associé
                        </a>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Créé le {new Date(phase.created_at).toLocaleDateString("fr-FR")}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton color="primary" onClick={() => handleOpenDialog(phase)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(phase.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Dialog Ajouter/Modifier */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPhase ? "Modifier la phase" : "Ajouter une phase"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Titre de la phase"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />

            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                label="Statut"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="prévu">Prévu</MenuItem>
                <MenuItem value="en_cours">En cours</MenuItem>
                <MenuItem value="terminé">Terminé</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Progression (%)"
              type="number"
              value={formData.progress}
              onChange={(e) =>
                setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })
              }
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />

            <TextField
              label="URL de l'image"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              fullWidth
              placeholder="https://..."
            />

            <TextField
              label="URL du document"
              value={formData.document_url}
              onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
              fullWidth
              placeholder="https://..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingPhase ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProjectPhasesPage;

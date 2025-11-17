import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";

interface Props {
  projectId: string;
  onCreated?: () => void;
}

const statusOptions = ["prévu", "en_cours", "terminé"];

const ProjectUpdateForm: React.FC<Props> = ({ projectId, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState("en_cours");
  const [documentUrl, setDocumentUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("project_updates").insert({
      project_id: projectId,
      title,
      description,
      progress,
      status,
      document_url: documentUrl,
      image_url: imageUrl,
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Mise à jour créée avec succès !");
      onCreated?.();
      setTitle("");
      setDescription("");
      setProgress(0);
      setStatus("en_cours");
      setDocumentUrl("");
      setImageUrl("");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Nouvel Update</Typography>
        <TextField label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextField
          label="Description"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Avancement (%)"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
        <TextField
          select
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Lien image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <TextField label="Lien document (PDF...)" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
        <Button type="submit" variant="contained">Enregistrer</Button>
      </Stack>
    </Box>
  );
};

export default ProjectUpdateForm;

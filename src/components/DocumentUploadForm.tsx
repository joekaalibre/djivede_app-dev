import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

const documentTypes = [
  { value: "recu", label: "Reçu de virement" },
  { value: "contrat", label: "Contrat signé" },
  { value: "rapport", label: "Rapport de suivi" },
];

const DocumentUploadForm: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("recu");
  const [commentaire, setCommentaire] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user?.id) return;

    setUploading(true);
    setMessage("");

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (storageError) {
      setMessage("Erreur lors de l'envoi du fichier.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;

    const { error: dbError } = await supabase.from("documents_investor").insert({
      user_id: user.id,
      file_url: publicUrl,
      file_type: fileType,
      commentaire,
    });

    if (dbError) {
      setMessage("Erreur lors de l'enregistrement dans la base.");
    } else {
      setMessage("Document envoyé avec succès !");
      setFile(null);
      setCommentaire("");
    }

    setUploading(false);
  };

  return (
    <Box component="form" onSubmit={handleUpload} mt={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Uploader un document</Typography>

        <TextField
          select
          label="Type de document"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
        >
          {documentTypes.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Commentaire (facultatif)"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          multiline
          rows={2}
        />

        <Button variant="outlined" component="label">
          Choisir un fichier (PDF ou image)
          <input type="file" hidden accept=".pdf,image/*" onChange={handleFileChange} />
        </Button>

        {file && <Typography variant="body2">Fichier sélectionné : {file.name}</Typography>}

        <Button type="submit" variant="contained" disabled={uploading || !file}>
          {uploading ? "Envoi en cours..." : "Envoyer"}
        </Button>

        {message && <Typography color="primary">{message}</Typography>}
      </Stack>
    </Box>
  );
};

export default DocumentUploadForm;

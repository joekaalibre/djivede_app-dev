// ✅ InvestorDocumentsPage.tsx — Upload + historique des documents de l’investisseur
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../components/AuthProvider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const documentTypes = [
  { value: "recu", label: "Reçu de virement" },
  { value: "contrat", label: "Contrat signé" },
  { value: "rapport", label: "Rapport de suivi" },
];

const InvestorDocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("recu");
  const [commentaire, setCommentaire] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("documents_investor")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false })
      .then(({ data }) => setDocuments(data || []));
  }, [user]);

  const handleUpload = async () => {
    if (!file || !user?.id) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) return alert("Erreur upload fichier");

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("documents_investor").insert({
      user_id: user.id,
      file_url: urlData.publicUrl,
      file_type: fileType,
      commentaire,
    });

    if (!dbError) {
      setFile(null);
      setCommentaire("");
      setFileType("recu");
      const { data } = await supabase
        .from("documents_investor")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });
      setDocuments(data || []);
    }

    setUploading(false);
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    const { error } = await supabase.from("documents_investor").delete().eq("id", docId);
    if (!error) setDocuments((d) => d.filter((doc) => doc.id !== docId));
  };

  return (
    <Box p={4} bgcolor="#F8FAFC">
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📂 Mes justificatifs et documents
      </Typography>

      <Box mt={3} mb={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Type de document"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              {documentTypes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button variant="outlined" component="label" fullWidth>
              Choisir un fichier
              <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? "Envoi..." : "Envoyer"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {documents.map((doc) => (
          <Grid item xs={12} md={6} lg={4} key={doc.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar>
                    <InsertDriveFileIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{doc.file_type}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doc.commentaire || "—"}
                    </Typography>
                  </Box>
                  <Box flexGrow={1} textAlign="right">
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => handleDelete(doc.id)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Ajouté le {format(new Date(doc.uploaded_at), "PPPp", { locale: fr })}
                </Typography>

                <Typography variant="caption" display="block" mt={1}>
                  Statut : <strong>{doc.status || "en_attente"}</strong>
                </Typography>

                <Box mt={2}>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", fontWeight: 600 }}
                  >
                    📂 Voir le fichier
                  </a>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InvestorDocumentsPage;

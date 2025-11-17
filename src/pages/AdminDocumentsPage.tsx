// ✅ AdminDocumentsPage.tsx — Suivi des documents envoyés par les investisseurs avec statut
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Tooltip,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  en_attente: "default",
  valide: "success",
  rejete: "error",
};

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data: docs } = await supabase
        .from("documents_investor")
        .select("*")
        .order("uploaded_at", { ascending: false });

      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
      const userMap: Record<string, any> = {};
      profiles?.forEach((u) => (userMap[u.id] = u));

      setUsers(userMap);
      setDocuments(docs || []);
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    const { error } = await supabase.from("documents_investor").delete().eq("id", docId);
    if (!error) setDocuments((docs) => docs.filter((d) => d.id !== docId));
  };

  const handleStatusChange = async (docId: string, newStatus: string) => {
    const doc = documents.find((d) => d.id === docId);
    const { error } = await supabase.from("documents_investor").update({ status: newStatus }).eq("id", docId);
    if (!error) {
      setDocuments((docs) =>
        docs.map((d) => (d.id === docId ? { ...d, status: newStatus } : d))
      );

      // 🔔 Notification automatique
      if (doc) {
        await supabase.from("notifications").insert({
          user_id: doc.user_id,
          type: "document_status",
          message: `Le document \"${doc.file_type}\" a été ${newStatus === "valide" ? "validé" : newStatus === "rejete" ? "rejeté" : "mis à jour"}.`,
        });
      }
    }
  };

  const filteredDocs = filter ? documents.filter((d) => d.status === filter) : documents;

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        📄 Documents envoyés par les investisseurs
      </MDTypography>

      <Box mb={3}>
        <FormControl size="small">
          <InputLabel>Filtrer par statut</InputLabel>
          <Select
            value={filter}
            label="Filtrer par statut"
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="en_attente">En attente</MenuItem>
            <MenuItem value="valide">Validé</MenuItem>
            <MenuItem value="rejete">Rejeté</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} mt={1}>
        {filteredDocs.map((doc, idx) => {
          const user = users[doc.user_id] || {};
          return (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar>
                        <InsertDriveFileIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {doc.file_type?.toUpperCase() || "Document"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.full_name || "Utilisateur inconnu"}
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

                    <Typography variant="body2" gutterBottom>
                      {doc.commentaire || "Aucun commentaire"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Ajouté le {format(new Date(doc.uploaded_at), "PPPp", { locale: fr })}
                    </Typography>

                    <Box mt={2}>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", fontWeight: 600 }}
                      >
                        📎 Voir le fichier
                      </a>
                    </Box>

                    <Box mt={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Statut</InputLabel>
                        <Select
                          value={doc.status || "en_attente"}
                          label="Statut"
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                        >
                          <MenuItem value="en_attente">En attente</MenuItem>
                          <MenuItem value="valide">Validé</MenuItem>
                          <MenuItem value="rejete">Rejeté</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </MDBox>
  );
};

export default AdminDocumentsPage;

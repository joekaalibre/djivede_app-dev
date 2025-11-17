// ✅ AdminNewsPage.tsx — Gestion des news admin (alertes, communiqués, etc.)
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { supabase } from "../lib/supabase";

interface AdminNewsItem {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

const AdminNewsPage = () => {
  const [news, setNews] = useState<AdminNewsItem[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const { data } = await supabase
      .from("admin_news")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNews(data);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("admin_news").delete().eq("id", id);
    fetchNews();
  };

  const handleCreate = async () => {
    if (!title || !content) return;
    await supabase.from("admin_news").insert({
      title,
      content,
      status: "unread",
    });
    setTitle("");
    setContent("");
    setOpen(false);
    fetchNews();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Actualités / News admin</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nouvelle actu
        </Button>
      </Box>

      <Grid container spacing={2}>
        {news.map((item) => (
          <Grid item key={item.id} xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{item.title}</Typography>
                  <Chip
                    label={item.status === "unread" ? "Non lue" : "Lue"}
                    color={item.status === "unread" ? "error" : "success"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" mt={1}>{item.content}</Typography>
              </CardContent>
              <CardActions>
                <IconButton color="error" onClick={() => handleDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nouvelle publication</DialogTitle>
        <DialogContent>
          <TextField
            label="Titre"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Contenu"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleCreate} variant="contained">Publier</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNewsPage;

// 📁 AdminUserDetailsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({
    email: "",
    full_name: "",
    role: "investor",
    password: "",
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) {
        setMessage({ type: "error", text: "❌ Erreur de chargement" });
      } else {
        setUser(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    if (id) {
      const { error } = await supabase.from("profiles").update({
        full_name: user.full_name,
        role: user.role,
      }).eq("id", user.id);

      setMessage(
        error
          ? { type: "error", text: "❌ Échec de la mise à jour." }
          : { type: "success", text: "✅ Informations mises à jour." }
      );
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error || !data?.user) {
        setMessage({ type: "error", text: error?.message || "Erreur lors de la création." });
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: user.full_name,
        role: user.role,
        email: user.email,
      });

      if (insertError) {
        setMessage({ type: "error", text: "Utilisateur créé, mais erreur dans la base." });
      } else {
        setMessage({ type: "success", text: "✅ Utilisateur créé avec succès." });
        setTimeout(() => navigate(`/dashboard/admin/utilisateurs/${data.user.id}`), 2000);
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.from("users").delete().eq("id", user.id); // si jamais tu as encore cette table
    setDeleting(false);
    setConfirmOpen(false);
    navigate("/dashboard/admin/utilisateurs");
  };

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.admin.resetPasswordForEmail(user.email);
    setMessage(
      error
        ? { type: "error", text: "❌ Erreur lors de la réinitialisation." }
        : { type: "success", text: "✅ Email de réinitialisation envoyé." }
    );
  };

  if (loading) {
    return (
      <MDBox p={4} textAlign="center">
        <CircularProgress />
      </MDBox>
    );
  }

  return (
    <MDBox p={4} maxWidth={600} mx="auto" bgcolor="#F8FAFC">
      <Typography variant="h5" fontWeight="bold" gutterBottom color="#0D9488">
        {id ? "👤 Détails de l’utilisateur" : "➕ Créer un utilisateur"}
      </Typography>

      {id && (
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          {user.full_name || user.email}
        </Typography>
      )}

      <MDBox display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Nom complet"
          value={user.full_name}
          onChange={(e) => setUser({ ...user, full_name: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          disabled={!!id}
        />
        {!id && (
          <TextField
            label="Mot de passe"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
        )}
        <TextField
          select
          label="Rôle"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
        >
          <MenuItem value="admin">Administrateur</MenuItem>
          <MenuItem value="investor">Investisseur</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || (!id && (!user.email || !user.password || !user.full_name))}
          sx={{ bgcolor: "#0D9488" }}
        >
          {saving ? "Enregistrement..." : id ? "Enregistrer les modifications" : "Créer l'utilisateur"}
        </Button>

        {id && (
          <>
            <Button variant="outlined" color="secondary" onClick={handleResetPassword}>
              Réinitialiser le mot de passe
            </Button>
            <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>
              Supprimer l’utilisateur
            </Button>
          </>
        )}

        {message && <Alert severity={message.type}>{message.text}</Alert>}
      </MDBox>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment supprimer cet utilisateur ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default AdminUserDetailsPage;

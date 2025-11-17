// 📁 AdminNewUserPage.tsx
import React, { useState } from "react";
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

const AdminNewUserPage = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("investor");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    setFeedback(null);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      setFeedback({ type: "error", message: error?.message || "Erreur lors de la création." });
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      full_name: fullName,
      role,
      email,
    });

    if (insertError) {
      setFeedback({ type: "error", message: "Utilisateur créé, mais erreur dans la table users." });
    } else {
      setFeedback({ type: "success", message: "✅ Utilisateur créé avec succès !" });
      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <MDBox p={4} maxWidth={500} mx="auto" bgcolor="#F8FAFC">
      <Typography variant="h5" fontWeight="bold" gutterBottom color="#0D9488">
        ➕ Créer un nouvel utilisateur
      </Typography>

      <MDBox display="flex" flexDirection="column" gap={2} mt={3}>
        <TextField
          label="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Mot de passe temporaire pour l'inscription"
          required
        />
        <TextField
          select
          label="Rôle"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="admin">Administrateur</MenuItem>
          <MenuItem value="investor">Investisseur</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !email || !password || !fullName}
          sx={{ bgcolor: "#0D9488" }}
        >
          {loading ? <CircularProgress size={20} /> : "Créer l'utilisateur"}
        </Button>

        {feedback && (
          <Alert severity={feedback.type}>{feedback.message}</Alert>
        )}
      </MDBox>
    </MDBox>
  );
};

export default AdminNewUserPage;

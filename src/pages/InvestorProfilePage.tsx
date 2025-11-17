import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../components/AuthProvider";

const genres = [
  { value: "Homme", label: "Homme" },
  { value: "Femme", label: "Femme" },
  { value: "Autre", label: "Autre" },
  { value: "", label: "Non précisé" },
];

const InvestorProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    genre: "",
    date_naissance: "",
    pays: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: "success", message: "" });

  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("full_name, phone, genre, date_naissance, pays, email")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            genre: data.genre || "",
            date_naissance: data.date_naissance || "",
            pays: data.pays || "",
            email: data.email || user.email || "",
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const { full_name, phone, genre, date_naissance, pays } = profile;

    const payload = {
      full_name,
      phone,
      genre,
      pays,
      date_naissance: date_naissance?.trim() === "" ? null : date_naissance,
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      console.error("Erreur update profil:", error.message);
      setToast({ open: true, severity: "error", message: "Erreur lors de la sauvegarde du profil." });
    } else {
      setToast({ open: true, severity: "success", message: "Profil mis à jour avec succès !" });
    }
  };

  const isFormValid = profile.genre && profile.pays && profile.date_naissance;

  return (
    <MDBox p={4}>
      <MDTypography variant="h5" gutterBottom>
        👤 Mon Profil
      </MDTypography>

      <MDTypography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        Bonjour {profile.full_name?.split(" ")[0] || "investisseur"} 👋
      </MDTypography>

      <div className="grid gap-4 mt-4 max-w-md">
        <TextField label="Email" value={profile.email} disabled fullWidth />

        <TextField
          label="Nom complet"
          value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          fullWidth
        />

        <TextField
          label="Téléphone"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          fullWidth
        />

        <TextField
          select
          label="Genre"
          value={profile.genre}
          onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
          fullWidth
        >
          {genres.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Date de naissance"
          type="date"
          value={profile.date_naissance}
          onChange={(e) => setProfile({ ...profile, date_naissance: e.target.value })}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Pays"
          value={profile.pays}
          onChange={(e) => setProfile({ ...profile, pays: e.target.value })}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !isFormValid}
        >
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast}>
        <MuiAlert onClose={handleCloseToast} severity={toast.severity as any} sx={{ width: "100%" }}>
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </MDBox>
  );
};

export default InvestorProfilePage;

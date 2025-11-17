// src/pages/PropulseProfilePage.tsx
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Grid, Button, Snackbar, Alert, LinearProgress } from "@mui/material";
import { supabase } from "../lib/supabase";

export default function PropulseProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: ures } = await supabase.auth.getUser();
      const u = ures?.user || null;
      setUser(u);
      if (!u?.id) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      setProfile(data || {});
      setLoading(false);
    };
    run();
  }, []);

  const save = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const patch = {
        full_name: profile.full_name || null,
        phone: profile.phone || null,
        pays: profile.pays || null,
        city: profile.city || null,
      };
      const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
      if (error) throw error;
      setSnack({ open: true, msg: "Profil mis à jour ✅", severity: "success" });
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || "Erreur", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}><Typography variant="h5" fontWeight={700} mb={2}>Mon profil</Typography><LinearProgress /></Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={800} gutterBottom>Mon profil</Typography>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nom complet" value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Téléphone" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Pays" value={profile.pays || ""} onChange={(e) => setProfile({ ...profile, pays: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Ville" value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button onClick={save} variant="contained" disabled={saving}>Enregistrer</Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} message={snack.msg} />
    </Box>
  );
}

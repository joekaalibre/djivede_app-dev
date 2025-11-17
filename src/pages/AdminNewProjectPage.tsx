// ✅ AdminNewProjectPage.tsx — version harmonisée avec animations et design unifié
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

const AdminNewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    expected_return: 0,
    duration_months: 0,
    target_amount: 0,
    minimum_investment: 0,
    risk_level: "",
    start_date: "",
    image_url: "",
    type: "modulaire",
    prix_par_module: 0,
    parts_par_module: 2,
    rendement_par_module: 0,
    module_label: "Cage",
    video_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase.from("invest_projects").insert([form]).select();
    if (!error && data && data[0]) {
      const projectId = data[0].id;
      const modules = Array.from({ length: 10 }).map((_, i) => ({
        project_id: projectId,
        name: `${form.module_label} #${i + 1}`,
        max_parts: form.parts_par_module,
        price: form.prix_par_module,
        available_parts: form.parts_par_module,
        status: "en cours",
      }));
      await supabase.from("invest_modules").insert(modules);
      navigate("/dashboard/admin/projects");
    } else {
      alert("Erreur lors de la création : " + error?.message);
    }
  };

  const fields = {
    title: "Titre du projet",
    summary: "Résumé",
    description: "Description",
    expected_return: "Rendement prévu (%)",
    duration_months: "Durée (mois)",
    target_amount: "Objectif global (€)",
    minimum_investment: "Investissement minimum (€)",
    risk_level: "Niveau de risque",
    start_date: "Date de démarrage",
    image_url: "URL image",
    prix_par_module: "Prix par cage (€)",
    parts_par_module: "Parts par cage",
    rendement_par_module: "Rendement par cage (€)",
    module_label: "Libellé du module (ex: Cage)",
    video_url: "Lien vidéo",
  };

  return (
    <MDBox p={4} maxWidth={1000} mx="auto" bgcolor="#F8FAFC">
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        🌟 Nouveau projet modulaire
      </Typography>

      <Grid container spacing={3} mt={2}>
        {Object.entries(fields).map(([key, label], index) => (
          <Grid item xs={12} sm={6} key={key}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <TextField
                    fullWidth
                    label={label}
                    name={key}
                    value={(form as any)[key]}
                    onChange={handleChange}
                    type={key.includes("date")
                      ? "date"
                      : key.includes("prix") ||
                        key.includes("rendement") ||
                        key.includes("return") ||
                        key.includes("amount") ||
                        key.includes("parts")
                      ? "number"
                      : "text"}
                    InputLabelProps={key.includes("date") ? { shrink: true } : undefined}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Paper sx={{ p: 3, textAlign: "center" }} elevation={3}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ bgcolor: "primary.main", px: 4, py: 1.5 }}
              >
                ✅ Enregistrer le projet & créer les modules
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default AdminNewProjectPage;

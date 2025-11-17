// 📁 AdminModulesPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

const AdminModulesPage = () => {
  const { id } = useParams();
  const [modules, setModules] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [fictiveModules, setFictiveModules] = useState<number>(0);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase
        .from("invest_modules")
        .select("*")
        .eq("project_id", id);
      if (data) setModules(data);
    };

    const fetchProject = async () => {
      const { data } = await supabase
        .from("invest_projects")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setProject(data);
    };

    if (id) {
      fetchModules();
      fetchProject();
    }
  }, [id]);

  const handleFictiveSubmit = async () => {
    if (!project) return;
    const toCreate = [];

    for (let i = 0; i < fictiveModules; i++) {
      toCreate.push({
        name: `Cage fictive #${modules.length + i + 1}`,
        project_id: id,
        total_parts: project.parts_per_module,
        available_parts: 0,
        price: project.module_price,
        type: project.module_type,
        is_fictive: true,
      });
    }

    const { error } = await supabase.from("invest_modules").insert(toCreate);
    if (!error) {
      setSuccess("✅ Cages fictives ajoutées.");
      setFictiveModules(0);
    }
  };

  const realCount = modules.filter((m) => !m.is_fictive).length;
  const fictiveCount = modules.filter((m) => m.is_fictive).length;

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <Typography variant="h4" fontWeight="bold" gutterBottom color="#0D9488">
        Cages du projet : {project?.title || "..."}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Cages réelles : {realCount} | Cages fictives : {fictiveCount}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Nombre de cages fictives"
            type="number"
            fullWidth
            value={fictiveModules}
            onChange={(e) => setFictiveModules(Number(e.target.value))}
          />
          <Button
            variant="outlined"
            sx={{ mt: 2, color: "#0D9488", borderColor: "#0D9488" }}
            onClick={handleFictiveSubmit}
          >
            📈 Ajouter des cages fictives
          </Button>
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Liste des cages existantes
      </Typography>

      <Grid container spacing={2}>
        {modules.map((m) => (
          <Grid item xs={12} md={4} key={m.id}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">{m.name}</Typography>
                <Typography variant="body2">Parts dispo : {m.available_parts}</Typography>
                <Typography variant="body2">Type : {m.type}</Typography>
                <Typography variant="body2">
                  {m.is_fictive ? "Fictive" : "Réelle"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
};

export default AdminModulesPage;

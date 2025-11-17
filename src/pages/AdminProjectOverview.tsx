// 📁 AdminProjectOverview.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Button } from "@mui/material";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";
import ComplexStatisticsCard from "../ui/components/Cards/ComplexStatisticsCard";

const AdminProjectOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalInvestments: 0,
    totalInvestors: 0,
    realModules: 0,
    fictiveModules: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [{ count: projectCount }, { data: investments }, { data: modules }] = await Promise.all([
        supabase.from("invest_projects").select("id", { count: "exact", head: true }),
        supabase.from("investments").select("amount_invested, user_id"),
        supabase.from("invest_modules").select("is_fictive"),
      ]);

      const totalInvestments = investments?.reduce((sum, i) => sum + i.amount_invested, 0) || 0;
      const totalInvestors = new Set(investments?.map(i => i.user_id)).size;
      const realModules = modules?.filter(m => !m.is_fictive).length || 0;
      const fictiveModules = modules?.filter(m => m.is_fictive).length || 0;

      setStats({
        totalProjects: projectCount || 0,
        totalInvestments,
        totalInvestors,
        realModules,
        fictiveModules,
      });
    };

    fetchData();
  }, []);

  const shortcuts = [
    { label: "➕ Nouveau projet", path: "/dashboard/admin/nouveau-projet" },
    { label: "📦 Voir tous les projets", path: "/dashboard/admin/projects" },
    { label: "💼 Investissements", path: "/dashboard/admin/investissements" },
    { label: "🛡️ Engagements", path: "/dashboard/admin/engagements" },
    { label: "👥 Utilisateurs", path: "/dashboard/admin/utilisateurs" },
  ];

  return (
    <MDBox p={4} bgcolor="#F8FAFC">

      <Typography variant="h4" fontWeight="bold" gutterBottom color="#0D9488">
        Vue d’ensemble des projets
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={6} md={3}>
          <ComplexStatisticsCard
            icon="folder"
            title="📁 Projets"
            count={stats.totalProjects}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ComplexStatisticsCard
            icon="euro"
            title="💰 Total investi"
            count={`${stats.totalInvestments.toLocaleString()} €`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ComplexStatisticsCard
            icon="group"
            title="👤 Investisseurs"
            count={stats.totalInvestors}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ComplexStatisticsCard
            icon="podcasts"
            title="🐟 Cages réelles"
            count={`${stats.realModules} +${stats.fictiveModules}`}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom mt={4}>
        Actions rapides
      </Typography>

      <Grid container spacing={2}>
        {shortcuts.map(({ label, path }) => (
          <Grid item key={path}>
            <Button
              variant="outlined"
              onClick={() => navigate(path)}
              sx={{ color: "#0D9488", borderColor: "#0D9488", "&:hover": { bgcolor: "#0D948810" } }}
            >
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
};

export default AdminProjectOverview;

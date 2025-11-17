// src/pages/AdminOverviewPage.tsx
// ✅ AdminOverviewPage.tsx — version corrigée avec gestion fine des suffixes
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Box, Card, CardContent, Typography, Avatar, Paper } from "@mui/material";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import GavelIcon from "@mui/icons-material/Gavel";
import CampaignIcon from "@mui/icons-material/Campaign";

type Summary = {
  total: number;
  rendement: number;
  modules: number;
  engagements: number;
};

const AdminOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<Summary>({
    total: 0,
    rendement: 0,
    modules: 0,
    engagements: 0,
  });
  const [reminders, setReminders] = useState<string[]>([]);
  const [news, setNews] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchSummary = async () => {
      const { data, error } = await supabase.rpc("get_admin_summary", { user_id: user.id });
      if (!error && data) setSummary(data as Summary);
    };
    fetchSummary();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: r } = await supabase
        .from("admin_reminders")
        .select("content")
        .order("created_at", { ascending: false });

      const { data: n } = await supabase
        .from("admin_news")
        .select("content")
        .order("created_at", { ascending: false });

      if (r) setReminders(r.map((item: any) => item.content));
      if (n) setNews(n.map((item: any) => item.content));
    };
    fetchData();
  }, []);

  const displayName = (user as any)?.full_name || user?.email?.split("@")[0] || "Admin";

  const statCards: Array<{
    title: string;
    icon: React.ReactNode;
    value: number;
    color: string;
    suffix?: string; // <-- suffix défini par carte
    decimals?: number;
  }> = [
    {
      title: "Total investi",
      icon: <DashboardIcon style={{ color: "white" }} />,
      value: summary.total,
      color: "#4caf50",
      suffix: " €", // € uniquement ici
    },
    {
      title: "Rendement estimé",
      icon: <CampaignIcon style={{ color: "white" }} />,
      value: summary.rendement,
      color: "#2196f3",
      suffix: " %",
      decimals: 2,
    },
    {
      title: "Modules",
      icon: <InventoryIcon style={{ color: "white" }} />,
      value: summary.modules,
      color: "#3f51b5",
      suffix: "", // pas d’unité
    },
    {
      title: "Engagements",
      icon: <GavelIcon style={{ color: "white" }} />,
      value: summary.engagements,
      color: "#ff9800",
      suffix: "", // pas d’unité
    },
  ];

  const chartData = [
    { name: "Agri", value: 40 },
    { name: "Énergie", value: 30 },
    { name: "Services", value: 20 },
    { name: "Autres", value: 10 },
  ];
  const colors = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        🎛️ Tableau de bord administrateur
      </MDTypography>

      <MDTypography variant="subtitle1" gutterBottom color="text.secondary">
        Bonjour {displayName}, voici une vue d’ensemble de la plateforme.
      </MDTypography>

      {/* Cartes KPI */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={3}
        mt={2}
        mb={4}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card sx={{ borderRadius: 4, p: 2, bgcolor: "white", boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      <CountUp
                        end={stat.value}
                        duration={1.2}
                        separator=" "
                        decimals={stat.decimals || 0}
                        suffix={stat.suffix ?? ""} // <-- on n’impose plus " €"
                      />
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Rappels + Piechart */}
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
        <Paper elevation={2} sx={{ p: 3, flex: 2 }}>
          <MDTypography variant="h6" gutterBottom color="primary">
            📌 Rappels système
          </MDTypography>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {reminders.length === 0 ? (
              <li>Aucun rappel pour le moment.</li>
            ) : (
              reminders.map((item, idx) => <li key={idx}>{item}</li>)
            )}
          </ul>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, flex: 1, minWidth: 320 }}>
          <MDTypography variant="h6" gutterBottom color="secondary">
            🔍 Projets par catégorie
          </MDTypography>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* News */}
      <Box mt={4}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <MDTypography variant="h6" gutterBottom color="secondary">
            🗞️ Dernières actualités internes
          </MDTypography>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {news.length === 0 ? (
              <li>Aucune actualité récente.</li>
            ) : (
              news.map((item, idx) => <li key={idx}>{item}</li>)
            )}
          </ul>
        </Paper>
      </Box>
    </MDBox>
  );
};

export default AdminOverviewPage;

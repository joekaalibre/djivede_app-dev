// ✅ InvestorOverviewPage.tsx — version premium avec cartes modernes et graphiques animés

import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Grid, Paper, Alert, Box, Card, CardContent, Typography, Avatar } from "@mui/material";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import { platformCurrency } from "../lib/constants";
import CountUp from "react-countup";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LayersIcon from "@mui/icons-material/Layers";
import GavelIcon from "@mui/icons-material/Gavel";
import { fetchApi } from "../lib/fetcher";

const InvestorOverviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total: 0,
    rendement: 0,
    modules: 0,
    engagements: 0,
    total_intentions: 0,
  });
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [donutData, setDonutData] = useState<any[]>([]);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const fetchSummary = async () => {
      const { data, error } = await supabase.rpc("get_investor_summary", { user_id: user.id });

       if (error) {
        console.error("[Djivedé] ❌ Erreur RPC get_investor_summary:", error);
       return;
       }

      const result = Array.isArray(data) ? data[0] : data;

       if (result) {
        setSummary({
          total: result.total || 0,
          rendement: result.rendement || 0,
          modules: result.modules || 0,
          engagements: result.engagements || 0,
          total_intentions: result.total_intentions || 0,
        });
        console.log("[Djivedé] ✅ Résumé chargé :", result);
       }
    };


    const checkProfile = async () => {
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).single();
      if (!data?.full_name || !data?.phone) setIsIncomplete(true);
    };

    const fetchGraphData = async () => {
      const [{ data: confirmed }, { data: intentions }, { data: projects }] = await Promise.all([
        supabase.from("invest_subscribers").select("amount_paid, created_at, project_ref").eq("user_id", user.id),
        supabase.from("investment_intentions").select("amount, created_at, project_id").eq("user_id", user.id),
        supabase.from("invest_projects").select("id, title")
      ]);

      const projectMap: Record<string, string> = {};
      projects?.forEach(p => { projectMap[p.id] = p.title });
      setProjectNames(projectMap);

      const dateMap: Record<string, { invested: number; pending: number }> = {};
      confirmed?.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        if (!dateMap[date]) dateMap[date] = { invested: 0, pending: 0 };
        dateMap[date].invested += item.amount_paid || 0;
      });
      intentions?.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        if (!dateMap[date]) dateMap[date] = { invested: 0, pending: 0 };
        dateMap[date].pending += parseFloat(item.amount || 0);
      });
      const formatted = Object.entries(dateMap).map(([date, values]) => ({ date, ...values }));
      setChartData(formatted);

      const projectStats: Record<string, number> = {};
      confirmed?.forEach((item) => {
        if (!projectStats[item.project_ref]) projectStats[item.project_ref] = 0;
        projectStats[item.project_ref] += item.amount_paid || 0;
      });
      const pie = Object.entries(projectStats).map(([id, value]) => ({ name: projectMap[id] || id, value }));
      setDonutData(pie);
    };

    fetchSummary();
    checkProfile();
    fetchGraphData();

    const alreadyResynced = localStorage.getItem("resynced_" + user.id);
    if (!alreadyResynced) {
      fetchApi("/resync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
        .then(() => localStorage.setItem("resynced_" + user.id, "true"))
        .catch((err) => console.error("Resync error:", err));
    }
  }, [user]);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Investisseur";
  const colors = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

const statCards = [
  {
    title: "Total investi",
    icon: <AccountBalanceWalletIcon style={{ color: "white" }} />,
    value: summary.total,
    color: "#4caf50",
  },
  {
    title: "Rendement estimé",
    icon: <TrendingUpIcon style={{ color: "white" }} />,
    value: summary.rendement,
    color: "#2196f3",
  },
  {
    title: "Modules",
    icon: <LayersIcon style={{ color: "white" }} />,
    value: summary.modules,
    color: "#009688",
  },
  {
    title: "Engagements",
    icon: <GavelIcon style={{ color: "white" }} />,
    value: summary.engagements,
    color: "#ff9800",
  },
];


  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        💼 Mon tableau de bord
      </MDTypography>

      <MDTypography variant="subtitle1" gutterBottom color="text.secondary">
        Bonjour {displayName}, voici l’état de vos investissements.
      </MDTypography>

      {isIncomplete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Profil incomplet.{' '}
          <Link to="/dashboard/profil" style={{ textDecoration: "underline", fontWeight: 500 }}>
            Cliquez ici pour le compléter
          </Link>
        </Alert>
      )}

      <Grid container spacing={3} mt={2} mb={4}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
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
                      <Typography variant="h6" color={"text.primary"}>
                        <CountUp
                           end={stat.value}
                           duration={1.2}
                           separator=" "
                           decimals={
                                     stat.title === "Rendement estimé"
                                     ? 2
                                     : stat.title === "Total investi"
                                     ? 0
                                     : 0
                                    }
                          suffix={
                                  stat.title === "Rendement estimé"
                                  ? "%"
                                  : stat.title === "Total investi"
                                  ? ` ${platformCurrency}`
                                  : ""
                                 }
                          />
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <MDTypography variant="h6" mb={2}>Historique des investissements</MDTypography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Legend />
                <Bar dataKey="invested" fill="#4caf50" name="Investi" />
                <Bar dataKey="pending" fill="#ff9800" name="Intentions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <MDTypography variant="h6" mb={2}>Rendement par projet</MDTypography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default InvestorOverviewPage;

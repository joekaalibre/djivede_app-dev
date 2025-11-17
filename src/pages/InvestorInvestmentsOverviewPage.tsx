import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { formatPrice } from "../utils/currency";
import { useNavigate } from "react-router-dom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PieChartIcon from "@mui/icons-material/PieChart";
import TimelineIcon from "@mui/icons-material/Timeline";

interface Investment {
  project_id: string;
  project_title: string;
  total_invested: number;
  total_parts: number;
  modules: Array<{
    module_id: string;
    module_name: string;
    parts: number;
    amount_paid: number;
    status: string;
  }>;
}

const InvestorInvestmentsOverviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalProjects: 0,
    totalModules: 0,
    totalParts: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchInvestments = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. Récupérer toutes les parts de l'investisseur
        const { data: parts, error: partsError } = await supabase
          .from("invest_module_parts")
          .select(`
            id,
            part,
            amount_paid,
            status,
            module_id,
            invest_modules (
              id,
              name,
              project_id,
              price,
              max_parts,
              available_parts,
              invest_projects (
                id,
                title,
                description,
                prix_par_module,
                parts_par_module
              )
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "payé")
          .order("created_at", { ascending: false });

        if (partsError) throw partsError;

        // 2. Grouper par projet
        const grouped: Record<string, Investment> = {};
        let totalInvested = 0;
        let totalParts = 0;

        (parts || []).forEach((part: any) => {
          const module = part.invest_modules;
          const project = module?.invest_projects;

          if (!project) return;

          const projectId = project.id;
          totalInvested += Number(part.amount_paid || 0);
          totalParts += Number(part.part || 0);

          if (!grouped[projectId]) {
            grouped[projectId] = {
              project_id: projectId,
              project_title: project.title,
              total_invested: 0,
              total_parts: 0,
              modules: [],
            };
          }

          grouped[projectId].total_invested += Number(part.amount_paid || 0);
          grouped[projectId].total_parts += Number(part.part || 0);
          grouped[projectId].modules.push({
            module_id: module.id,
            module_name: module.name,
            parts: Number(part.part || 0),
            amount_paid: Number(part.amount_paid || 0),
            status: part.status,
          });
        });

        const investmentsList = Object.values(grouped);

        setInvestments(investmentsList);
        setStats({
          totalInvested,
          totalProjects: investmentsList.length,
          totalModules: (parts || []).length,
          totalParts,
        });
      } catch (err: any) {
        console.error("❌ Erreur chargement investissements:", err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={4} bgcolor="#F8FAFC" minHeight="100vh">
      <Typography variant="h4" fontWeight="bold" mb={4} color="primary">
        📊 Vue d'ensemble de mes investissements
      </Typography>

      {/* Statistiques globales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#7c3aed" }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total investi
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="#7c3aed">
                    {formatPrice(stats.totalInvested, "EUR")}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#0891b2" }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Projets actifs
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="#0891b2">
                    {stats.totalProjects}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#059669" }}>
                  <PieChartIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Modules acquis
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="#059669">
                    {stats.totalModules}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#dc2626" }}>
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Parts totales
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="#dc2626">
                    {stats.totalParts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des projets investis */}
      {investments.length === 0 ? (
        <Alert severity="info">
          Vous n'avez pas encore d'investissement actif. Consultez nos projets disponibles pour commencer.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {investments.map((investment) => (
            <Grid item xs={12} key={investment.project_id}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {investment.project_title}
                  </Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <Chip
                      label={`${formatPrice(investment.total_invested, "EUR")} investi`}
                      color="success"
                      variant="filled"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/dashboard/mes-projets/${investment.project_id}`)}
                    >
                      Voir le suivi
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progression de votre investissement
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {investment.total_parts} parts
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (investment.total_parts / 100) * 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Détail des modules :
                </Typography>

                <List dense>
                  {investment.modules.map((mod, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        bgcolor: "#F1F5F9",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight="600">
                              {mod.module_name}
                            </Typography>
                            <Chip label={mod.status} size="small" color="success" />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              {mod.parts} part{mod.parts > 1 ? "s" : ""}
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" color="primary">
                              {formatPrice(mod.amount_paid, "EUR")}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default InvestorInvestmentsOverviewPage;

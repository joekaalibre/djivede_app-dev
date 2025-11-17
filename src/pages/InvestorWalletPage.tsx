import React, { useEffect, useState } from "react";
import { Wallet as WalletIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import CountUp from "react-countup";
import { platformCurrency } from "../lib/constants";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { motion } from "framer-motion";
import { fetchApi } from "../lib/fetcher";

const InvestorWalletPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total: 0,
    rendement: 0,
    last_investment: null as string | null,
    total_intentions: 0,
    modules: 0,
    engagements: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    supabase
      .rpc("get_investor_summary", { user_id: user.id })
      .then(({ data, error }) => {
        if (error) {
          console.error("[Djivedé] ❌ Erreur RPC get_investor_summary:", error);
          return;
        }

        if (data) {
          const result = Array.isArray(data) ? data[0] : data;

          setSummary({
            total: result.total || 0,
            rendement: result.rendement || 0,
            last_investment: result.last_investment || null,
            total_intentions: result.total_intentions || 0,
            modules: result.modules || 0,
            engagements: result.engagements || 0,
          });

          console.log("[Djivedé] ✅ Résumé portefeuille :", result);
        }
      });

    // Resync automatique une fois
    const alreadyResynced = localStorage.getItem("resynced_" + user.id);
    if (!alreadyResynced) {
      fetchApi("/resync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
        .then(() => {
          localStorage.setItem("resynced_" + user.id, "true");
        })
        .catch((err) => {
          console.error("[Djivedé] ❌ Erreur lors du resync:", err);
        });
    }
  }, [user]);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Investisseur";

  return (
    <MDBox p={4} maxWidth={700} mx="auto" bgcolor="#F8FAFC">
      <Box className="flex items-center mb-6">
        <WalletIcon className="text-pink-600 mr-3" size={28} />
        <MDTypography variant="h4" className="text-pink-600">
          Mon portefeuille
        </MDTypography>
      </Box>

      <Typography className="text-gray-600 mb-6">
        Bonjour {displayName}, voici un aperçu de vos investissements.
      </Typography>

      {summary.total_intentions > 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Vous avez <strong>{summary.total_intentions.toLocaleString()} {platformCurrency}</strong>{" "}
          d’intentions non confirmées.{" "}
          <Button
            onClick={() => navigate("/dashboard/investissements")}
            variant="outlined"
            size="small"
            sx={{ ml: 2 }}
          >
            Voir les intentions
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ borderRadius: 4, p: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "success.main", width: 48, height: 48 }}>
                    <AccountBalanceWalletIcon sx={{ color: "white" }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total investi
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      <CountUp end={summary.total} duration={1.2} separator=" " suffix={` ${platformCurrency}`} />
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ borderRadius: 4, p: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "info.main", width: 48, height: 48 }}>
                    <TrendingUpIcon sx={{ color: "white" }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rendement estimé (4 ans)
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      <CountUp end={summary.rendement} duration={1.2} separator=" " decimals={2} suffix="%" />
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
            <MDTypography variant="body2" color="text.secondary">
              Merci pour votre confiance. Vous pouvez consulter vos engagements à tout moment via le menu.
            </MDTypography>
          </Paper>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default InvestorWalletPage;

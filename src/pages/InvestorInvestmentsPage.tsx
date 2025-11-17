// ✅ InvestorInvestmentsPage.tsx — version améliorée visuellement avec animations

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/AuthProvider";
import InvestPaymentModal from "../components/InvestPaymentModal";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  Grid
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { platformCurrency } from "../lib/constants";
import CountUp from "react-countup";
import PaidIcon from "@mui/icons-material/Paid";
import AlarmIcon from "@mui/icons-material/Alarm";
import { motion } from "framer-motion";

const InvestorInvestmentsPage = () => {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState<any[]>([]);
  const [intentions, setIntentions] = useState<any[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const [{ data: confirmedData }, { data: intentionsData }, { data: projects }] = await Promise.all([
        supabase.from("invest_subscribers").select("*").eq("user_id", user.id),
        supabase.from("investment_intentions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("invest_projects").select("id, title"),
      ]);

      if (confirmedData) setConfirmed(confirmedData);
      if (intentionsData) setIntentions(intentionsData);
      if (projects) {
        const map = projects.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        setProjectsMap(map);
      }
    };

    fetchData();
  }, [user]);

  const totalInvested = confirmed.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
  const totalPending = intentions.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);

  const groupIntentions = intentions.reduce((acc: Record<string, any[]>, i) => {
    const key = i.project_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(i);
    return acc;
  }, {});

  return (
    <Box p={4}>
      {/* Résumé en haut */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card sx={{ p: 2, borderRadius: 4 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <PaidIcon sx={{ color: "white" }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">Investi</Typography>
                  <Typography variant="h6" color="success.main">
                    <CountUp end={totalInvested} duration={1.5} separator=" " suffix={` ${platformCurrency}`} />
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card sx={{ p: 2, borderRadius: 4 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <AlarmIcon sx={{ color: "white" }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">Intentions</Typography>
                  <Typography variant="h6" color="warning.main">
                    <CountUp end={totalPending} duration={1.5} separator=" " suffix={` ${platformCurrency}`} />
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Investissements confirmés */}
      <Typography variant="h5" mb={2} fontWeight={600}>
        💰 Mes investissements confirmés
      </Typography>

      {confirmed.length === 0 ? (
        <Typography>Aucun investissement confirmé.</Typography>
      ) : (
        confirmed.map((item) => (
          <motion.div key={item.id} whileHover={{ scale: 1.01 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography fontWeight="bold">
                  {projectsMap[item.project_ref]?.title || item.project_ref}
                </Typography>
                <Typography>Montant payé : {item.amount_paid} {platformCurrency}</Typography>
                <Typography>Méthode : {item.payment_method}</Typography>
                <Chip
                  label={item.confirmed ? "Confirmé" : "En attente"}
                  color={item.confirmed ? "success" : "warning"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      <Divider sx={{ my: 4 }} />

      {/* Intentions d'investissement */}
      <Typography variant="h5" mb={2} fontWeight={600}>
        🦓 Mes intentions d’investissement
      </Typography>

      {Object.entries(groupIntentions).map(([projectId, rows]) => (
        <Accordion key={projectId} defaultExpanded sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">
              {projectsMap[projectId]?.title || projectId}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {rows.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography>Montant : {item.amount} {platformCurrency}</Typography>
                  <Typography>Méthode : {item.method}</Typography>
                  <Typography>
                    Date : {new Date(item.created_at).toLocaleDateString("fr-FR")}
                  </Typography>
                  <Chip
                    label={item.status}
                    color="default"
                    size="small"
                    sx={{ my: 1 }}
                  />
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelected({
                        amount: parseInt(item.amount),
                        projectId: item.project_id,
                        projectName: projectsMap[item.project_id]?.title || item.project_id,
                        email: item.email,
                        userId: item.user_id,
                      })}
                    >
                      Payer maintenant
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={async () => {
                        await supabase.from("investment_intentions").delete().eq("id", item.id);
                        setIntentions((prev) => prev.filter((i) => i.id !== item.id));
                      }}
                    >
                      Annuler
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Modal de paiement */}
      <InvestPaymentModal
        open={!!selected}
        onClose={() => setSelected(null)}
        amount={selected?.amount || 0}
        projectId={selected?.projectId || ""}
        projectName={selected?.projectName || ""}
        userId={selected?.userId || ""}
        email={selected?.email || ""}
      />
    </Box>
  );
};

export default InvestorInvestmentsPage;

import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Alert, Chip, Button, Avatar, CircularProgress, TextField
} from "@mui/material";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { fetchApi } from "../lib/fetcher";

const AdminInvestmentsPage = () => {
  const [intentionsLater, setIntentionsLater] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [confirmed, setConfirmed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ email: "", project: "" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("📥 Chargement des intentions et confirmations...");

        const [{ data: intentions, error: err1 }, { data: confirmedSubs, error: err2 }] = await Promise.all([
          supabase.from("investment_intentions").select("*").eq("paid", false).order("created_at", { ascending: false }),
          supabase.from("invest_subscribers").select("*").eq("paid", true).order("created_at", { ascending: false }),
        ]);

        if (err1 || err2) {
          console.error("Erreur chargement Supabase :", err1, err2);
          return;
        }

        console.log("✅ Intentions récupérées :", intentions?.length);
        console.log("✅ Subscriptions confirmées :", confirmedSubs?.length);

        const plusTard = intentions?.filter(i => i.method === "plus-tard") || [];
        const toValidate = intentions?.filter(i => ["virement", "carte"].includes(i.method)) || [];

        console.log("📌 Intentions 'plus tard' :", plusTard.length);
        console.log("📌 Intentions à valider :", toValidate.length);

        setIntentionsLater(plusTard);
        setPending(toValidate);
        setConfirmed(confirmedSubs || []);
      } catch (err) {
        console.error("Erreur générale chargement investissements :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleValidatePayment = async (item: any) => {
    console.log("✅ Validation manuelle de :", item);
    try {
      await fetchApi("/api/admin/validate-investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, userId: item.user_id, email: item.email }),
      });
      setPending(prev => prev.filter(p => p.id !== item.id));
    } catch (err) {
      console.error("❌ Erreur validation :", err);
    }
  };

  const handleReject = async (id: string) => {
    console.log("❌ Rejet de l'intention :", id);
    try {
      await supabase.from("investment_intentions").delete().eq("id", id);
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const filterData = (arr: any[]) =>
    arr.filter(i =>
      (i.full_name?.toLowerCase().includes(filter.email.toLowerCase()) ||
        i.email?.toLowerCase().includes(filter.email.toLowerCase())) &&
      i.project_id?.toLowerCase().includes(filter.project.toLowerCase())
    );

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        📊 Suivi des investissements
      </MDTypography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          label="Filtrer par investisseur (nom ou email)"
          value={filter.email}
          onChange={(e) => setFilter({ ...filter, email: e.target.value })}
        />
        <TextField
          fullWidth
          label="Filtrer par projet (id)"
          value={filter.project}
          onChange={(e) => setFilter({ ...filter, project: e.target.value })}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <Box display="flex" gap={3} flexWrap="wrap">
          {/* INTENTIONS PLUS TARD */}
          <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
            <MDTypography variant="h6" mb={2}>📥 Intentions « Plus tard »</MDTypography>
            {filterData(intentionsLater).length === 0 ? (
              <Alert severity="info">Aucune intention en mode « plus tard ».</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Projet</TableCell>
                    <TableCell>Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(intentionsLater).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.full_name}</TableCell>
                      <TableCell>{item.project_id}</TableCell>
                      <TableCell>{item.amount} FCFA</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* À VALIDER */}
          <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
            <MDTypography variant="h6" mb={2}>🧾 Paiements à valider</MDTypography>
            {filterData(pending).length === 0 ? (
              <Alert severity="info">Aucun paiement en attente.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Méthode</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(pending).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.full_name}</TableCell>
                      <TableCell>{item.amount} FCFA</TableCell>
                      <TableCell>
                        <Chip label={item.method} size="small" color={item.method === "virement" ? "warning" : "primary"} />
                      </TableCell>
                      <TableCell>
                        <Button color="success" size="small" onClick={() => handleValidatePayment(item)}>Valider</Button>
                        <Button color="error" size="small" onClick={() => handleReject(item.id)} sx={{ ml: 1 }}>Rejeter</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* CONFIRMÉS */}
          <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
            <MDTypography variant="h6" mb={2}>✅ Investissements confirmés</MDTypography>
            {filterData(confirmed).length === 0 ? (
              <Alert severity="info">Aucun investissement validé.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(confirmed).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <MonetizationOnIcon sx={{ color: "white" }} />
                          </Avatar>
                          {item.full_name || item.email}
                        </Box>
                      </TableCell>
                      <TableCell>{item.amount_paid} FCFA</TableCell>
                      <TableCell>{format(new Date(item.created_at), "dd/MM/yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Box>
      )}
    </MDBox>
  );
};

export default AdminInvestmentsPage;

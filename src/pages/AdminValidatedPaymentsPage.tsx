import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Button,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../utils/currency";
import { format } from "date-fns";

interface ValidatedPayment {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  project_title: string;
  amount_paid: number;
  created_at: string;
  engagement_id?: string;
  engagement_status?: string;
}

const AdminValidatedPaymentsPage = () => {
  const [payments, setPayments] = useState<ValidatedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Récupérer tous les invest_subscribers payés
      const { data: subscribers, error: subError } = await supabase
        .from("invest_subscribers")
        .select(`
          id,
          user_id,
          email,
          full_name,
          amount_paid,
          created_at,
          project_ref,
          invest_projects (title)
        `)
        .eq("paid", true)
        .order("created_at", { ascending: false });

      if (subError) throw subError;

      // Récupérer les engagements associés
      const userIds = [...new Set(subscribers?.map((s) => s.user_id).filter(Boolean))];
      const projectIds = [...new Set(subscribers?.map((s) => s.project_ref).filter(Boolean))];

      const { data: engagements, error: engError } = await supabase
        .from("invest_engagements")
        .select("id, user_id, project_id, status")
        .in("user_id", userIds)
        .in("project_id", projectIds);

      if (engError) throw engError;

      // Mapper les données
      const mapped: ValidatedPayment[] = (subscribers || []).map((sub: any) => {
        const engagement = (engagements || []).find(
          (e: any) => e.user_id === sub.user_id && e.project_id === sub.project_ref
        );

        return {
          id: sub.id,
          user_id: sub.user_id,
          email: sub.email,
          full_name: sub.full_name,
          project_title: sub.invest_projects?.title || "—",
          amount_paid: Number(sub.amount_paid || 0),
          created_at: sub.created_at,
          engagement_id: engagement?.id,
          engagement_status: engagement?.status,
        };
      });

      setPayments(mapped);
    } catch (err: any) {
      console.error("Erreur chargement paiements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) =>
    p.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    p.email.toLowerCase().includes(filter.toLowerCase()) ||
    p.project_title.toLowerCase().includes(filter.toLowerCase())
  );

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount_paid, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} bgcolor="#F8FAFC" minHeight="100vh">
      <Typography variant="h4" fontWeight="bold" mb={4} color="primary">
        ✅ Paiements validés
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Filtrer par nom, email ou projet"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <Box>
          <Chip
            label={`${filteredPayments.length} paiement(s)`}
            color="info"
            sx={{ mr: 2 }}
          />
          <Chip
            label={`Total : ${formatPrice(totalAmount, "EUR")}`}
            color="success"
            variant="filled"
          />
        </Box>
      </Box>

      {filteredPayments.length === 0 ? (
        <Alert severity="info">Aucun paiement validé trouvé</Alert>
      ) : (
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F1F5F9" }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Investisseur</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Projet</strong></TableCell>
                <TableCell align="right"><strong>Montant</strong></TableCell>
                <TableCell><strong>Engagement</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>
                    {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{payment.full_name}</TableCell>
                  <TableCell>{payment.email}</TableCell>
                  <TableCell>{payment.project_title}</TableCell>
                  <TableCell align="right">
                    <strong>{formatPrice(payment.amount_paid, "EUR")}</strong>
                  </TableCell>
                  <TableCell>
                    {payment.engagement_id ? (
                      <Chip
                        label={payment.engagement_status || "créé"}
                        size="small"
                        color={payment.engagement_status === "validé" ? "success" : "warning"}
                      />
                    ) : (
                      <Chip label="Aucun" size="small" color="default" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Box mt={3}>
        <Button variant="outlined" onClick={fetchPayments}>
          🔄 Actualiser
        </Button>
      </Box>
    </Box>
  );
};

export default AdminValidatedPaymentsPage;

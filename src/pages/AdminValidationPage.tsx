// ✅ AdminValidationPage.tsx — Validation des intentions & investissements
import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Box,
  Chip,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";
import { fetchApi } from "../lib/fetcher";

const AdminValidationPage = () => {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [intentions, setIntentions] = useState<any[]>([]);
  const [status, setStatus] = useState<{ success?: string; error?: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: engagementsData, error: eError } = await supabase
      .from("invest_engagements")
      .select("id, amount, status, user_id, project_id, created_at, profiles(full_name, email)")
      .eq("status", "en_attente");
    if (eError) return setStatus({ error: "Erreur chargement engagements." });
    setEngagements(engagementsData || []);

    const { data: intentionsData, error: iError } = await supabase
      .from("investment_intentions")
      .select("id, full_name, email, amount, project_id, method, paid, created_at")
      .eq("paid", true)
      .is("user_id", null);
    if (iError) return setStatus({ error: "Erreur chargement intentions." });
    setIntentions(intentionsData || []);
  };

  const handleAction = async (id: string, action: "validé" | "rejeté") => {
    const engagement = engagements.find((e) => e.id === id);
    if (!engagement) return;

    try {
      const res = await fetch("/api/admin/validate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          user_id: engagement.user_id,
          email: engagement.profiles.email,
          full_name: engagement.profiles.full_name,
          project_id: engagement.project_id,
          amount: engagement.amount,
          engagement_id: engagement.id,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Erreur serveur");

      setStatus({ success: `Engagement ${action}. Email envoyé.` });
      fetchData();
    } catch (err: any) {
      console.error("❌ Erreur action:", err);
      setStatus({ error: "Erreur validation côté serveur." });
    }
  };

  return (
    <MDBox p={4} maxWidth={1400} mx="auto" bgcolor="#F8FAFC">
      <Typography variant="h4" fontWeight="bold" gutterBottom color="#0D9488">
        ✅ Validation des investissements
      </Typography>

      {status.success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          {status.success}
        </Alert>
      )}
      {status.error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {status.error}
        </Alert>
      )}

      {/* Table des engagements */}
      <Paper sx={{ mb: 6 }}>
        <Typography p={2} variant="h6" fontWeight="bold">
          Engagements en attente
        </Typography>
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Projet</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {engagements.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>{e.profiles.full_name}</TableCell>
                <TableCell>{e.profiles.email}</TableCell>
                <TableCell>{e.project_id}</TableCell>
                <TableCell>{e.amount} €</TableCell>
                <TableCell>{new Date(e.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="success" sx={{ mr: 1 }} onClick={() => handleAction(e.id, "validé")}>Valider</Button>
                  <Button variant="outlined" color="error" onClick={() => handleAction(e.id, "rejeté")}>Rejeter</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Liste intentions payées sans user_id */}
      {intentions.length > 0 && (
        <Paper>
          <Typography p={2} variant="h6" fontWeight="bold">
            Intentions payées sans compte lié
          </Typography>
          <Table>
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Méthode</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {intentions.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.full_name}</TableCell>
                  <TableCell>{i.email}</TableCell>
                  <TableCell>{i.project_id}</TableCell>
                  <TableCell>{i.amount} FCFA</TableCell>
                  <TableCell>{i.method}</TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </MDBox>
  );
};

export default AdminValidationPage;

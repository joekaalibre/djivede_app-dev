// ✅ AdminInvestValidatePage.tsx — Page d'administration pour valider les investissements en attente (intentions + investissements)
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchApi } from "../lib/fetcher";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../utils/currency";

const AdminInvestValidatePage = () => {
  const [tab, setTab] = useState(0);
  const [intentions, setIntentions] = useState<any[]>([]);
  const [engagements, setEngagements] = useState<any[]>([]);
  const [validatedInvestments, setValidatedInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: projects, error: projErr } = await supabase.from("invest_projects").select("id, title");
        if (projErr) throw projErr;
        const projectsMap = Object.fromEntries((projects || []).map(p => [p.id, p.title]));

        const { data: intentionsData, error: intErr } = await supabase
          .from("investment_intentions")
          .select("id, email, full_name, amount, method, created_at, project_id, paid, user_id")
          .eq("paid", false);
        if (intErr) throw intErr;

        const groupedIntentions = (intentionsData || [])
          .filter((i) => !!i.user_id)
          .map((i) => ({
            ...i,
            project_title: projectsMap[i.project_id] || "—",
          }));

        setIntentions(groupedIntentions);

        const { data: engagementsData, error: engErr } = await supabase
          .from("invest_engagements")
          .select("*, profiles(full_name, email), invest_projects(title)")
          .eq("status", "en_attente")
          .order("created_at", { ascending: false });
        if (engErr) throw engErr;
        setEngagements(engagementsData);

        const { data: validatedData, error: valErr } = await supabase
          .from("invest_engagements")
          .select("*, profiles(full_name, email), invest_projects(title)")
          .eq("status", "validé")
          .order("created_at", { ascending: false });
        if (valErr) throw valErr;
        setValidatedInvestments(validatedData);
      } catch (err) {
        console.error("❌ Erreur fetch:", err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleValidation = async (engagement, action: "validé" | "rejeté") => {
    setFeedback("");
    try {
      // ✅ Appel direct à l'edge function Supabase
      const { data, error } = await supabase.functions.invoke('validate-payment', {
        body: {
          engagement_id: engagement.id,
          user_id: engagement.user_id,
          email: engagement.profiles?.email,
          full_name: engagement.profiles?.full_name,
          project_id: engagement.project_id,
          amount: engagement.engagement_amount || engagement.amount,
          action,
        },
      });

      if (error) throw error;
      const res = data;

      if (res.success) {
        setFeedback(`✅ Engagement ${action} avec succès pour ${engagement.profiles?.full_name}`);
        setEngagements((prev) => prev.filter((e) => e.id !== engagement.id));
        if (action === "validé") {
          // Recharger les validés
          const { data: validated } = await supabase
            .from("invest_engagements")
            .select("*, profiles(full_name, email), invest_projects(title)")
            .eq("status", "validé")
            .order("created_at", { ascending: false });
          if (validated) setValidatedInvestments(validated);
        }
      } else {
        setFeedback("❌ Erreur lors de la validation. Voir console.");
        console.error(res);
      }
    } catch (err: any) {
      setFeedback(`❌ Erreur: ${err.message}`);
      console.error(err);
    }
  };

  const handleManualValidation = async (intention) => {
    console.log("🟡 Envoi validation manuelle pour:", intention);
    try {
      // ✅ Appel direct à l'edge function Supabase
      const { data, error } = await supabase.functions.invoke('validate-payment', {
        body: {
          engagement_id: "simulateur",
          user_id: intention.user_id,
          email: intention.email,
          full_name: intention.full_name,
          project_id: intention.project_id,
          amount: intention.amount,
          action: "validé",
        },
      });

      if (error) throw error;
      console.log("✅ Réponse Supabase:", data);

      if (data.success) {
        setFeedback(`✅ Paiement validé manuellement pour ${intention.full_name}`);
        // Retirer l'intention immédiatement
        setIntentions((prev) => prev.filter((i) => i.id !== intention.id));

        // Recharger pour mettre à jour tous les onglets
        setTimeout(() => {
          fetchData();
        }, 500);
      } else {
        setFeedback("❌ Erreur lors de la validation manuelle. Voir console.");
        console.error(data);
      }
    } catch (err: any) {
      setFeedback(`❌ Erreur: ${err.message}`);
      console.error(err);
    }
  };

  const groupedByInvestor = intentions.reduce((acc, curr) => {
    acc[curr.user_id] = acc[curr.user_id] || [];
    acc[curr.user_id].push(curr);
    return acc;
  }, {});

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        🧾 Validation paiements investisseurs
      </Typography>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 4 }}>
        <Tab label="Intentions non payées" />
        <Tab label="Engagements en attente" />
        <Tab label="Investissements validés" />
      </Tabs>

      {loading && <CircularProgress />} 
      {error && <Alert severity="error">{error}</Alert>}
      {feedback && <Alert severity="info" sx={{ mb: 2 }}>{feedback}</Alert>}

      {!loading && tab === 0 && (
        Object.keys(groupedByInvestor).length === 0 ? (
          <Alert severity="success">Aucune intention en attente.</Alert>
        ) : (
          Object.entries(groupedByInvestor).map(([userId, intentionsList]) => {
            const total = intentionsList.reduce((sum, i) => sum + (i.amount || 0), 0);
            return (
              <Accordion key={userId} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">
                    {intentionsList[0].full_name} — {intentionsList[0].email} ({intentionsList.length} intentions, total : {formatPrice(total, "EUR")})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Projet</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Méthode</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Valider</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {intentionsList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.project_title}</TableCell>
                          <TableCell>{formatPrice(item.amount, "EUR")}</TableCell>
                          <TableCell>{item.method}</TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleManualValidation(item)}
                            >
                              Valider manuellement
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })
        )
      )}

      {/* Engagements à valider */}
      {!loading && tab === 1 && (
        engagements.length === 0 ? (
          <Alert severity="success">Aucun engagement à valider.</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {engagements.map((eng) => (
                <TableRow key={eng.id}>
                  <TableCell>{eng.profiles?.full_name}</TableCell>
                  <TableCell>{eng.profiles?.email}</TableCell>
                  <TableCell>{eng.invest_projects?.title || "—"}</TableCell>
                  <TableCell>{formatPrice(eng.amount, "EUR")}</TableCell>
                  <TableCell>{new Date(eng.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleValidation(eng, "validé")}
                      sx={{ mr: 1 }}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleValidation(eng, "rejeté")}
                    >
                      Rejeter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      {/* Investissements validés */}
      {!loading && tab === 2 && (
        validatedInvestments.length === 0 ? (
          <Alert severity="info">Aucun paiement validé pour le moment.</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validatedInvestments.map((eng) => (
                <TableRow key={eng.id}>
                  <TableCell>{eng.profiles?.full_name}</TableCell>
                  <TableCell>{eng.profiles?.email}</TableCell>
                  <TableCell>{eng.invest_projects?.title || "—"}</TableCell>
                  <TableCell>{formatPrice(eng.amount, "EUR")}</TableCell>
                  <TableCell>{new Date(eng.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}
    </Box>
  );
};

export default AdminInvestValidatePage;

// InvestorEngagementsPage.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Typography,
  Checkbox,
  Button,
  Box,
  Alert,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "../components/AuthProvider";

const InvestorEngagementsPage = () => {
  const { user, profile } = useAuth();
  const [engagements, setEngagements] = useState<any[]>([]);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchEngagements(user.id);
    }
  }, [user]);

  const fetchEngagements = async (userId: string) => {
    const { data, error } = await supabase
      .from("invest_engagements")
      .select("id, project_id, amount, status, contract_signed, signature_date, invest_projects(title)")
      .eq("user_id", userId)
      .in("status", ["validé", "en_attente"]);

    if (error) {
      console.error("Erreur chargement engagements", error);
      setStatus("Erreur chargement engagements");
      return;
    }

    setEngagements(data);
  };

  const handleSign = async (id: string) => {
    const acceptedVal = accepted[id];
    if (!acceptedVal) return;

    const engagement = engagements.find((e) => e.id === id);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("invest_engagements")
      .update({
        contract_signed: true,
        signature_date: now,
      })
      .eq("id", id);

    if (error) {
      console.error("Erreur signature", error);
      setStatus("Erreur lors de la signature.");
    } else {
      // Notification admin
      const fullName = user?.full_name || profile?.full_name || "Un investisseur";
      const projectTitle = engagement?.invest_projects?.title || engagement?.project_id;

      await supabase.from("admin_reminders").insert({
        type: "engagement_signed",
        message: `${fullName} a signé l'engagement pour ${projectTitle}`,
        user_id: user?.id,
        project_id: engagement?.project_id,
        is_read: false,
      });

      setStatus("Contrat signé !");
      fetchEngagements(user.id);
    }
  };

  return (
    <Box maxWidth={800} mx="auto" p={4}>
      <Typography variant="h4" mb={4}>
        📜 Mes engagements
      </Typography>

      {status && <Alert severity="info" sx={{ mb: 2 }}>{status}</Alert>}

      {engagements.length === 0 && <Typography>Aucun engagement pour l’instant.</Typography>}

      {engagements.map((eng) => (
        <Box key={eng.id} border="1px solid #ddd" borderRadius={2} p={3} mb={3}>
          <Typography><strong>Projet :</strong> {eng.invest_projects?.title || eng.project_id}</Typography>
          <Typography><strong>Montant :</strong> {eng.amount} €</Typography>
          <Typography><strong>Status :</strong> {eng.status}</Typography>

          {eng.contract_signed ? (
            <Typography color="success.main" mt={2}>
              ✅ Contrat signé le {new Date(eng.signature_date).toLocaleString("fr-FR")}
            </Typography>
          ) : (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={accepted[eng.id] || false}
                    onChange={(e) =>
                      setAccepted({ ...accepted, [eng.id]: e.target.checked })
                    }
                  />
                }
                label="Je signe numériquement cet engagement"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSign(eng.id)}
                disabled={!accepted[eng.id]}
              >
                Signer le contrat
              </Button>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default InvestorEngagementsPage;

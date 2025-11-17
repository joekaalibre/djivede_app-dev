import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import { fetchApi } from "../lib/fetcher";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Props {
  open: boolean;
  onClose: () => void;
  amount: number;
  projectName: string;
  projectId: string;
  userId: string;
  email: string;
}

const InvestPaymentModal: React.FC<Props> = ({
  open,
  onClose,
  amount,
  projectName,
  projectId,
  userId,
  email,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wire">("card");
  const [fees, setFees] = useState({
    diligence: 0,
    management: 0,
    stripe: 0,
    total: 0,
    rendement: 0,
  });
  const [projectInfo, setProjectInfo] = useState<any>(null);

  // Chargement des infos projet
  useEffect(() => {
    if (!projectId || !open) return;

    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("invest_projects")
        .select("expected_return, prix_par_module")
        .eq("id", projectId)
        .maybeSingle();

      if (error) {
        console.error("Erreur chargement projet :", error.message);
        setProjectInfo(null);
      } else {
        setProjectInfo(data);
      }
    };

    fetchProject();
  }, [projectId, open]);

  // Calcul des frais
  useEffect(() => {
    if (!projectInfo || !amount) return;

    const diligenceFee = 1000;
    const managementFee =
      amount < projectInfo.prix_par_module ? 75 : 150;
    const stripeFee = amount * 0.03;
    const rendement =
      amount * ((projectInfo.expected_return || 10) / 100);

    setFees({
      diligence: diligenceFee,
      management: managementFee,
      stripe: stripeFee,
      total: Math.round(
        amount + diligenceFee + managementFee + (paymentMethod === "card" ? stripeFee : 0)
      ),
      rendement,
    });
  }, [amount, projectInfo, paymentMethod]);

  const handleConfirm = async () => {
    if (paymentMethod === "card") {
      try {
        const stripe = await stripePromise;
        const { id: sessionId } = await fetchApi("/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: fees.total * 100,
            email,
            project_id: projectId,
            user_id: userId,
          }),
        });

        await stripe?.redirectToCheckout({ sessionId });
      } catch (err) {
        console.error("Erreur Stripe :", err);
      }
    } else if (paymentMethod === "wire") {
      try {
        await supabase
          .from("investment_intentions")
          .update({ method: "virement", paid: false })
          .eq("project_id", projectId)
          .eq("user_id", userId);

        window.location.href = "/merci-virement";
        onClose();
      } catch (err) {
        console.error("Erreur lors de la mise à jour du virement :", err);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Paiement pour {projectName}</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Montant de l'intention : <strong>{amount.toLocaleString()} €</strong>
        </Typography>
        <Typography gutterBottom>
          Frais de diligence : {fees.diligence.toLocaleString()} €
        </Typography>
        <Typography gutterBottom>
          Frais de gestion : {fees.management.toLocaleString()} €
        </Typography>
        {paymentMethod === "card" && (
          <Typography gutterBottom>
            Frais Stripe : {fees.stripe.toFixed(2)} €
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">
          Total à payer : <strong>{fees.total.toLocaleString()} €</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Rendement estimé : {fees.rendement.toFixed(2)} € (
          {(projectInfo?.expected_return || 10)}%)
        </Typography>

        {/* Choix du mode de paiement */}
        <Box mt={3}>
          <FormControl>
            <RadioGroup
              row
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as "card" | "wire")
              }
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label="Carte bancaire (Stripe)"
              />
              <FormControlLabel
                value="wire"
                control={<Radio />}
                label="Virement bancaire"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Bloc RIB si virement */}
        {paymentMethod === "wire" && (
          <Box mt={3} p={2} bgcolor="#f1f5f9" borderRadius={2}>
            <Typography variant="subtitle2" gutterBottom>
              Coordonnées bancaires pour virement :
            </Typography>
            <Typography variant="body2">
              Titulaire : <strong>DJIVEDE INVEST</strong>
              <br />
              IBAN : <strong>FR76 3000 4000 0500 0001 2345 678</strong>
              <br />
              BIC : <strong>BNPAFRPP</strong>
              <br />
              Banque : <strong>BNP Paribas</strong>
              <br />
              Référence à indiquer : <strong>{email}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirmer et payer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvestPaymentModal;

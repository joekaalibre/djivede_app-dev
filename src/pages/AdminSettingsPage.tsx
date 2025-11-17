// 📁 AdminSettingsPage.tsx
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    id: undefined,
    isPaymentPageActive: false,
    isInvestorRegistrationOpen: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("*").limit(1).single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    const { error } = await supabase
      .from("settings")
      .update({ [key]: newSettings[key] })
      .eq("id", settings.id);

    if (error) toast.error("Erreur de mise à jour");
    else toast.success("Réglage mis à jour !");
  };

  return (
    <MDBox p={4} maxWidth={700} mx="auto" bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" mb={4} color="#0D9488">
        Réglages généraux
      </MDTypography>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span>Activer la page de paiement</span>
          <Switch
            checked={settings.isPaymentPageActive}
            onCheckedChange={() => handleToggle("isPaymentPageActive")}
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Ouvrir l'inscription investisseur</span>
          <Switch
            checked={settings.isInvestorRegistrationOpen}
            onCheckedChange={() => handleToggle("isInvestorRegistrationOpen")}
          />
        </div>
      </div>
    </MDBox>
  );
};

export default AdminSettingsPage;

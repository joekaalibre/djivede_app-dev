import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";
import { fetchApi } from "../lib/fetcher";

const AdminEngagementsPage = () => {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("invest_engagements")
        .select(`
          id,
          amount,
          status,
          created_at,
          contract_url,
          user_id,
          project:project_id (
            id,
            title,
            summary
          )
        `);

      if (error) {
        console.error("Erreur Supabase :", error);
      } else {
        setEngagements(data || []);
      }

      setLoading(false);
    };

    fetch();
  }, []);

  const sendValidationEmail = async (engagement: any) => {
    const { data: user } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", engagement.user_id)
      .single();

    if (!user) return;

    const { data: template } = await supabase
      .from("email_templates")
      .select("subject, body")
      .eq("code", "investment_validated")
      .single();

    if (!template) return;

    const subject = template.subject
      .replace("{{first_name}}", user.full_name?.split(" ")[0] || "")
      .replace("{{project_title}}", engagement.project?.title || "");

    const body = template.body
      .replace("{{first_name}}", user.full_name?.split(" ")[0] || "")
      .replace("{{project_title}}", engagement.project?.title || "")
      .replace("{{invested_amount}}", `${engagement.amount?.toLocaleString?.() || "0"} €`);

    await fetchApi("/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.email,
        subject,
        html: body,
      }),
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const confirm = window.confirm(`Confirmer le changement de statut en "${newStatus}" ?`);
    if (!confirm) return;

    const { error } = await supabase
      .from("invest_engagements")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      const updatedEngagement = engagements.find((e) => e.id === id);
      if (newStatus === "validé" && updatedEngagement) {
        await sendValidationEmail(updatedEngagement);
      }

      setEngagements((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
    }
  };

  const renderStatusBadge = (statuts: string) => {
    const colors: any = {
      validé: "bg-green-100 text-green-700",
      rejeté: "bg-red-100 text-red-700",
      en_attente: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <Typography variant="h5" gutterBottom sx={{ color: "#0D9488", fontWeight: "bold" }}>
        📄 Suivi des engagements
      </Typography>

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="min-w-full text-sm border mt-4">
            <thead style={{ backgroundColor: "#E5E7EB" }}>
              <tr>
                <th className="p-2 text-left">Projet</th>
                <th className="p-2 text-left">Montant</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-left">Contrat</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {engagements.map((e) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{e.project?.summary || "—"}</td>
                  <td className="p-2">{e.amount?.toLocaleString?.() || "0"} €</td>
                  <td className="p-2">
                    {e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-2">{renderStatusBadge(e.status)}</td>
                  <td className="p-2">
                    {e.contract_url ? (
                      <a
                        href={`https://pmdjjakfzzcyqtscefkt.supabase.co/storage/v1/object/public/documents/${e.contract_url}`}
                        className="text-indigo-600 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir PDF
                      </a>
                    ) : (
                      "Non transmis"
                    )}
                  </td>
                  <td className="p-2 space-x-2">
                    <Button size="small" onClick={() => updateStatus(e.id, "validé")} color="success">
                      Valider
                    </Button>
                    <Button size="small" onClick={() => updateStatus(e.id, "rejeté")} color="error">
                      Rejeter
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MDBox>
  );
};

export default AdminEngagementsPage;

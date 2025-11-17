// 📁 src/lib/emailHelper.ts
import { supabase } from "./supabase";

export type EmailPayload = {
  email: string;
  subject: string;
  html: string;
  related_table?: string;
  related_id?: string;
  send_at?: string; // ISO 8601 format (optionnel)
};

/**
 * Met un email en file d'attente dans email_automation_queue
 * @param payload Données email à insérer dans la table
 */
export const queueEmail = async (payload: EmailPayload): Promise<void> => {
  const { email, subject, html, related_table, related_id, send_at } = payload;

  const { error } = await supabase.from("email_automation_queue").insert({
    email,
    subject,
    html_body: html,
    related_table,
    related_id,
    send_at
  });

  if (error) {
    console.error("❌ Échec de mise en file d’attente de l’email :", error);
    throw new Error("Impossible d'ajouter l'email à la queue Supabase");
  }

  console.log("✅ Email mis en file d’attente pour:", email);
};

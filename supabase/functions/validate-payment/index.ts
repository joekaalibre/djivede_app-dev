import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ValidatePaymentRequest {
  engagement_id?: string;
  user_id: string;
  email: string;
  full_name: string;
  project_id: string;
  amount: number;
  action: "validé" | "rejeté";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body: ValidatePaymentRequest = await req.json();
    const { engagement_id, user_id, email, full_name, project_id, amount, action } = body;

    if (!user_id || !project_id || !amount || !email || !action) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "validé") {
      // 1. Marquer l'intention comme payée
      await supabaseAdmin
        .from("investment_intentions")
        .update({ paid: true })
        .eq("email", email)
        .eq("project_id", project_id);

      // 2. Vérifier si invest_subscribers existe déjà
      const { data: existingSub } = await supabaseAdmin
        .from("invest_subscribers")
        .select("id")
        .eq("user_id", user_id)
        .eq("project_ref", project_id)
        .maybeSingle();

      if (existingSub?.id) {
        await supabaseAdmin
          .from("invest_subscribers")
          .update({ paid: true, amount_paid: amount, total_to_pay: amount })
          .eq("id", existingSub.id);
      } else {
        await supabaseAdmin.from("invest_subscribers").insert({
          user_id,
          email,
          full_name,
          project_ref: project_id,
          paid: true,
          amount_paid: amount,
          total_to_pay: amount,
        });
      }

      // 3. Resync user data (simplifié)
      await supabaseAdmin
        .from("investment_intentions")
        .update({ user_id })
        .eq("email", email)
        .is("user_id", null);

      await supabaseAdmin
        .from("invest_leads")
        .update({ user_id })
        .eq("email", email)
        .is("user_id", null);

      // 4. Allocation des modules via RPC
      await supabaseAdmin.rpc("allocate_modules_for_user", {
        p_user_id: user_id,
        p_project_id: project_id,
        p_invested_amount: amount,
      });

      // 5. Gérer l'engagement
      let engagementIdToUpdate = engagement_id;
      if (!engagement_id || engagement_id === "simulateur") {
        const { data: insertEng } = await supabaseAdmin
          .from("invest_engagements")
          .insert({
            user_id,
            project_id,
            engagement_amount: amount,
            status: "en_attente",
          })
          .select()
          .single();
        engagementIdToUpdate = insertEng?.id;
      } else {
        await supabaseAdmin
          .from("invest_engagements")
          .update({ status: "validé" })
          .eq("id", engagement_id);
      }

      // 6. Log promo redemption
      try {
        const { data: lastIntention } = await supabaseAdmin
          .from("investment_intentions")
          .select("id, promo_code")
          .eq("email", email)
          .eq("project_id", project_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (lastIntention?.promo_code) {
          await supabaseAdmin.from("promo_redemptions").insert({
            code: lastIntention.promo_code,
            email,
            project_id,
            intention_id: lastIntention.id,
            status: "redeemed",
          });
        }
      } catch (e) {
        console.warn("⚠️ redemption log failed (non bloquant):", e.message);
      }

      // 7. Envoyer email de confirmation (via edge function email)
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            template: "payment-success",
            data: { full_name, amount },
          }),
        });
      } catch (emailErr) {
        console.warn("Email envoi échoué (non bloquant):", emailErr);
      }

      return new Response(
        JSON.stringify({ success: true, engagement_id: engagementIdToUpdate }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rejeté" && engagement_id) {
      await supabaseAdmin
        .from("invest_engagements")
        .update({ status: "rejeté" })
        .eq("id", engagement_id);

      // Envoyer email de rejet
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            template: "payment-rejected",
            data: { full_name },
          }),
        });
      } catch (emailErr) {
        console.warn("Email rejet échoué (non bloquant):", emailErr);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Action invalide ou ID manquant." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Erreur validate-payment:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
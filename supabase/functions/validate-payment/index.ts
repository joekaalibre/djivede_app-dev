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

    console.log("✅ Validation payment request:", { user_id, email, project_id, amount, action });

    if (!user_id || !project_id || !amount || !email || !action) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "validé") {
      // 1. Marquer toutes les intentions comme payées
      const { error: intentionError } = await supabaseAdmin
        .from("investment_intentions")
        .update({ paid: true, status: "completed" })
        .eq("email", email)
        .eq("project_id", project_id)
        .eq("paid", false);

      if (intentionError) {
        console.error("❌ Erreur update intentions:", intentionError);
      }

      // 2. Créer ou mettre à jour invest_subscribers
      const { data: existingSub } = await supabaseAdmin
        .from("invest_subscribers")
        .select("id")
        .eq("user_id", user_id)
        .eq("project_ref", project_id)
        .maybeSingle();

      if (existingSub?.id) {
        const { error: updateError } = await supabaseAdmin
          .from("invest_subscribers")
          .update({ 
            paid: true, 
            amount_paid: amount, 
            total_to_pay: amount,
            confirmed: true 
          })
          .eq("id", existingSub.id);

        if (updateError) {
          console.error("❌ Erreur update subscriber:", updateError);
          throw updateError;
        }
        console.log("✅ Subscriber updated:", existingSub.id);
      } else {
        const { error: insertError } = await supabaseAdmin
          .from("invest_subscribers")
          .insert({
            user_id,
            email,
            full_name,
            project_ref: project_id,
            paid: true,
            confirmed: true,
            amount_paid: amount,
            total_to_pay: amount,
          });

        if (insertError) {
          console.error("❌ Erreur insert subscriber:", insertError);
          throw insertError;
        }
        console.log("✅ Subscriber created");
      }

      // 3. Resync user data (lier intentions orphelines)
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
      console.log("🔄 Allocation modules...");
      const { data: allocResult, error: allocError } = await supabaseAdmin.rpc(
        "allocate_modules_for_user",
        {
          p_user_id: user_id,
          p_project_id: project_id,
          p_invested_amount: amount,
        }
      );

      if (allocError) {
        console.error("❌ Erreur allocation:", allocError);
        throw allocError;
      }
      console.log("✅ Modules allocated:", allocResult);

      // 5. Créer ou mettre à jour l'engagement
      let finalEngagementId = engagement_id;

      if (!engagement_id || engagement_id === "simulateur") {
        // Créer un nouvel engagement
        const { data: newEng, error: engError } = await supabaseAdmin
          .from("invest_engagements")
          .insert({
            user_id,
            project_id,
            engagement_amount: amount,
            amount: amount,
            status: "validé",
            contract_sent: false,
            contract_signed: false,
            fee_applied: 0,
          })
          .select()
          .single();

        if (engError) {
          console.error("❌ Erreur création engagement:", engError);
          throw engError;
        }
        finalEngagementId = newEng?.id;
        console.log("✅ Engagement created:", finalEngagementId);
      } else {
        // Mettre à jour l'engagement existant
        const { error: updateEngError } = await supabaseAdmin
          .from("invest_engagements")
          .update({ status: "validé" })
          .eq("id", engagement_id);

        if (updateEngError) {
          console.error("❌ Erreur update engagement:", updateEngError);
          throw updateEngError;
        }
        console.log("✅ Engagement updated:", engagement_id);
      }

      // 6. Log promo redemption si applicable
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
          console.log("✅ Promo redeemed:", lastIntention.promo_code);
        }
      } catch (e) {
        console.warn("⚠️ Redemption log failed (non-bloquant):", e.message);
      }

      // 7. Envoyer email de confirmation
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
        console.log("✅ Email sent");
      } catch (emailErr) {
        console.warn("⚠️ Email failed (non-bloquant):", emailErr);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          engagement_id: finalEngagementId,
          allocations: allocResult 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rejeté" && engagement_id) {
      const { error } = await supabaseAdmin
        .from("invest_engagements")
        .update({ status: "rejeté" })
        .eq("id", engagement_id);

      if (error) throw error;

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
        console.warn("⚠️ Email rejet failed (non-bloquant):", emailErr);
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
    console.error("❌ Erreur globale validate-payment:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
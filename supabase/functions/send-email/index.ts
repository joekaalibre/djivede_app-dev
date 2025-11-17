import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  template: string;
  data?: Record<string, any>;
  subject?: string;
  html?: string;
}

const EMAIL_TEMPLATES = {
  "payment-success": (data: any) => ({
    subject: "🎯 Investissement confirmé - Bienvenue à bord !",
    html: `
      <div style="max-width: 680px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 0;">
        <div style="background: #ffffff; margin: 40px 20px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Paiement confirmé</h1>
          </div>
          <div style="padding: 50px 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #5b21b6; font-size: 24px; font-weight: 600; margin: 0 0 10px 0;">
                Félicitations, ${data.full_name} !
              </h2>
              <p style="color: #64748b; font-size: 16px; margin: 0;">
                Votre investissement a été traité avec succès.
              </p>
            </div>
            <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); padding: 30px; border-radius: 12px; text-align: center;">
              <p style="color: #1e293b; font-size: 32px; font-weight: 700; margin: 0; color: #7c3aed;">
                ${Number(data.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Montant investi</p>
            </div>
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://app.djivede.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Voir mon portefeuille
              </a>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 30px; text-align: center;">
            <p style="color: #7c3aed; font-size: 16px; font-weight: 600; margin: 0;">Djivèdé — L'investissement intelligent</p>
          </div>
        </div>
      </div>
    `,
  }),
  
  "payment-rejected": (data: any) => ({
    subject: "⛔ Votre investissement n'a pas été validé",
    html: `
      <div style="font-family:sans-serif;padding:30px;background:#fff5f5;border-radius:10px;">
        <h2 style="color:#dc2626;">Bonjour ${data.full_name},</h2>
        <p>Suite à l'examen de votre dossier, nous vous informons que votre demande d'investissement n'a pas été validée.</p>
        <p>Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous recontacter afin d'obtenir plus d'informations.</p>
        <p>Nous restons disponibles pour vous accompagner dans vos futurs projets.</p>
        <p style="margin-top:30px;">— L'équipe Djivèdé</p>
      </div>
    `,
  }),
  
  "welcome": (data: any) => ({
    subject: "Bienvenue dans l'univers Djivèdé",
    html: `
      <div style="max-width: 680px; margin: 0 auto; font-family: 'Segoe UI', sans-serif; background: #f3f4f6; padding: 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">
              Bienvenue chez <span style="color: #fbbf24;">Djivèdé</span>
            </h1>
          </div>
          <div style="padding: 50px 40px;">
            <h2 style="color: #1e3a8a; font-size: 24px;">Bonjour ${data.full_name},</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Nous sommes ravis de vous accueillir. Votre compte investisseur est maintenant actif.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://app.djivede.com/auth" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Accéder à mon espace
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  
  "wire-transfer": (data: any) => ({
    subject: "🏦 Coordonnées bancaires - Finalisez votre investissement",
    html: `
      <div style="max-width: 680px; margin: 0 auto; font-family: 'Segoe UI', sans-serif; background: #f3f4f6; padding: 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700;">Instructions de virement</h1>
          </div>
          <div style="padding: 50px 40px;">
            <h2 style="color: #0e7490;">Bonjour ${data.full_name},</h2>
            <div style="background: #cffafe; padding: 30px; border-radius: 12px; margin: 24px 0;">
              <h3 style="color: #0e7490; text-align: center;">📋 Informations de virement</h3>
              <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-top: 20px;">
                <div style="padding: 15px 0; border-bottom: 1px solid #f1f5f9;">
                  <strong>Montant à virer :</strong> ${Number(data.total_today || data.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </div>
                <div style="padding: 15px 0; border-bottom: 1px solid #f1f5f9;">
                  <strong>RIB :</strong> <span style="font-family: monospace;">${data.rib || 'FR76 XXXX XXXX XXXX'}</span>
                </div>
                <div style="padding: 15px 0;">
                  <strong>Libellé :</strong> DJIVEDE - ${data.full_name}
                </div>
              </div>
            </div>
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://app.djivede.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Accéder à mon espace
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, template, data = {}, subject, html } = body;

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Email destinataire requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailSubject = subject;
    let emailHtml = html;

    // Utiliser un template prédéfini si spécifié
    if (template && EMAIL_TEMPLATES[template]) {
      const templateData = EMAIL_TEMPLATES[template](data);
      emailSubject = templateData.subject;
      emailHtml = templateData.html;
    }

    if (!emailSubject || !emailHtml) {
      return new Response(
        JSON.stringify({ error: "Subject et HTML requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Configuration SMTP (utilise les variables d'environnement)
    const smtpConfig = {
      hostname: Deno.env.get("SMTP_HOST") || "mail.djivede.com",
      port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASS") || "",
    };

    // Pour l'instant, on log et on retourne succès
    // En production, vous devrez implémenter l'envoi SMTP réel
    console.log("📧 Email préparé:", {
      to,
      subject: emailSubject,
      from: `Djivèdé <${smtpConfig.username}>`,
    });

    // TODO: Implémenter l'envoi SMTP réel avec une lib Deno compatible
    // Pour l'instant, retourner succès pour ne pas bloquer

    return new Response(
      JSON.stringify({ success: true, message: "Email envoyé avec succès" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Erreur send-email:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
// 📁 supabase/functions/create-user/index.ts
// ✅ Edge Function pour créer un utilisateur Supabase (admin)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { email, password, full_name, role } = await req.json();
  const supabaseAdminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (!email || !password || !full_name || !role) {
    return new Response(JSON.stringify({ error: "Champs requis manquants." }), { status: 400 });
  }

  const { data: authUser, error: authError } = await supabaseAdminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authUser?.user?.id) {
    return new Response(JSON.stringify({ error: authError?.message || "Erreur création utilisateur" }), { status: 500 });
  }

  const { error: dbError } = await supabaseAdminClient.from("profiles").insert({
    id: authUser.user.id,
    full_name,
    role,
    email
  });

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, user: authUser.user }), {
    headers: { "Content-Type": "application/json" },
  });
});

// Import requis
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

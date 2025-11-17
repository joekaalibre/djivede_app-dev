import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function DashboardIndexGate() {
  const [busy, setBusy] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;
      const role = profile?.role;
      if (role === "admin") navigate("/dashboard/admin/overview", { replace: true });
      else if (role === "candidate") navigate("/dashboard/propulse-phase2", { replace: true });
      else navigate("/dashboard/overview", { replace: true });
      setBusy(false);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return <div className="p-6 text-sm text-gray-500">Chargement…</div>;
}

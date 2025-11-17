// src/hooks/useResyncIfNeeded.ts
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export function useResyncIfNeeded() {
  const { user } = useAuth();

  useEffect(() => {
    const checkAndResync = async () => {
      if (!user?.id || !user?.email) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.full_name || !profile?.phone) {
        await fetch("/api/resync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, email: user.email }),
        });
      }
    };

    checkAndResync();
  }, [user]);
}

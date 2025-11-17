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
        // Resync sera géré automatiquement par les edge functions lors de la validation
        console.log("Profile incomplet pour:", user.email);
      }
    };

    checkAndResync();
  }, [user]);
}

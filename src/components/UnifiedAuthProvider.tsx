// ✅ UnifiedAuthProvider.tsx — version unifiée robuste pour djivede et djivede_invest

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async (shouldRedirect = false) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Erreur chargement profile:", profileError);
        setUser(null);
        setLoading(false);
        return;
      }

      const userInfo: User = {
        id: session.user.id,
        email: session.user.email || "",
        role: profile?.role || "investor",
      };
      setUser(userInfo);

      if (shouldRedirect) {
        if (userInfo.role === "admin") {
          navigate("/dashboard/admin/overview");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Erreur loadUser:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadUser(true); // redirige après connexion
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within UnifiedAuthProvider");
  return context;
};

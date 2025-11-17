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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async (shouldRedirect = false) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const userInfo = {
          id: session.user.id,
          email: session.user.email || "",
          role: profile.role,
        };
        setUser(userInfo);

        if (shouldRedirect) {
          if (userInfo.role === "admin") {
            navigate("/dashboard/admin/overview");
          } else {
            navigate("/dashboard");
          }
        }
      }
    } else {
      setUser(null);
    }

    setLoading(false);
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
    await loadUser(true); // ⬅️ redirect after login
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

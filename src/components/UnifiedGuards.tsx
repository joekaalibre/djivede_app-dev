// ✅ RequireAuth.tsx — guard universel pour accès authentifié

import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./UnifiedAuthProvider"; // même dossier que ton provider

interface Props {
  children: ReactNode;
}

export const RequireAuth = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Chargement...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

// ✅ RequireAdmin.tsx — guard admin uniquement

export const RequireAdmin = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Chargement...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

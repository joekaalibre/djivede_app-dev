import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

interface Props {
  children: ReactNode;
}

const RequireAdmin = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Chargement...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default RequireAdmin;
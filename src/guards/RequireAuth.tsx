import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Chargement...</div>;

  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

export default RequireAuth;
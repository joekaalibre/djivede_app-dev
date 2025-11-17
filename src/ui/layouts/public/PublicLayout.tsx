// 📁 src/pages/PublicLayout.tsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../../../components/Navigation"; // ✅ Barre de navigation publique
import { motion } from "framer-motion";
import { useAuth } from "../../../components/AuthProvider";

const PublicLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.role === "admin") navigate("/dashboard/admin/overview");
    else if (user) navigate("/dashboard");
    else navigate("/auth");
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <>
      <Navigation
        onDashboardClick={handleDashboardClick}
        onLogoutClick={handleLogoutClick}
      />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-14 bg-section-light text-gray-900 min-h-screen"
      >
        <Outlet />
      </motion.main>
    </>
  );
};

export default PublicLayout;

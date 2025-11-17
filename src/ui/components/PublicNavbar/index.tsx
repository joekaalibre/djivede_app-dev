import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/AuthProvider";

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "white", color: "primary.main", boxShadow: 1 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Djivede
        </Typography>

        <Box display="flex" gap={2}>
          {user ? (
            <>
              <Button color="inherit" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/auth")}>
              Connexion
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PublicNavbar;

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../../../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import NotificationsAdmin from "../../components/NotificationsAdmin";
import NotificationsInvestor from "../../components/NotificationsInvestor";
import { keyframes } from "@mui/system";

const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const checkUnread = async () => {
      const { data } = await supabase
        .from("admin_reminders")
        .select("id")
        .eq("status", "unread");
      setHasUnread((data?.length || 0) > 0);
    };

    checkUnread();

    const subscription = supabase
      .channel("reminder_updates")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "admin_reminders",
      }, checkUnread)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleNotificationClick = async () => {
    await supabase
      .from("admin_reminders")
      .update({ status: "read" })
      .eq("status", "unread");
    setHasUnread(false);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  `;

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: 1300, bgcolor: "white", color: "primary.main", boxShadow: 2 }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          Djivede
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Cloche dynamique selon rôle */}
          {user?.role === "admin" ? (
            <Box
              onClick={handleNotificationClick}
              sx={
                hasUnread
                  ? { animation: `${pulse} 1.5s infinite ease-in-out`, cursor: "pointer" }
                  : {}
              }
            >
              <NotificationsAdmin />
            </Box>
          ) : (
            <NotificationsInvestor />
          )}

          {user && (
            <>
              <IconButton
                size="large"
                aria-label="compte"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  Bienvenue {user.full_name?.split(" ")[0] || user.email.split("@")[0]}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logout();
                    handleClose();
                  }}
                >
                  Déconnexion
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;

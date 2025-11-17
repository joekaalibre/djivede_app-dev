// ✅ InvestorNotificationsPage.tsx — Liste des notifications pour l’investisseur
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/AuthProvider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { motion } from "framer-motion";

const InvestorNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
    };
    fetchNotifications();
  }, [user]);

  const markAsRead = async (notifId: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", notifId);
    setNotifications((n) => n.map((item) => (item.id === notifId ? { ...item, read: true } : item)));
  };

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        🔔 Mes notifications
      </MDTypography>

      <Grid container spacing={3} mt={2}>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" mt={2}>
            Aucune notification reçue pour le moment.
          </Typography>
        ) : (
          notifications.map((notif, idx) => (
            <Grid item xs={12} md={6} key={notif.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: notif.read ? "#f1f5f9" : "#fff" }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip
                        label={notif.type.replace("_", " ")}
                        color={notif.read ? "default" : "primary"}
                        size="small"
                      />
                      {!notif.read && (
                        <Tooltip title="Marquer comme lu">
                          <IconButton size="small" onClick={() => markAsRead(notif.id)}>
                            <MarkEmailReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" mb={1}>{notif.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(notif.created_at), "PPPp", { locale: fr })}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>
    </MDBox>
  );
};

export default InvestorNotificationsPage;

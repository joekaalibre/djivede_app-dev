import React, { useEffect, useState } from "react";
import { IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import { supabase } from "../../lib/supabase";

const NotificationsInvestor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel("notif_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, fetchUnread)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return (
    <IconButton color="inherit" onClick={() => navigate("/dashboard/notifications")}>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationsInvestor;

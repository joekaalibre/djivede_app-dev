import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../../lib/supabase";

const NotificationsAdmin = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("admin_reminders")
      .select("id, content, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => n.status === "unread").length);
    }
  };

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await supabase.from("admin_reminders").update({ status: "read" }).eq("status", "unread");
    setUnreadCount(0);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("admin_reminders").delete().eq("id", id);
    fetchNotifications();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ style: { width: 360, maxHeight: 400 } }}
      >
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="Aucune notification" />
              </ListItem>
            ) : (
              notifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(notif.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  divider
                >
                  <ListItemText
                    primary={notif.content}
                    secondary={new Date(notif.created_at).toLocaleString("fr-FR")}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationsAdmin;

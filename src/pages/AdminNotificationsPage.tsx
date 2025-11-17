// 📁 AdminNotificationsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../lib/supabase";
import MDBox from "../ui/components/MDBox";
import MDTypography from "../ui/components/MDTypography";

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("admin_reminders")
      .select("id, content, status, created_at")
      .order("created_at", { ascending: false });
    if (data) setNotifications(data);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("admin_reminders").delete().eq("id", id);
    fetchNotifications();
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filtered = notifications.filter((n) =>
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <MDTypography variant="h4" fontWeight="bold" gutterBottom color="#0D9488">
        📢 Notifications administrateur
      </MDTypography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          label="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="outlined"
          color="secondary"
          onClick={async () => {
            await supabase.from("admin_reminders").delete().neq("id", "");
            fetchNotifications();
          }}
        >
          Supprimer tout
        </Button>
      </Box>

      <Table size="small">
        <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
          <TableRow>
            <TableCell>Contenu</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((notif) => (
            <TableRow key={notif.id}>
              <TableCell>{notif.content}</TableCell>
              <TableCell>
                <Chip
                  label={notif.status === "unread" ? "Non lu" : "Lu"}
                  color={notif.status === "unread" ? "warning" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(notif.created_at).toLocaleString("fr-FR")}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(notif.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MDBox>
  );
};

export default AdminNotificationsPage;

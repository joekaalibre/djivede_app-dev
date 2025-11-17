// 📁 AdminUsersPage.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MDBox from "../ui/components/MDBox";
import { supabase } from "../lib/supabase";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error) {
        setUsers(data || []);
        setFilteredUsers(data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [roleFilter, search, users]);

  const countByRole = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <MDBox p={4} bgcolor="#F8FAFC">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold" color="#0D9488" gutterBottom>
          👥 Gestion des utilisateurs
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: "#0D9488" }}
          onClick={() => navigate("/dashboard/admin/utilisateurs/new")}
        >
          + Créer un utilisateur
        </Button>
      </Box>

      <Box display="flex" gap={4} my={3} flexWrap="wrap">
        <Typography>📌 Admins : {countByRole("admin")}</Typography>
        <Typography>🎯 Investisseurs : {countByRole("investor")}</Typography>
        <Typography>👥 Total : {users.length}</Typography>
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filtrer par rôle</InputLabel>
          <Select
            value={roleFilter}
            label="Filtrer par rôle"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
            <MenuItem value="investor">Investisseur</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Recherche"
          size="small"
          placeholder="Nom ou email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Link
                    to={`/dashboard/admin/utilisateurs/${user.id}`}
                    style={{ color: "#0D9488", textDecoration: "underline" }}
                  >
                    Voir
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </MDBox>
  );
};

export default AdminUsersPage;

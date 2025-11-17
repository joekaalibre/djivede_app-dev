// ✅ Version finale améliorée de AdminPropulseSubmissionsPage.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Stack,
  Divider,
  Link,
} from "@mui/material";
import { supabase } from "../lib/supabase";
import { fetchApi } from "../lib/fetcher";

const statusColors: Record<string, any> = {
  pending: "warning",
  validated: "success",
  rejected: "error",
};

const AdminPropulseSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("campaign_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setSubmissions(data);
      setFiltered(data);
    }
  };

// ✅ PATCH : correction appel + cohérence avec backend
const handleValidate = async () => {
  if (!selected) return;
  setLoading(true);
  try {
    const res = await fetchApi("/validate-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        email: selected.form_data.email,
        full_name: selected.form_data.full_name,
        project_name: selected.form_data.project_name,
      }),
    });

    if (!res?.success) {
      throw new Error(res?.error || "Échec de la validation");
    }

    fetchSubmissions();
    setSelected(null);
  } catch (err: any) {
    alert(err.message || "Erreur lors de la validation");
  } finally {
    setLoading(false);
  }
};


  const handleReject = async () => {
    if (!selected) return;
    setLoading(true);
    await supabase
      .from("campaign_submissions")
      .update({ status: "rejected" })
      .eq("id", selected.id);
    fetchSubmissions();
    setSelected(null);
    setLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(
      submissions.filter(
        (s) =>
          s.form_data?.full_name?.toLowerCase().includes(value) ||
          s.form_data?.project_name?.toLowerCase().includes(value)
      )
    );
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        📋 Candidatures Propulse
      </Typography>

      <TextField
        label="Rechercher..."
        fullWidth
        value={search}
        onChange={handleSearch}
        sx={{ mb: 3 }}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Projet</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((s, idx) => (
              <TableRow
                key={idx}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => setSelected(s)}
              >
                <TableCell>{s.form_data?.full_name}</TableCell>
                <TableCell>{s.form_data?.project_name}</TableCell>
                <TableCell>
                  {new Date(s.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={s.status}
                    color={statusColors[s.status] || "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setSelected(s)}>
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Dossier de {selected?.form_data?.full_name || "soumission"}
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={1} divider={<Divider flexItem />}>
              <Typography>
                <strong>Email :</strong> {selected.form_data?.email}
              </Typography>
              <Typography>
                <strong>Téléphone :</strong> {selected.form_data?.phone}
              </Typography>
              <Typography>
                <strong>Pays :</strong> {selected.country} — <strong>Ville :</strong>{" "}
                {selected.city}
              </Typography>
              <Typography>
                <strong>Projet :</strong> {selected.form_data?.project_name}
              </Typography>
              <Typography>
                <strong>Résumé :</strong> {selected.form_data?.project_summary}
              </Typography>
              <Typography>
                <strong>Public cible :</strong> {selected.form_data?.target_audience}
              </Typography>
              <Typography>
                <strong>Stade :</strong> {selected.form_data?.project_stage}
              </Typography>
              <Typography>
                <strong>Financement demandé :</strong>{" "}
                {selected.form_data?.funding_need}
              </Typography>
              <Typography>
                <strong>Modèle économique :</strong> {selected.business_model}
              </Typography>
              <Typography>
                <strong>Impact social :</strong> {selected.form_data?.social_impact}
              </Typography>
              <Typography>
                <strong>Prochaines étapes :</strong> {selected.next_steps}
              </Typography>
              <Typography>
                <strong>Vidéo pitch :</strong>{" "}
                <Link
                  href={selected.youtube_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir la vidéo
                </Link>
              </Typography>
              <Typography>
                <strong>Accepté CGU :</strong>{" "}
                {selected.accepts_terms ? "✅ Oui" : "❌ Non"}
              </Typography>
              <Typography>
                <strong>Phase actuelle :</strong> {selected.phase}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReject} color="error">
            Rejeter
          </Button>
          <Button onClick={() => setSelected(null)}>Fermer</Button>
          <Button
            onClick={handleValidate}
            disabled={selected?.status === "validated" || loading}
            variant="contained"
            color="success"
          >
            Valider pour Phase 2
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPropulseSubmissionsPage;

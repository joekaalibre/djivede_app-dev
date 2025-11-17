// ✅ AdminLeadsPage.tsx — Suivi des leads avec graphiques
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";


const COLORS = ["#0ea5e9", "#10b981", "#f97316", "#e11d48", "#6366f1"];

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(0);
  const leadsPerPage = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      const { data: leadsData } = await supabase.from("invest_leads").select("*").order("created_at", { ascending: false });
      if (leadsData) setLeads(leadsData);

      const { data: projectData } = await supabase.from("invest_projects").select("id, title");
      if (projectData) setProjects(projectData);
    };
    fetchLeads();
  }, []);

  const groupBy = (arr, key) =>
    arr.reduce((acc, obj) => {
      const val = obj[key] || "inconnu";
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

  const leadsByDay = Object.entries(
    leads.reduce((acc, lead) => {
      const day = new Date(lead.created_at).toLocaleDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {})
  ).map(([date, count]) => ({ date, count }));

  const sourceData = Object.entries(groupBy(leads, "source")).map(([name, value]) => ({ name, value }));
  const mediumData = Object.entries(groupBy(leads, "medium")).map(([name, value]) => ({ name, value }));

  return (
    <Box p={4} bgcolor="#F8FAFC">
      <Box p={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📈 Suivi des leads investisseurs
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leads par jour
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadsByDay}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition par source
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition par canal (medium)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={mediumData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                      {mediumData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ➕ Tableau des leads récents */}
        <Box mt={6}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Derniers leads enregistrés
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Nom</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Projet</th><th className="p-2 border">Actions</th>
                  <th className="p-2 border">Parts</th>
                  <th className="p-2 border">Source</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads
                  .filter(lead => !sourceFilter || lead.source === sourceFilter)
                  .slice(page * leadsPerPage, (page + 1) * leadsPerPage).map((lead, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{lead.full_name || '—'}</td>
                    <td className="p-2 border">{lead.email}</td>
                    <td className="p-2 border">{projects.find(p => p.id === lead.project_id)?.title || '—'}</td><td className="p-2 border text-center">
  <button className="text-blue-600 hover:underline mr-2" onClick={async () => {
    const { error } = await supabase.from('email_automation_queue').insert({
      email: lead.email,
      subject: 'Vous n’avez pas finalisé votre investissement',
      html_body: `<p>Bonjour ${lead.full_name || ''},</p><p>Vous avez manifesté de l’intérêt pour un projet d’investissement mais n’avez pas finalisé.</p><p>Revenez finaliser ici : <a href='/projects/${lead.project_id}/investir'>Je finalise</a></p>`,
      related_table: 'invest_leads',
      related_id: lead.id
    });
    if (!error) alert('Email programmé avec succès.');
  }}>✉️</button>
  <button className="text-green-600 hover:underline" onClick={async () => {
    const { error } = await supabase.from('auth.users').insert({
      email: lead.email,
    });
    if (!error) alert('Utilisateur converti avec succès.');
  }}>👤</button>
</td>
                    <td className="p-2 border text-center">{lead.parts}</td>
                    <td className="p-2 border">{lead.source || '—'}</td>
                    <td className="p-2 border text-gray-500">{new Date(lead.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
          <div>
            <label className="text-sm">Filtrer par source : </label>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="ml-2 border p-1">
              <option value="">Toutes</option>
              {[...new Set(leads.map(l => l.source).filter(Boolean))].map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
          <div>
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="mr-2">← Précédent</button>
            <button disabled={(page + 1) * leadsPerPage >= leads.length} onClick={() => setPage(p => p + 1)}>Suivant →</button>
          </div>
        </Box>

      </Box>
    </Box>
  );
};

export default AdminLeadsPage;

// src/ui/components/Sidebar/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Users,
  FolderKanban,
  UserPlus,
  CameraIcon,
  TrendingUp,
  Newspaper,
  Mail,
  LogOut,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  PieChart,
} from "lucide-react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Collapse,
  Divider,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useAuth } from "../../../components/AuthProvider";
import { supabase } from "../../../lib/supabase";

const drawerWidth = 240;

type Item = { to?: string; label: string; icon?: React.ReactNode; children?: Item[] };

const Sidebar = ({
  mobileOpen,
  onDrawerToggle,
  isMobile, // (réservé si besoin)
}: {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingContracts, setPendingContracts] = useState(0);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [adminUnreadReminders, setAdminUnreadReminders] = useState(0);
  const [adminUnreadNews, setAdminUnreadNews] = useState(0);
  const [openPropulse, setOpenPropulse] = useState(true);
  const [roleOverride, setRoleOverride] = useState<string | null>(null);

  // NEW: compteurs de messagerie
  const [msgUnreadAdmin, setMsgUnreadAdmin] = useState(0);
  const [msgUnreadCandidate, setMsgUnreadCandidate] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    let notifChannel: any;
    let reminderChannel: any;
    let newsChannel: any;
    let profileChannel: any;
    let msgChannel: any;

    const fetchInvestorCounts = async () => {
      const { count: payCount } = await supabase
        .from("investment_intentions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("paid", false);

      const { count: contractCount } = await supabase
        .from("invest_engagements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("contract_sent", true)
        .eq("contract_signed", false);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, pays, role")
        .eq("id", user.id)
        .maybeSingle();

      setRoleOverride(profile?.role ?? null);

      const missing = !profile?.full_name || !profile?.phone || !profile?.pays;
      setProfileIncomplete(missing);
      setPendingPayments(payCount || 0);
      setPendingContracts(contractCount || 0);
    };

    const fetchUnreadNotifs = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnreadNotifs(count || 0);
    };

    const fetchAdminUnreadReminders = async () => {
      const { count } = await supabase
        .from("admin_reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread");
      setAdminUnreadReminders(count || 0);
    };

    const fetchAdminUnreadNews = async () => {
      const { count } = await supabase
        .from("admin_news")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread");
      setAdminUnreadNews(count || 0);
    };

    // NEW: compteurs messagerie (admin & candidat)
    const fetchMsgCounters = async () => {
      if (!user?.id) return;
      const roleNow = roleOverride ?? user.role;

      if (roleNow === "admin") {
        const { count } = await supabase
          .from("propulse_messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_role", "candidate")
          .eq("read_by_admin", false);
        setMsgUnreadAdmin(count || 0);
      } else {
        const { count } = await supabase
          .from("propulse_messages")
          .select("*", { count: "exact", head: true })
          .eq("candidate_id", user.id)
          .eq("sender_role", "admin")
          .eq("read_by_candidate", false);
        setMsgUnreadCandidate(count || 0);
      }
    };

    // Suivi des changements de rôle (corrige la 1re connexion sans refresh)
    profileChannel = supabase
      .channel(`profile_role_${user.id}_${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload: any) => setRoleOverride(payload?.new?.role ?? null)
      )
      .subscribe();

    const roleNow = roleOverride ?? user?.role;

    if (roleNow !== "admin") {
      fetchInvestorCounts();
      fetchUnreadNotifs();
      fetchMsgCounters();

      notifChannel = supabase
        .channel(`notif_sidebar_${user.id}_${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          fetchUnreadNotifs
        )
        .subscribe();
    } else {
      fetchAdminUnreadReminders();
      fetchAdminUnreadNews();
      fetchMsgCounters();

      reminderChannel = supabase
        .channel(`admin_sidebar_reminders_${Date.now()}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_reminders" }, fetchAdminUnreadReminders)
        .subscribe();

      newsChannel = supabase
        .channel(`admin_sidebar_news_${Date.now()}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_news" }, fetchAdminUnreadNews)
        .subscribe();
    }

    // NEW: realtime sur messages (INSERT + UPDATE pour réagir aux lectures)
    msgChannel = supabase
      .channel(`msg_badge_${user.id}_${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "propulse_messages" },
        fetchMsgCounters
      )
      .subscribe();

    return () => {
      if (notifChannel) supabase.removeChannel(notifChannel);
      if (reminderChannel) supabase.removeChannel(reminderChannel);
      if (newsChannel) supabase.removeChannel(newsChannel);
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (msgChannel) supabase.removeChannel(msgChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roleOverride]);

  const effectiveRole = roleOverride ?? user?.role;

  // ---------- Menus ----------
  const investorItems: Item[] = [
    { to: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
    { to: "/dashboard/wallet", label: "Portefeuille", icon: <Wallet size={20} /> },
    {
      to: "/dashboard/mes-engagements",
      label: "Mes engagements",
      icon: (
        <Tooltip title="Contrat à signer">
          <Badge badgeContent={pendingContracts} color="warning" invisible={pendingContracts === 0}>
            <ShieldCheck size={20} />
          </Badge>
        </Tooltip>
      ),
    },
    {
      to: "/dashboard/investissements",
      label: "Mes investissements",
      icon: (
        <Tooltip title="Paiement(s) en attente">
          <Badge badgeContent={pendingPayments} color="error" invisible={pendingPayments === 0}>
            <TrendingUp size={20} />
          </Badge>
        </Tooltip>
      ),
    },
    { to: "/dashboard/mes-projets", label: "Suivi des projets", icon: <FolderKanban size={20} /> },
    { to: "/dashboard/mes-investissements", label: "Vue d'ensemble", icon: <PieChart size={20} /> },

    // Messagerie pour investisseurs (si tu veux l'activer aussi)
    { to: "/dashboard/messages", label: "Messagerie", icon: <MessageCircle size={20} /> },

    {
      to: "/dashboard/profil",
      label: "Mon profil",
      icon: (
        <Tooltip title="Profil incomplet">
          <Badge variant="dot" color="info" invisible={!profileIncomplete} overlap="circular">
            <AccountCircle fontSize="small" />
          </Badge>
        </Tooltip>
      ),
    },
    {
      to: "/dashboard/notifications",
      label: "Notifications",
      icon: (
        <Tooltip title="Notifications">
          <Badge color="secondary" badgeContent={unreadNotifs} invisible={unreadNotifs === 0}>
            <Mail size={20} />
          </Badge>
        </Tooltip>
      ),
    },
  ];

  const adminItems: Item[] = [
    { to: "/dashboard/admin/overview", label: "Aperçu", icon: <LayoutDashboard size={20} /> },
    { to: "/dashboard/admin/projects", label: "Projets", icon: <FolderKanban size={20} /> },
    { to: "/dashboard/admin/validate-investments", label: "Validation paiements", icon: <ShieldCheck size={20} /> },
    { to: "/dashboard/admin/engagements", label: "Engagements", icon: <ShieldCheck size={20} /> },
    { to: "/dashboard/admin/utilisateurs", label: "Utilisateurs", icon: <Users size={20} /> },
    { to: "/dashboard/admin/leads", label: "Leads", icon: <UserPlus size={20} /> },
    {
      label: "Propulse",
      icon: <TrendingUp size={20} />,
      children: [
        { to: "/dashboard/admin/propulse-submissions", label: "Candidatures" },
        { to: "/dashboard/admin/phase2", label: "Phase 2" },
      ],
    },

    // NEW: Messagerie admin (badge non-lus)
    {
      to: "/dashboard/admin/messages",
      label: "Messagerie",
      icon: (
        <Tooltip title="Messages">
          <Badge color="error" badgeContent={msgUnreadAdmin} invisible={msgUnreadAdmin === 0}>
            <MessageCircle size={20} />
          </Badge>
        </Tooltip>
      ),
    },

    { to: "/dashboard/admin/media", label: "Media", icon: <CameraIcon size={20} /> },
    {
      to: "/dashboard/admin/notifications",
      label: "Alertes système",
      icon: (
        <Tooltip title="Rappels système">
          <Badge color="error" badgeContent={adminUnreadReminders} invisible={adminUnreadReminders === 0}>
            <Mail size={20} />
          </Badge>
        </Tooltip>
      ),
    },
    {
      to: "/dashboard/admin/news",
      label: "News admin",
      icon: (
        <Tooltip title="News à traiter">
          <Badge color="info" badgeContent={adminUnreadNews} invisible={adminUnreadNews === 0}>
            <Newspaper size={20} />
          </Badge>
        </Tooltip>
      ),
    },
  ];

  const candidateItems: Item[] = [
    { to: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
    {
      label: "Propulse",
      icon: <TrendingUp size={20} />,
      children: [
        { to: "/dashboard/propulse-phase2", label: "Mon dossier (Phase 2)" },
        { to: "/dashboard/propulse-profile", label: "Mon profil" },
      ],
    },
    // NEW: Messagerie candidat (badge non-lus)
    {
      to: "/dashboard/messages",
      label: "Messagerie",
      icon: (
        <Tooltip title="Messages">
          <Badge color="error" badgeContent={msgUnreadCandidate} invisible={msgUnreadCandidate === 0}>
            <MessageCircle size={20} />
          </Badge>
        </Tooltip>
      ),
    },
  ];

  const items = useMemo(() => {
    if (effectiveRole === "admin") return adminItems;
    if (effectiveRole === "candidate") return candidateItems;
    return investorItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveRole,
    pendingContracts,
    pendingPayments,
    unreadNotifs,
    adminUnreadNews,
    adminUnreadReminders,
    profileIncomplete,
    msgUnreadAdmin,
    msgUnreadCandidate,
  ]);

  const isSelected = (to?: string) => !!to && location.pathname === to;

  const renderItem = (item: Item) => {
    if (item.children?.length) {
      const open = openPropulse || item.children.some((c) => isSelected(c.to));
      return (
        <Box key={item.label} sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => setOpenPropulse((o) => !o)}
            selected={item.children.some((c) => isSelected(c.to))}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              bgcolor: item.children.some((c) => isSelected(c.to)) ? "primary.main" : "transparent",
              color: item.children.some((c) => isSelected(c.to)) ? "white" : "grey.300",
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </ListItemButton>
          <Collapse in={open} unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 1 }}>
              {item.children.map((c) => (
                <ListItemButton
                  key={c.to}
                  component={Link}
                  to={c.to!}
                  selected={isSelected(c.to)}
                  sx={{
                    mt: 0.5,
                    borderRadius: 2,
                    pl: 5.5,
                    bgcolor: isSelected(c.to) ? "primary.main" : "transparent",
                    color: isSelected(c.to) ? "white" : "grey.300",
                    "&:hover": { bgcolor: "primary.main", color: "white" },
                  }}
                >
                  <ListItemText primary={c.label} primaryTypographyProps={{ fontSize: 13 }} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItemButton
        key={item.to || item.label}
        component={item.to ? Link : "div"}
        to={item.to as any}
        selected={isSelected(item.to)}
        sx={{
          mb: 1,
          borderRadius: 2,
          bgcolor: isSelected(item.to) ? "primary.main" : "transparent",
          color: isSelected(item.to) ? "white" : "grey.300",
          "&:hover": { bgcolor: "primary.main", color: "white" },
        }}
      >
        {item.icon && <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>}
        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
      </ListItemButton>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#1e293b",
        color: "white",
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Djivede
      </Typography>

      <List>{items.map(renderItem)}</List>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,.12)", mb: 1 }} />
        <ListItemButton onClick={logout} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          position: "fixed",
          height: "100vh",
          zIndex: 1200,
        }}
      >
        {drawerContent}
      </Box>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, bgcolor: "#1e293b", color: "white" },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;

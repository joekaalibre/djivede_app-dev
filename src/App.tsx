import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./components/AuthProvider";
import { MarketingProvider } from "./components/MarketingProvider";
import { MaterialUIControllerProvider } from "./context";

import RequireAuth from "./guards/RequireAuth";
import RequireAdmin from "./guards/RequireAdmin";

import DashboardLayout from "./ui/layouts/dashboard";
import PublicLayout from "./ui/layouts/public/PublicLayout";

// 🌐 Pages publiques
import HomePage from "./pages/HomePage";
import MusicPage from "./pages/MusicPage";
import CoachingPage from "./pages/CoachingPage";
import StoryPage from "./pages/StoryPage";
import EventsPage from "./pages/EventsPage";
import ContactPage from "./pages/ContactPage";
import CampaignPage from "./pages/CampaignPage";
import AuthPage from "./pages/AuthPage";
import InvestAfricaPage from "./pages/InvestAfricaPage";
import ThankYouPage from "./pages/ThankYouPage";
import SubscribePage from "./pages/SubscribePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectList from "./components/ProjectList";
import ProjectInvestPage from "./pages/ProjectInvestPage";
import ThankYouWirePage from "./pages/ThankYouWirePage";

// 👤 Investisseur
import InvestorOverviewPage from "./pages/InvestorOverviewPage";
import InvestorWalletPage from "./pages/InvestorWalletPage";
import InvestorInvestmentsPage from "./pages/InvestorInvestmentsPage";
import InvestorEngagementsPage from "./pages/InvestorEngagementsPage";
import InvestorProjectTrackingPage from "./pages/InvestorProjectTrackingPage";
import InvestorProfilePage from "./pages/InvestorProfilePage";
import InvestorProjectsPage from "./pages/InvestorProjectsPage";
import InvestorDocumentsPage from "./pages/InvestorDocumentsPage";
import InvestorNotificationsPage from "./pages/InvestorNotificationsPage";
import InvestorInvestmentsOverviewPage from "./pages/InvestorInvestmentsOverviewPage";

// 🚀 Propulse (candidat)
import PropulsePhase2Page from "./pages/PropulsePhase2Page";
import PropulsePhase1Page from "./pages/PropulsePhase1Page";
import PropulseProfilePage from "./pages/PropulseProfilePage";
import MessagesPage from "./pages/MessagesPage";

// 🛠️ Admin
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminProjectOverview from "./pages/AdminProjectOverview";
import AdminProjectManager from "./pages/AdminProjectManager";
import AdminNewProjectPage from "./pages/AdminNewProjectPage";
import AdminEngagementsPage from "./pages/AdminEngagementsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";
import AdminModulesPage from "./pages/AdminModulesPage";
import AdminEmailTemplatesPage from "./pages/AdminEmailTemplatesPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import AdminMediaPage from "./pages/AdminMediaPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminInvestValidatePage from "./pages/AdminInvestValidatePage";
import AdminLeadsPage from "./pages/AdminLeadsPage";
import AdminNewsPage from "./pages/AdminNewsPage";
import AdminPropulseSubmissionsPage from "./pages/AdminPropulseSubmissionsPage";
import AdminEditProjectPage from "./pages/AdminEditProjectPage";
import AdminPhase2Page from "./pages/AdminPhase2Page";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import AdminProjectPhasesPage from "./pages/AdminProjectPhasesPage";
import AdminValidatedPaymentsPage from "./pages/AdminValidatedPaymentsPage";  

// 🎯 Gate d’index de dashboard (redirige selon le rôle)
import DashboardIndexGate from "./pages/DashboardIndexGate";

function App() {
  return (
    <AuthProvider>
      <MaterialUIControllerProvider>
        <MarketingProvider>
          <Routes>
            {/* 🌍 Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<AuthPage />} />
              <Route path="music" element={<MusicPage />} />
              <Route path="coaching" element={<CoachingPage />} />
              <Route path="story" element={<StoryPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="campaign" element={<CampaignPage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="investir-afrique" element={<InvestAfricaPage />} />
              <Route path="merci" element={<ThankYouPage />} />
              <Route path="subscribe" element={<SubscribePage />} />
              <Route path="projects" element={<ProjectList />} />
              <Route path="merci-virement" element={<ThankYouWirePage />} />
            </Route>

            {/* 🔐 Dashboard */}
            <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              {/* 👉 Gate: renvoie /overview, /admin/overview, ou /propulse-phase2 */}
              <Route index element={<DashboardIndexGate />} />

              {/* Investisseur */}
              <Route path="overview" element={<InvestorOverviewPage />} />
              <Route path="wallet" element={<InvestorWalletPage />} />
              <Route path="documents" element={<InvestorDocumentsPage />} />
              <Route path="mes-engagements" element={<InvestorEngagementsPage />} />
              <Route path="investissements" element={<InvestorInvestmentsPage />} />
              <Route path="projets/:id/suivi" element={<InvestorProjectTrackingPage />} />
              <Route path="mes-projets" element={<InvestorProjectsPage />} />
              <Route path="mes-investissements" element={<InvestorInvestmentsOverviewPage />} />
              <Route path="profil" element={<InvestorProfilePage />} />
              <Route path="notifications" element={<InvestorNotificationsPage />} />

              {/* Candidat */}
              <Route path="propulse-phase2" element={<PropulsePhase2Page />} />
              <Route path="propulse-phase1" element={<PropulsePhase1Page />} />
              <Route path="propulse-profile" element={<PropulseProfilePage />} />
              <Route path="messages" element={<MessagesPage />} />
              

              {/* Admin */}
              <Route path="admin/overview" element={<RequireAdmin><AdminOverviewPage /></RequireAdmin>} />
              <Route path="admin/projects" element={<RequireAdmin><AdminProjectManager /></RequireAdmin>} />
              <Route path="admin/projects/:id/edit" element={<RequireAdmin><AdminEditProjectPage /></RequireAdmin>} />
              <Route path="admin/nouveau-projet" element={<RequireAdmin><AdminNewProjectPage /></RequireAdmin>} />
              <Route path="admin/engagements" element={<RequireAdmin><AdminEngagementsPage /></RequireAdmin>} />
              <Route path="admin/utilisateurs" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
              <Route path="admin/utilisateurs/:id" element={<RequireAdmin><AdminUserDetailsPage /></RequireAdmin>} />
              <Route path="admin/utilisateurs/new" element={<RequireAdmin><AdminUserDetailsPage /></RequireAdmin>} />
              <Route path="admin/modules/:id" element={<RequireAdmin><AdminModulesPage /></RequireAdmin>} />
              <Route path="admin/projects/:id/phases" element={<RequireAdmin><AdminProjectPhasesPage /></RequireAdmin>} />
              <Route path="admin/validate-investments" element={<RequireAdmin><AdminInvestValidatePage /></RequireAdmin>} />
              <Route path="admin/paiements-valides" element={<RequireAdmin><AdminValidatedPaymentsPage /></RequireAdmin>} />
              <Route path="admin/emails" element={<RequireAdmin><AdminEmailTemplatesPage /></RequireAdmin>} />
              <Route path="admin/notifications" element={<RequireAdmin><AdminNotificationsPage /></RequireAdmin>} />
              <Route path="admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
              <Route path="admin/leads" element={<RequireAdmin><AdminLeadsPage /></RequireAdmin>} />
              <Route path="admin/media" element={<RequireAdmin><AdminMediaPage /></RequireAdmin>} />
              <Route path="admin/news" element={<RequireAdmin><AdminNewsPage /></RequireAdmin>} />
              <Route path="admin/propulse-submissions" element={<RequireAdmin><AdminPropulseSubmissionsPage /></RequireAdmin>} />
              <Route path="admin/phase2" element={<RequireAdmin><AdminPhase2Page /></RequireAdmin>} />
              <Route path="admin/messages" element={<RequireAdmin><AdminMessagesPage /></RequireAdmin>}/>
            </Route>

            {/* 🔁 Redirection héritée */}
            <Route path="/admin/*" element={<Navigate to="/dashboard/admin/projects" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MarketingProvider>
      </MaterialUIControllerProvider>
    </AuthProvider>
  );
}
export default App;

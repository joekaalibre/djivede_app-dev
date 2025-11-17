import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useMarketingContext } from '../components/MarketingProvider';
import DashboardSidebar from '../components/DashboardSidebar';
import UsersPage from '../components/UsersPage';
import SettingsPage from '../components/SettingsPage';
import AnalyticsPage from '../components/AnalyticsPage';
import FormsPage from '../components/FormsPage';
import OverviewPage from '../components/OverviewPage';
import TemplatesPage from '../components/TemplatesPage';
import MessagesPage from '../components/MessagesPage';
import CampaignDashboard from '../components/CampaignDashboard';
import PageManager from '../components/PageManager';
import EcommerceManager from '../components/EcommerceManager';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { personalizedContent } = useMarketingContext();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'pages':
        return <PageManager />;
      case 'forms':
        return <FormsPage />;
      case 'campaigns':
        return <CampaignDashboard />;
      case 'users':
        return <UsersPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'products':
      case 'orders':
      case 'bookings':
      case 'payments':
        return <EcommerceManager />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-r from-coaching-primary to-music-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        </div>
      </div>

      <div className="flex">
        <DashboardSidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
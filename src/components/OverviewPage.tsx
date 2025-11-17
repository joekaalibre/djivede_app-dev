import React from 'react';
import { Users, Calendar, BarChart2, FileText, FormInput, MessageSquare } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useNavigate } from 'react-router-dom';
import HomepageSectionManager from './HomepageSectionManager';

const OverviewPage = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: "Utilisateurs actifs",
      value: "1,234",
      change: "+12%",
      icon: <Users className="w-6 h-6 text-coaching-primary" />,
      trend: "up"
    },
    {
      title: "Formulaires créés",
      value: "56",
      change: "+8%",
      icon: <FileText className="w-6 h-6 text-coaching-primary" />,
      trend: "up"
    },
    {
      title: "Événements à venir",
      value: "12",
      change: "+2",
      icon: <Calendar className="w-6 h-6 text-coaching-primary" />,
      trend: "up"
    },
    {
      title: "Taux d'engagement",
      value: "68%",
      change: "+5%",
      icon: <BarChart2 className="w-6 h-6 text-coaching-primary" />,
      trend: "up"
    }
  ];

  const quickActions = [
    {
      title: "Créer un formulaire",
      icon: <FormInput className="w-5 h-5" />,
      onClick: () => navigate('/dashboard', { state: { activeTab: 'forms' } })
    },
    {
      title: "Ajouter un événement",
      icon: <Calendar className="w-5 h-5" />,
      onClick: () => navigate('/dashboard/events/new')
    },
    {
      title: "Envoyer un message",
      icon: <MessageSquare className="w-5 h-5" />,
      onClick: () => navigate('/dashboard', { state: { activeTab: 'messages', action: 'create' } })
    },
    {
      title: "Voir les analyses",
      icon: <BarChart2 className="w-5 h-5" />,
      onClick: () => navigate('/dashboard', { state: { activeTab: 'analytics' } })
    }
  ];

  return (
    <AnimatedSection>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-coaching-primary/10 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center justify-center gap-3 p-4 bg-coaching-primary/10 rounded-lg text-coaching-primary hover:bg-coaching-primary/20 transition-colors"
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Nouveau message",
                  description: "3 nouveaux messages non lus",
                  type: "info"
                },
                {
                  title: "Mise à jour système",
                  description: "Une nouvelle mise à jour est disponible",
                  type: "warning"
                },
                {
                  title: "Tâche terminée",
                  description: "L'export des données est terminé",
                  type: "success"
                }
              ].map((notification, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    notification.type === 'info' ? 'bg-blue-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Homepage Section Manager */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <HomepageSectionManager />
        </div>
      </div>
    </AnimatedSection>
  );
};

export default OverviewPage;
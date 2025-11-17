import React from 'react';
import { LayoutDashboard, FormInput, MessageSquare, FileText, Settings, ChevronLeft, Menu, Users, BarChart2, Megaphone, FileText as FileText2, ShoppingBag, Package, Calendar, CreditCard, Database, PenTool as Tool } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'pages',
      label: 'Pages',
      icon: <FileText2 size={20} />,
    },
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: <ShoppingBag size={20} />,
      submenu: [
        { id: 'products', label: 'Produits', icon: <Package size={20} /> },
        { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
        { id: 'bookings', label: 'Réservations', icon: <Calendar size={20} /> },
        { id: 'payments', label: 'Paiements', icon: <CreditCard size={20} /> }
      ]
    },
    {
      id: 'forms',
      label: 'Formulaires',
      icon: <FormInput size={20} />,
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      icon: <Megaphone size={20} />,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare size={20} />,
    },
    {
      id: 'templates',
      label: 'Modèles',
      icon: <FileText size={20} />,
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: <Users size={20} />,
    },
    {
      id: 'analytics',
      label: 'Analytiques',
      icon: <BarChart2 size={20} />,
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: <Tool size={20} />,
      submenu: [
        { id: 'backup', label: 'Sauvegardes', icon: <Database size={20} /> },
        { id: 'updates', label: 'Mises à jour', icon: <Tool size={20} /> }
      ]
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings size={20} />,
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-20 p-2 rounded-lg bg-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:sticky lg:top-16`}
      >
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800">Navigation</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-coaching-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                  {item.submenu && (
                    <ul className="ml-8 mt-2 space-y-2">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.id}>
                          <button
                            onClick={() => handleTabChange(subitem.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                              activeTab === subitem.id
                                ? 'bg-coaching-primary/10 text-coaching-primary'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {subitem.icon}
                            <span>{subitem.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
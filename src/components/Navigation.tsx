import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Music,
  BookOpen,
  MessageCircle,
  Home,
  User,
  LayoutDashboard,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from './AuthProvider';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    //{ name: 'Accueil', icon: <Home size={16} />, to: '/' },
    //{ name: 'Mon Histoire', icon: <User size={16} />, to: '/story' },
    //{ name: 'Coaching', icon: <BookOpen size={16} />, to: '/coaching' },
    //{ name: 'Ma Musique', icon: <Music size={16} />, to: '/music' },
    { name: 'Contact', icon: <MessageCircle size={16} />, to: '/contact' },
    //{ name: 'Projet Vedette', icon: <BookOpen size={16} />, to: '/projects/1' },
    ...(user ? [{
      name: 'Dashboard',
      icon: <LayoutDashboard size={16} />,
      to: user.role === 'admin' ? '/dashboard/admin/overview' : '/dashboard'
    }] : [])
  ];

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
    }
  };

  const renderLinks = (isMobile = false) => (
    <>
      {menuItems.map(({ name, icon, to }) => (
        <Link
          key={name}
          to={to}
          className={`flex items-center space-x-1 text-sm text-gray-300 hover:text-music-primary transition-colors duration-200 ${
            isMobile ? 'block px-3 py-2 rounded-md' : ''
          }`}
          onClick={() => isMobile && setIsOpen(false)}
        >
          {icon}
          <span>{name}</span>
        </Link>
      ))}
      {user ? (
        <button
          onClick={() => {
            handleSignOut();
            isMobile && setIsOpen(false);
          }}
          className={`flex items-center space-x-1 text-sm text-gray-300 hover:text-music-primary transition-colors duration-200 ${
            isMobile ? 'w-full px-3 py-2 rounded-md text-left' : ''
          }`}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      ) : (
        <Link
          to="/auth"
          className={`flex items-center space-x-1 text-sm text-gray-300 hover:text-music-primary transition-colors duration-200 ${
            isMobile ? 'block px-3 py-2 rounded-md' : ''
          }`}
          onClick={() => isMobile && setIsOpen(false)}
        >
          <LogIn size={16} />
          <span>Connexion</span>
        </Link>
      )}
    </>
  );

  return (
    <nav className="fixed w-full bg-black/90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <Music className="text-music-primary" size={20} />
              <span className="text-xl font-bold bg-gradient-to-r from-music-primary to-coaching-primary bg-clip-text text-transparent">
                DJIVÈDÉ
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {renderLinks(false)}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black">
            {renderLinks(true)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

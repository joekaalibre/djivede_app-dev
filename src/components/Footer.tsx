import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Mail, Phone, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-music-primary/90 to-coaching-primary/90 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Music className="w-6 h-6" />
              <span className="text-2xl font-bold">DJIVÈDÉ</span>
            </Link>
            <p className="text-gray-200 mb-6">
              Artiste chanteuse et coach en stratégie business, fusionnant l'art et l'entrepreneuriat
              pour créer des expériences uniques et transformatives.
            </p>
          </div>

          {/* Navigation Rapide */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/music" className="text-gray-200 hover:text-white transition-colors">
                  Ma Musique
                </Link>
              </li>
              <li>
                <Link to="/coaching" className="text-gray-200 hover:text-white transition-colors">
                  Coaching
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-200 hover:text-white transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-200 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <a href="mailto:contact@djivede.com" className="flex items-center text-gray-200 hover:text-white transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                contact@djivede.com
              </a>
              <a href="tel:+33123456789" className="flex items-center text-gray-200 hover:text-white transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                +33 1 23 45 67 89
              </a>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-200 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-200 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-200 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-200 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-200">
          <p>&copy; {new Date().getFullYear()} DJIVÈDÉ. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
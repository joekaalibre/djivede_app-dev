import React, { useState } from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/AnimatedSection';
import AdminPageControls from '../components/AdminPageControls';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] bg-gradient-to-r from-music-primary to-coaching-primary"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Contactez-moi
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-200"
            >
              Pour toute demande de collaboration, information ou réservation
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Contact Form Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold mb-6">Envoyez-moi un message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Sujet
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="coaching">Coaching Business</option>
                      <option value="music">Musique & Événements</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-3 rounded-lg bg-gradient-to-r from-music-primary to-coaching-primary text-white hover:opacity-90 transition-opacity"
                  >
                    Envoyer le message
                  </button>
                </form>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Informations de contact</h3>
                  <div className="space-y-4">
                    <a
                      href="mailto:contact@djivede.com"
                      className="flex items-center text-gray-600 hover:text-music-primary transition-colors"
                    >
                      <Mail className="w-6 h-6 mr-3" />
                      contact@djivede.com
                    </a>
                    <a
                      href="tel:+33123456789"
                      className="flex items-center text-gray-600 hover:text-music-primary transition-colors"
                    >
                      <Phone className="w-6 h-6 mr-3" />
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-6">Réseaux sociaux</h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-music-primary hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-6 h-6" />
                    </a>
                    {/* Add more social media icons as needed */}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Horaires de disponibilité</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Lundi - Vendredi: 9h00 - 18h00</p>
                    <p>Samedi: Sur rendez-vous</p>
                    <p>Dimanche: Fermé</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      <AdminPageControls slug="contact" />
    </div>
  );
};

export default ContactPage;
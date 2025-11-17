import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-music-primary/5 via-transparent to-coaching-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-music-primary/90 to-coaching-primary/90 text-white mb-8">
            <h2 className="text-4xl font-bold mb-2">Prêt à transformer votre vie?</h2>
            <p className="text-xl opacity-90">
              Que ce soit pour développer votre carrière ou pour découvrir mon univers musical
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Envoyez-moi un message</h3>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <select
                  id="subject"
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
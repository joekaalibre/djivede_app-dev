// 📁 src/pages/InvestAfricaPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Lightbulb } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import AdminPageControls from '../components/AdminPageControls';
import InvestFormInline from '../components/InvestFormInline';

const InvestAfricaPage = () => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPaymentPageStatus = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("isPaymentPageActive")
        .limit(1)
        .single();

      if (error || !data) {
        console.error("Erreur Supabase :", error);
        setAllowed(false);
      } else {
        setAllowed(data.isPaymentPageActive);
      }
    };

    checkPaymentPageStatus();
  }, []);

  if (allowed === false) return <Navigate to="/ferme" />;
  if (allowed === null) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-[60vh] bg-gradient-to-r from-coaching-primary to-music-primary flex items-center"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Investir ou Entreprendre en Afrique
            </h1>
            <p className="text-xl text-gray-200 mb-4">
              Découvrez des opportunités d'investissement au Bénin et bénéficiez d'un accompagnement personnalisé
            </p>
            <p className="text-lg text-gray-200 mb-8">
              Je vous accompagne de l’idée à l’impact, avec un suivi de terrain et une vision stratégique.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Introduction Section avec formulaire intégré */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="md:flex items-start gap-12">
              <motion.div 
                className="md:w-1/2 space-y-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xl leading-relaxed">
                  Bonjour ! Je suis Djivédé, passionnée par le développement économique de notre continent. Forte de mon expérience et de ma connaissance du terrain, je vous propose un accompagnement personnalisé pour concrétiser vos projets au Bénin.
                </p>
                <InvestFormInline />
              </motion.div>

              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <img 
                  src="/man-is-counting-money-he-is-counting-money.jpg"
                  alt="Investir en Afrique"
                  className="w-full h-[500px] object-cover rounded-xl shadow-lg"
                />
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Bloc 1 */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 bg-coaching-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-coaching-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Idées de business à fort potentiel</h3>
                <ul className="space-y-4 text-gray-600">
                  <li>Découvrez des secteurs porteurs et des opportunités d'investissement adaptées à votre profil et à vos aspirations.</li>
                  <li>Bénéficiez de mon expertise pour identifier les niches de marché et les tendances émergentes en Afrique.</li>
                </ul>
              </motion.div>

              {/* Bloc 2 */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 bg-coaching-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-coaching-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Structuration et implantation de votre business</h3>
                <ul className="space-y-4 text-gray-600">
                  <li>Je vous guide à chaque étape de votre projet, de l'étude de marché à la création de votre entreprise.</li>
                  <li>Profitez de mon réseau et de mes connaissances pour faciliter vos démarches administratives et juridiques au Bénin.</li>
                  <li>Élaborez un business plan solide et adapté au contexte béninois.</li>
                </ul>
              </motion.div>

              {/* Bloc 3 */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 bg-coaching-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Lightbulb className="w-6 h-6 text-coaching-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Investissements passifs et revenus complémentaires</h3>
                <ul className="space-y-4 text-gray-600">
                  <li>Explorez des options d'investissement rentables et sécurisées pour diversifier vos revenus.</li>
                  <li>Bénéficiez de conseils personnalisés pour optimiser votre portefeuille et atteindre vos objectifs financiers.</li>
                </ul>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <AdminPageControls />
    </div>
  );
};

export default InvestAfricaPage;

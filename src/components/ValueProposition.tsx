import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const ValueProposition: React.FC = () => {
  const benefits = [
    {
      icon: '🔍',
      title: 'Transparence',
      description: 'Un suivi détaillé de votre investissement et des rapports réguliers sur l\'évolution de votre capital.',
      color: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      icon: '💹',
      title: 'Rentabilité',
      description: 'Objectif de rendement net de 18%, sur des projets durables avec un potentiel de croissance important.',
      color: 'bg-accent-50',
      iconColor: 'text-accent-500',
    },
    {
      icon: '🌍',
      title: 'Impact',
      description: 'Contribuez au développement économique de l\'Afrique tout en générant des revenus substantiels.',
      color: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      icon: '🔒',
      title: 'Sécurité',
      description: 'Des projets rigoureusement sélectionnés et un suivi permanent pour minimiser les risques.',
      color: 'bg-accent-50',
      iconColor: 'text-accent-500',
    },
    {
      icon: '📱',
      title: 'Simplicité',
      description: 'Une plateforme facile à utiliser avec un processus d\'investissement simplifié et accessible.',
      color: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      icon: '👨‍💼',
      title: 'Accompagnement',
      description: 'Une équipe dédiée pour répondre à toutes vos questions et vous guider dans vos investissements.',
      color: 'bg-accent-50',
      iconColor: 'text-accent-500',
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Pourquoi investir avec Djivedé ?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Parce que vous méritez un placement qui a du sens, de l'impact et du rendement.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full ${benefit.color} border-b-4 border-${benefit.iconColor.replace('text-', '')}`} hoverEffect>
                <div className={`text-3xl ${benefit.iconColor} mb-4`}>{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-primary-600 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Prêt à faire fructifier votre argent ?</h3>
                <p className="text-primary-100">
                  Rejoignez les investisseurs qui ont déjà fait confiance à Djivedé et commencez à générer des revenus dès aujourd'hui.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a 
                  href="#invest" 
                  className="inline-block bg-white text-primary-600 font-medium px-6 py-3 rounded-md hover:bg-primary-50 transition-colors"
                >
                  Investir maintenant
                </a>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition;
import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface ModuleDetailsProps {
  moduleLabel: string;
  pricePerModule: number;
  returnPerModule: number;
  sharesPerModule: number;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({
  moduleLabel,
  pricePerModule,
  returnPerModule,
  sharesPerModule,
}) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' €';
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-l-4 border-accent-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-accent-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M9 21V9"></path>
                </svg>
              </span>
              Détails du projet modulaire
            </h2>
            
            <p className="text-neutral-600 mb-6">
              Ce projet est structuré en modules, ce qui vous permet d'investir dans des unités spécifiques 
              et de bénéficier d'un rendement proportionnel à votre investissement.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl text-accent-500 mb-3">🧱</div>
                <h3 className="text-lg font-semibold mb-1">Module</h3>
                <p className="text-neutral-700 text-xl">{moduleLabel}</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl text-primary-500 mb-3">💵</div>
                <h3 className="text-lg font-semibold mb-1">Prix par module</h3>
                <p className="text-neutral-700 text-xl">{formatCurrency(pricePerModule)}</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl text-accent-500 mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-1">Rendement par module</h3>
                <p className="text-neutral-700 text-xl">{formatCurrency(returnPerModule)}</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl text-primary-500 mb-3">🔢</div>
                <h3 className="text-lg font-semibold mb-1">Parts par module</h3>
                <p className="text-neutral-700 text-xl">{sharesPerModule}</p>
              </motion.div>
            </div>
            
            <div className="mt-8 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-start">
                <div className="text-primary-500 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-neutral-700">
                  En investissant dans un module complet, vous devenez propriétaire de toutes les parts associées 
                  et bénéficiez de l'intégralité du rendement généré par ce module. Vous pouvez également acquérir 
                  des parts individuelles selon votre capacité d'investissement.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ModuleDetails;
import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface ProjectKeyInfoProps {
  startDate: string;
  endDate: string;
  targetAmount: number;
  durationMonths: number;
  expectedReturn: number;
  riskLevel: string;
  minimumInvestment: number;
}

const ProjectKeyInfo: React.FC<ProjectKeyInfoProps> = ({
  startDate,
  endDate,
  targetAmount,
  durationMonths,
  expectedReturn,
  riskLevel,
  minimumInvestment,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' €';
  };

  const items = [
    { 
      icon: '📅', 
      label: 'Début', 
      value: formatDate(startDate),
      color: 'bg-primary-50',
      iconColor: 'text-primary-500'
    },
    { 
      icon: '📅', 
      label: 'Fin', 
      value: formatDate(endDate),
      color: 'bg-primary-50',
      iconColor: 'text-primary-500'
    },
    { 
      icon: '🎯', 
      label: 'Objectif', 
      value: formatCurrency(targetAmount),
      color: 'bg-accent-50',
      iconColor: 'text-accent-500'
    },
    { 
      icon: '⏳', 
      label: 'Durée', 
      value: `${durationMonths} mois`,
      color: 'bg-warning-50',
      iconColor: 'text-warning-600'
    },
    { 
      icon: '📈', 
      label: 'Rendement', 
      value: `${expectedReturn}%`,
      color: 'bg-accent-50',
      iconColor: 'text-accent-500'
    },
    { 
      icon: '⚠️', 
      label: 'Risque', 
      value: riskLevel,
      color: 'bg-warning-50',
      iconColor: 'text-warning-600'
    },
    { 
      icon: '💶', 
      label: 'Min. Invest.', 
      value: formatCurrency(minimumInvestment),
      color: 'bg-primary-50',
      iconColor: 'text-primary-500'
    },
  ];

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <span className="text-primary-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </span>
              Informations clés du projet
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`${item.color} rounded-lg p-4`}
                >
                  <div className={`text-2xl ${item.iconColor} mb-2`}>{item.icon}</div>
                  <div className="text-sm font-medium text-neutral-500">{item.label}</div>
                  <div className="text-lg font-semibold">{item.value}</div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 bg-primary-50 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-primary-800 mb-2">Projet sécurisé et vérifié</h3>
                  <p className="text-neutral-700">Notre équipe d'experts a analysé ce projet selon des critères stricts avant de l'approuver.</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <svg className="h-16 w-16 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectKeyInfo;
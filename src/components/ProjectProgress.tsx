import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface ProjectProgressProps {
  targetAmount: number;
  currentAmount: number;
  remainingDays: number;
  investorCount: number;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  targetAmount,
  currentAmount,
  remainingDays,
  investorCount,
}) => {
  const progressPercentage = Math.min(100, Math.round((currentAmount / targetAmount) * 100));
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' €';
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Objectif</h4>
                <p className="text-2xl font-bold">{formatCurrency(targetAmount)}</p>
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Collecté</h4>
                <p className="text-2xl font-bold text-accent-600">{formatCurrency(currentAmount)}</p>
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Reste</h4>
                <p className="text-2xl font-bold">{remainingDays} jours</p>
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Investisseurs</h4>
                <p className="text-2xl font-bold">{investorCount}</p>
              </div>
            </div>
            
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">{progressPercentage}% financé</span>
              <span>{formatCurrency(currentAmount)} sur {formatCurrency(targetAmount)}</span>
            </div>
            
            <div className="w-full h-4 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a 
                  href="#invest" 
                  className="btn-primary w-full sm:w-auto text-center"
                >
                  Investir maintenant
                </a>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a 
                  href="#details" 
                  className="btn-outline w-full sm:w-auto text-center"
                >
                  En savoir plus
                </a>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectProgress;
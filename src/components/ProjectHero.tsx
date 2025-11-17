import React from 'react';
import { motion } from 'framer-motion';
import Badge from './Badge';

interface ProjectHeroProps {
  title: string;
  summary: string;
  imageUrl?: string;
  isOpen: boolean;
}

const ProjectHero: React.FC<ProjectHeroProps> = ({
  title,
  summary,
  imageUrl,
  isOpen,
}) => {
  return (
    <div className="relative overflow-hidden mb-12">
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 to-neutral-900/80" />
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-4">
            {isOpen ? (
              <Badge variant="success">Ouvert à l'investissement</Badge>
            ) : (
              <Badge variant="warning">Fermé</Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-100 mb-8">
            {summary}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="#invest"
                className="btn-primary inline-flex items-center"
              >
                🚀 Investir maintenant
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </a>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="#details"
                className="btn-outline inline-flex items-center bg-white/10 border-white text-white"
              >
                📋 Voir les détails
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent" />
    </div>
  );
};

export default ProjectHero;
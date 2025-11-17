import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const CampaignSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-coaching-primary/5 to-music-primary/5">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Campagne spéciale coaching"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-coaching-primary/10 text-coaching-primary mb-4 w-fit">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Campagne Spéciale
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  Propulsez Votre Projet avec Mazarine Djivédé !
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Je lance une campagne spéciale pour offrir des études de projets et des conseils personnalisés aux entrepreneurs ambitieux. Bénéficiez d'un accompagnement sur mesure pour transformer vos idées en succès.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-coaching-primary mr-3" />
                    Analyse approfondie de votre projet
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-coaching-primary mr-3" />
                    Conseils stratégiques personnalisés
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-coaching-primary mr-3" />
                    Plan d'action concret et réalisable
                  </div>
                </div>
                
                <Link
                  to="/campaign"
                  className="inline-flex items-center px-6 py-3 text-base font-medium rounded-full bg-coaching-primary text-white hover:bg-coaching-secondary transition-colors duration-200"
                >
                  Je participe à la campagne
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CampaignSection;
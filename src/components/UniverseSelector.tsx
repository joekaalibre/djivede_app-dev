import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Lightbulb } from 'lucide-react';

interface UniverseProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonLink: string;
  type: 'music' | 'coaching';
  isActive: boolean;
  onClick: () => void;
}

const Universe: React.FC<UniverseProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonLink,
  type,
  isActive,
  onClick,
}) => {
  const baseClasses = "relative p-6 rounded-2xl transition-all duration-300 cursor-pointer";
  const activeClasses = {
    music: "bg-music-primary/10 hover:bg-music-primary/20",
    coaching: "bg-coaching-primary/10 hover:bg-coaching-primary/20"
  };
  const inactiveClasses = "opacity-50 hover:opacity-60 bg-gray-100";
  
  return (
    <div 
      className={`${baseClasses} ${isActive ? activeClasses[type] : inactiveClasses}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
        type === 'music' ? 'bg-music-primary text-white' : 'bg-coaching-primary text-white'
      }`}>
        {icon}
      </div>
      <h3 className={`text-xl font-bold mb-3 ${
        type === 'music' ? 'text-music-primary' : 'text-coaching-primary'
      }`}>
        {title}
      </h3>
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{description}</p>
      <Link
        to={buttonLink}
        className={`inline-block px-5 py-2 text-sm rounded-full font-medium transition-colors duration-200 ${
          type === 'music'
            ? 'bg-music-primary text-white hover:bg-music-secondary'
            : 'bg-coaching-primary text-white hover:bg-coaching-secondary'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

const UniverseSelector = () => {
  const [activeUniverse, setActiveUniverse] = useState<'music' | 'coaching' | 'both'>('both');

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Mes deux univers</h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto text-sm">
          Découvrez mes deux passions qui se complètent et s'enrichissent mutuellement.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Universe
            type="coaching"
            title="Coaching"
            description="Des services personnalisés pour accompagner votre développement professionnel et maximiser votre impact dans votre domaine."
            icon={<Lightbulb size={24} />}
            buttonText="Explorer mes services"
            buttonLink="/coaching"
            isActive={activeUniverse === 'coaching' || activeUniverse === 'both'}
            onClick={() => setActiveUniverse(activeUniverse === 'coaching' ? 'both' : 'coaching')}
          />
          
          <Universe
            type="music"
            title="Ma Musique"
            description="Une fusion de soul, jazz et musique africaine qui vous transporte dans un univers mélodique unique et authentique."
            icon={<Music size={24} />}
            buttonText="Découvrir ma musique"
            buttonLink="/music"
            isActive={activeUniverse === 'music' || activeUniverse === 'both'}
            onClick={() => setActiveUniverse(activeUniverse === 'music' ? 'both' : 'music')}
          />
        </div>
      </div>
    </section>
  );
};

export default UniverseSelector;
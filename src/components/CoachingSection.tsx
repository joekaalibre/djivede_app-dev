import React from 'react';
import { Target, Users, Lightbulb, TrendingUp } from 'lucide-react';
import { formatPrice, currencies } from '../utils/currency';
import { useNavigate } from 'react-router-dom';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  price: number;
}

const services: Service[] = [
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Stratégie Business',
    description: 'Développez une stratégie claire et efficace pour votre entreprise',
    price: 299,
    features: [
      'Analyse de marché approfondie',
      'Définition des objectifs',
      'Plan d\'action personnalisé',
      'Suivi des résultats'
    ]
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Leadership & Management',
    description: 'Renforcez vos compétences de leader et manager efficacement votre équipe',
    price: 399,
    features: [
      'Communication efficace',
      'Gestion d\'équipe',
      'Résolution de conflits',
      'Développement personnel'
    ]
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Croissance & Innovation',
    description: 'Accélérez la croissance de votre entreprise avec des solutions innovantes',
    price: 499,
    features: [
      'Identification d\'opportunités',
      'Optimisation des processus',
      'Innovation produit/service',
      'Scaling strategy'
    ]
  }
];

const CoachingSection = () => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = React.useState('EUR');

  return (
    <section id="coaching" className="py-16 bg-gradient-to-br from-coaching-primary/5 to-coaching-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Services de Coaching</h2>
          <p className="text-lg text-gray-600">
            Des solutions personnalisées pour votre réussite professionnelle
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            {Object.keys(currencies).map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCurrency === currency
                    ? 'bg-coaching-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-coaching-primary/10 flex items-center justify-center mb-4 text-coaching-primary">
                {service.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {service.description}
              </p>

              <div className="mb-4 text-2xl font-bold text-coaching-primary">
                {formatPrice(service.price, selectedCurrency as keyof typeof currencies)}
              </div>
              
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700 text-sm">
                    <Lightbulb className="w-4 h-4 text-coaching-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-2 text-sm rounded-full bg-coaching-primary text-white hover:bg-coaching-secondary transition-colors duration-200"
          >
            Réserver une séance
          </a>
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;
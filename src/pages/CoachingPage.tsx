import React, { useState } from 'react';
import { Target, Users, Lightbulb, TrendingUp, Calendar, MessageSquare, Video, Book, BarChart2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/AnimatedSection';
import { formatPrice, currencies } from '../utils/currency';
import AdminPageControls from '../components/AdminPageControls';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  type: 'course' | 'consultation' | 'online';
}

const services: Service[] = [
  {
    id: '1',
    title: 'Consultation Stratégique',
    description: 'Session personnalisée pour analyser votre projet et définir une stratégie adaptée',
    price: 150,
    duration: '1h30',
    type: 'consultation',
    features: [
      'Analyse approfondie de votre situation',
      'Identification des opportunités',
      'Recommandations stratégiques',
      'Plan d\'action détaillé'
    ]
  },
  {
    id: '2',
    title: 'Formation Leadership',
    description: 'Programme complet pour développer vos compétences de leader',
    price: 499,
    duration: '4 semaines',
    type: 'course',
    features: [
      'Modules vidéo hebdomadaires',
      'Exercices pratiques',
      'Sessions de groupe',
      'Support personnalisé'
    ]
  },
  {
    id: '3',
    title: 'Coaching en ligne',
    description: 'Accompagnement à distance flexible et adapté à vos besoins',
    price: 89,
    duration: '1h',
    type: 'online',
    features: [
      'Session vidéo interactive',
      'Support par messagerie',
      'Ressources exclusives',
      'Suivi personnalisé'
    ]
  }
];

const mainServices = [
  {
    icon: <Target className="w-12 h-12 text-coaching-primary" />,
    title: "Stratégie Business",
    description: "Développement d'une vision claire et d'un plan d'action concret pour atteindre vos objectifs business."
  },
  {
    icon: <BarChart2 className="w-12 h-12 text-coaching-primary" />,
    title: "Optimisation de Performance",
    description: "Identification des leviers de croissance et mise en place de processus optimisés pour maximiser vos résultats."
  },
  {
    icon: <Users className="w-12 h-12 text-coaching-primary" />,
    title: "Leadership & Management",
    description: "Développement de vos compétences de leadership pour inspirer et motiver vos équipes vers l'excellence."
  }
];

const coachingPrograms = [
  {
    title: "Coaching Individuel",
    description: "Un accompagnement personnalisé pour vous aider à atteindre vos objectifs professionnels.",
    features: [
      "Sessions de coaching one-to-one",
      "Plan d'action personnalisé",
      "Suivi et soutien continu"
    ],
    buttonText: "En savoir plus",
    buttonLink: "#contact"
  },
  {
    title: "Programme Premium",
    description: "Accompagnement intensif pour une transformation profonde de votre activité.",
    features: [
      "Sessions hebdomadaires",
      "Accès à des ressources exclusives",
      "Support par email entre les sessions",
      "Audit complet de votre business"
    ],
    buttonText: "Réserver une consultation",
    buttonLink: "#contact",
    highlighted: true
  },
  {
    title: "Ateliers & Formations",
    description: "Des sessions de groupe pour acquérir des compétences spécifiques et échanger avec d'autres professionnels.",
    features: [
      "Ateliers thématiques",
      "Formations en groupe réduit",
      "Matériel pédagogique"
    ],
    buttonText: "Voir le calendrier",
    buttonLink: "#events"
  }
];

const CoachingPage = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    needs: '',
    budget: '',
    timeline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-96 bg-gradient-to-r from-coaching-primary to-coaching-secondary"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Services de Coaching
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-200 max-w-2xl"
            >
              Découvrez comment je peux vous aider à atteindre votre plein potentiel et développer votre activité professionnelle.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-4">Mes services</h2>
            <p className="text-center text-gray-600 mb-12">
              Découvrez comment je peux vous aider à atteindre votre plein potentiel et développer votre activité professionnelle.
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            {mainServices.map((service, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-full bg-coaching-primary/10 flex items-center justify-center mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Séance de coaching"
                className="rounded-xl shadow-lg"
              />
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <AnimatedSection>
                <h2 className="text-3xl font-bold mb-6">Mon approche</h2>
                <p className="text-gray-600 mb-8">
                  Je crois en un accompagnement sur mesure qui prend en compte votre situation unique, vos objectifs spécifiques et votre contexte professionnel.
                </p>
                <ul className="space-y-4">
                  {[
                    "Analyse approfondie de votre situation actuelle",
                    "Définition d'objectifs clairs et mesurables",
                    "Élaboration d'un plan d'action personnalisé",
                    "Suivi régulier et ajustements en fonction des progrès"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-coaching-primary mr-3" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Coaching Programs */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-4">Programmes de coaching</h2>
            <p className="text-center text-gray-600 mb-12">
              Des solutions adaptées à vos besoins et objectifs spécifiques.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {coachingPrograms.map((program, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <div className={`rounded-xl p-8 h-full flex flex-col ${
                  program.highlighted 
                    ? 'bg-coaching-primary text-white' 
                    : 'bg-white shadow-lg'
                }`}>
                  <h3 className="text-xl font-bold mb-4">{program.title}</h3>
                  <p className={`mb-6 ${program.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                    {program.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className={`w-5 h-5 mr-2 ${
                          program.highlighted ? 'text-white' : 'text-coaching-primary'
                        }`} />
                        <span className={program.highlighted ? 'text-white/90' : 'text-gray-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={program.buttonLink}
                    className={`inline-block text-center px-6 py-3 rounded-full font-medium transition-colors ${
                      program.highlighted
                        ? 'bg-white text-coaching-primary hover:bg-gray-100'
                        : 'bg-coaching-primary text-white hover:bg-coaching-secondary'
                    }`}
                  >
                    {program.buttonText}
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Services with Pricing */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-4">Services de coaching</h2>
            <p className="text-center text-gray-600 mb-6">
              Des solutions personnalisées pour votre réussite professionnelle
            </p>
            <div className="flex justify-center space-x-4 mb-12">
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
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimatedSection key={service.id} delay={index * 0.2}>
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-coaching-primary/10 flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    {service.type === 'consultation' ? (
                      <MessageSquare className="w-6 h-6 text-coaching-primary" />
                    ) : service.type === 'course' ? (
                      <Book className="w-6 h-6 text-coaching-primary" />
                    ) : (
                      <Video className="w-6 h-6 text-coaching-primary" />
                    )}
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-coaching-primary">
                      {formatPrice(service.price, selectedCurrency as keyof typeof currencies)}
                    </span>
                    <span className="text-gray-500 ml-2">/ {service.duration}</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-center text-sm text-gray-600"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Lightbulb className="w-4 h-4 text-coaching-primary mr-2" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    onClick={() => setSelectedService(service.id)}
                    className="w-full py-2 px-4 bg-coaching-primary text-white rounded-full hover:bg-coaching-secondary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Réserver maintenant
                  </motion.button>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-12">Analysons vos besoins</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <motion.input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <motion.input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise
                </label>
                <motion.input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Décrivez vos besoins et objectifs
                </label>
                <motion.textarea
                  value={formData.needs}
                  onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget approximatif
                </label>
                <motion.select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  whileHover={{ scale: 1.01 }}
                >
                  <option value="">Sélectionnez une fourchette</option>
                  <option value="0-1000">0 - 1000€</option>
                  <option value="1000-5000">1000 - 5000€</option>
                  <option value="5000+">5000€ +</option>
                </motion.select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Échéance souhaitée
                </label>
                <motion.select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  whileHover={{ scale: 1.01 }}
                >
                  <option value="">Sélectionnez une période</option>
                  <option value="immediate">Immédiat</option>
                  <option value="1-3months">1-3 mois</option>
                  <option value="3-6months">3-6 mois</option>
                  <option value="6months+">6 mois +</option>
                </motion.select>
              </div>

              <motion.button
                type="submit"
                className="w-full py-3 bg-coaching-primary text-white rounded-full hover:bg-coaching-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Analyser mes besoins
              </motion.button>
            </motion.form>
          </AnimatedSection>
        </div>
      </section>
      <AdminPageControls slug="coaching" />
    </div>
  );
};

export default CoachingPage;
import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/AnimatedSection';
import AdminPageControls from '../components/AdminPageControls';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  type: 'music' | 'coaching';
}

const events: Event[] = [
  {
    id: '1',
    title: 'Concert Live - Soul & Jazz',
    date: '15 Avril 2025',
    time: '20:00',
    location: 'Le New Morning, Paris',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'music'
  },
  {
    id: '2',
    title: 'Workshop - Leadership Créatif',
    date: '22 Avril 2025',
    time: '14:00',
    location: 'Espace Coworking, Lyon',
    image: 'https://images.unsplash.com/photo-1558008258-3256797b43f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'coaching'
  },
  {
    id: '3',
    title: 'Masterclass - Stratégie Business',
    date: '5 Mai 2025',
    time: '10:00',
    location: 'Centre d\'Affaires, Marseille',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'coaching'
  },
  {
    id: '4',
    title: 'Concert - Fusion Afro-Jazz',
    date: '12 Mai 2025',
    time: '21:00',
    location: 'Jazz Club, Bordeaux',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'music'
  }
];

const EventsPage = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] bg-gradient-to-r from-music-primary to-coaching-primary"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Événements à Venir
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-200"
            >
              Concerts, workshops et masterclass : retrouvez tous mes événements
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Events Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <AnimatedSection key={event.id} delay={index * 0.1}>
                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                      event.type === 'music'
                        ? 'bg-music-primary'
                        : 'bg-coaching-primary'
                    }`}>
                      {event.type === 'music' ? 'Concert' : 'Workshop'}
                    </div>

                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>

                    <div className="space-y-2 text-gray-200">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors">
                      Réserver
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-6">Vous souhaitez organiser un événement ?</h2>
            <p className="text-gray-600 mb-8">
              Que ce soit pour un concert privé, une conférence ou un workshop, contactez-moi pour en discuter.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-music-primary to-coaching-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Me contacter
            </a>
          </AnimatedSection>
        </div>
      </section>
      <AdminPageControls slug="events" />
    </div>
  );
};

export default EventsPage;
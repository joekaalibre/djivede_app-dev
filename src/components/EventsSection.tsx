import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

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
  }
];

const EventsSection = () => {
  return (
    <section id="events" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Événements à Venir</h2>
          <p className="text-xl text-gray-600">
            Retrouvez-moi en concert ou en workshop
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
import React from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  image: string;
  type: 'music' | 'coaching';
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    content: "Le coaching de DJIVÈDÉ m'a permis de transformer complètement ma carrière. Ses conseils stratégiques sont inestimables.",
    author: 'Sophie M.',
    role: 'Entrepreneure',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    type: 'coaching'
  },
  {
    id: '2',
    content: "Sa musique est inspirante et sa présence sur scène est captivante. Un véritable talent qui mérite d'être découvert.",
    author: 'Thomas L.',
    role: 'Producteur musical',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    type: 'music'
  },
  {
    id: '3',
    content: "J'ai participé à un atelier de coaching et cela a complètement changé ma vision de mon entreprise. Approche inspirante et concrète.",
    author: 'Marie F.',
    role: 'Artiste-entrepreneure',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    type: 'coaching'
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce que l'on dit de moi</h2>
          <p className="text-xl text-gray-600">
            Découvrez les témoignages de personnes qui ont fait appel à mes services.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg relative"
            >
              <Quote
                className={`w-12 h-12 absolute -top-6 -left-6 ${
                  testimonial.type === 'music'
                    ? 'text-music-primary'
                    : 'text-coaching-primary'
                }`}
              />
              
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className={`font-semibold ${
                    testimonial.type === 'music'
                      ? 'text-music-primary'
                      : 'text-coaching-primary'
                  }`}>
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
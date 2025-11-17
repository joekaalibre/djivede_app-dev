import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface ProjectDescriptionProps {
  description: string;
  videoUrl?: string;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  description,
  videoUrl,
}) => {
  return (
    <section id="details" className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-primary-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </span>
              À propos du projet
            </h2>
            
            <div className="prose max-w-none">
              {description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-neutral-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
          
          {videoUrl && (
            <Card className="overflow-hidden">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-primary-500 mr-2">🎥</span>
                Découvrez notre projet en vidéo
              </h3>
              
              <div className="relative pt-[56.25%] rounded-lg overflow-hidden">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={videoUrl}
                  controls
                  poster="/video-thumbnail.jpg"
                />
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectDescription;
import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Lightbulb } from 'lucide-react';

const Hero = () => {
  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center">
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-music-primary/80 to-coaching-primary/80" />
      </motion.div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
        >
          <span className="block">DJIVÈDÉ</span>
          <span className="block text-xl sm:text-2xl mt-3 font-normal">
            Artiste Chanteuse & Coach en Stratégie Business
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-4 text-lg text-gray-100 max-w-2xl mx-auto"
        >
          Découvrez l'harmonie entre la musique et le succès entrepreneurial
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#coaching"
            className="flex items-center px-6 py-2 text-sm border border-transparent font-medium rounded-full text-white bg-coaching-primary hover:bg-coaching-secondary transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Découvrir mes services
          </motion.a>
          <motion.a
            href="#music"
            className="flex items-center px-6 py-2 text-sm border border-music-primary font-medium rounded-full text-white hover:bg-music-primary transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Écouter ma musique
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
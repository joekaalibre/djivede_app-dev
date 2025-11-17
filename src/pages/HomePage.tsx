import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import UniverseSelector from '../components/UniverseSelector';
import CampaignSection from '../components/CampaignSection';
import MusicSection from '../components/MusicSection';
import CoachingSection from '../components/CoachingSection';
import EventsSection from '../components/EventsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import AnimatedSection from '../components/AnimatedSection';
import AdminPageControls from '../components/AdminPageControls';

const HomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Hero />
      <AnimatedSection>
        <UniverseSelector />
      </AnimatedSection>
      <AnimatedSection>
        <CampaignSection />
      </AnimatedSection>
      <AnimatedSection>
        <MusicSection />
      </AnimatedSection>
      <AnimatedSection>
        <CoachingSection />
      </AnimatedSection>
      <AnimatedSection>
        <EventsSection />
      </AnimatedSection>
      <AnimatedSection>
        <TestimonialsSection />
      </AnimatedSection>
      <AnimatedSection>
        <ContactSection />
      </AnimatedSection>
      <AdminPageControls slug="accueil" />
    </motion.div>
  );
};

export default HomePage;
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'none' | 'soft' | 'medium' | 'hard';
  hoverEffect?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevation = 'soft',
  hoverEffect = false,
  onClick,
}) => {
  const elevationStyles = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    hard: 'shadow-hard',
  };
  
  const baseStyles = 'bg-white rounded-lg p-6';
  const combinedStyles = `${baseStyles} ${elevationStyles[elevation]} ${className}`;
  
  const hoverVariants = {
    initial: {},
    hover: hoverEffect ? { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {},
  };

  return (
    <motion.div
      className={combinedStyles}
      initial="initial"
      whileHover="hover"
      variants={hoverVariants}
      onClick={onClick}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
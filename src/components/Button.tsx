import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'white';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  fullWidth = false,
  onClick,
  href,
  target,
  rel,
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    white: 'bg-white text-neutral-800 hover:bg-neutral-100 focus:ring-neutral-500 border border-neutral-200',
  };
  
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-5 py-2.5',
    lg: 'text-lg px-6 py-3',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;
  
  const Component = href ? 'a' : 'button';
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
    >
      <Component
        className={buttonClasses}
        onClick={onClick}
        href={href}
        target={target}
        rel={rel}
        type={Component === 'button' ? type : undefined}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Component>
    </motion.div>
  );
};

export default Button;
import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-accent-100 text-accent-800',
    warning: 'bg-warning-100 text-warning-800',
    info: 'bg-info-100 text-info-800',
    neutral: 'bg-neutral-100 text-neutral-800',
  };

  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <>
      <span className={combinedStyles}>
        {children}
      </span>

      {/* 👻 Élément caché pour forcer la génération des classes Tailwind personnalisées */}
      <span className="hidden
        bg-primary-50 bg-primary-100 bg-primary-200 bg-primary-300 bg-primary-400 bg-primary-500 bg-primary-600 bg-primary-700 bg-primary-800 bg-primary-900
        text-primary-500 hover:bg-primary-600 focus:ring-primary-500
        bg-accent-500 hover:bg-accent-600 focus:ring-accent-500
        bg-neutral-50 bg-neutral-800
        text-accent-800 text-warning-800 text-info-800 text-neutral-800
        bg-accent-100 bg-warning-100 bg-info-100 bg-neutral-100
      " />
    </>
  );
};

export default Badge;

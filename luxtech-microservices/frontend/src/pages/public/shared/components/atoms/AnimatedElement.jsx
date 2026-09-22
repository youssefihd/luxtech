// vitrine/shared/components/atoms/AnimatedElement.jsx
import React from 'react';

/**
 * 🎬 Composant pour gérer les animations d'apparition
 * Utilisé par tous les composants qui ont besoin d'animations
 */
const AnimatedElement = ({ 
  children, 
  isVisible = true,
  animation = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'scale'
  delay = 0,
  duration = 1000,
  className = ''
}) => {
  const animations = {
    'fade-up': isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
    'fade-down': isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0',
    'fade-left': isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0',
    'fade-right': isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0',
    'fade': isVisible ? 'opacity-100' : 'opacity-0',
    'scale': isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
  };

  return (
    <div 
      className={`transform transition-all duration-${duration} ${animations[animation]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;

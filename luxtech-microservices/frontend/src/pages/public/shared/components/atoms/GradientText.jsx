// vitrine/shared/components/atoms/GradientText.jsx
import React from 'react';

/**
 * 🌈 Texte avec gradient réutilisable
 */
const GradientText = ({ 
  children, 
  className = '',
  from = 'from-[#00BCD4]',
  to = 'to-[#5E35B1]',
  via // Optionnel: couleur intermédiaire
}) => {
  const gradientClasses = via 
    ? `${from} ${via} ${to}`
    : `${from} ${to}`;

  return (
    <span className={`text-blue-600 bg-clip-text bg-linear-to-r ${gradientClasses} ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;

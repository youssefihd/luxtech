// vitrine/shared/components/atoms/ContentWrapper.jsx
import React from 'react';

/**
 * 📐 Wrapper pour le contenu avec max-width et padding responsive
 */
const ContentWrapper = ({ 
  children, 
  className = '',
  maxWidth = 'max-w-7xl' // Options: max-w-4xl, max-w-5xl, max-w-6xl, max-w-7xl
}) => {
  return (
    <div className={`relative ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default ContentWrapper;

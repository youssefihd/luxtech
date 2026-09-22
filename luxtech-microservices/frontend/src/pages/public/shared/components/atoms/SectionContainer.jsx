// vitrine/shared/components/atoms/SectionContainer.jsx
import React from 'react';

/**
 * 📦 Container principal pour toutes les sections
 * Gère le padding, les backgrounds et l'overflow
 */
const SectionContainer = ({ 
  children, 
  id,
  className = '',
  bgColor = 'bg-white',
  withPattern = false,
  withGradientBlobs = false,
  py = 'py-6 lg:py-8'
}, ref) => {
  return (
    <section 
      ref={ref} 
      id={id}
      className={`relative ${py} ${bgColor} overflow-hidden ${className}`}
    >
      {/* Background Pattern optionnel */}
      {withPattern && (
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300BCD4\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      )}

      {/* Gradient Blobs optionnels */}
      {withGradientBlobs && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#00BCD4] rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#5E35B1] rounded-full mix-blend-multiply filter blur-3xl animate-pulse-medium animation-delay-2000" />
        </div>
      )}

      {/* Contenu */}
      {children}
    </section>
  );
};

export default SectionContainer;

// vitrine/shared/components/molecules/SectionHeader.jsx
import React from 'react';
import AnimatedElement from '../atoms/AnimatedElement.jsx';

/**
 * 🎯 En-tête de section réutilisable
 * Support du texte en gradient, sous-titre, et animations
 */
const SectionHeader = ({ 
  title,
  highlightText, // Texte à mettre en surbrillance avec gradient
  subtitle,
  description,
  align = 'center', // 'left' | 'center' | 'right'
  className = '',
  badge, // Badge optionnel (ex: "Nouveau", "Premium")
  isVisible = true
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const maxWidthClasses = {
    left: 'max-w-4xl',
    center: 'max-w-4xl mx-auto',
    right: 'max-w-4xl ml-auto'
  };

  return (
    <AnimatedElement
      isVisible={isVisible}
      animation="fade-up"
      className={`${alignmentClasses[align]} mb-4 lg:mb-8 ${className}`}
    >
      {/* Badge optionnel */}
      {badge && (
        <div className={`inline-flex items-center gap-2 bg-linear-to-r from-[#00BCD4]/10 to-[#5E35B1]/10 border border-[#00BCD4]/20 px-4 py-2 rounded-full mb-4 ${
          align === 'center' ? 'mx-auto' : ''
        }`}>
          <div className="w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">{badge}</span>
        </div>
      )}

      {/* Titre avec highlight optionnel */}
      {subtitle && (
        <p className="text-sm md:text-base font-semibold text-[#00BCD4] uppercase tracking-wider mb-3">
          {subtitle}
        </p>
      )}

      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
        {title}{' '}
        {highlightText && (
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00BCD4] to-[#5E35B1]">
            {highlightText}
          </span>
        )}
      </h2>

      {/* Description */}
      {description && (
        <p className={`text-lg md:text-xl text-gray-600 leading-relaxed ${maxWidthClasses[align]}`}>
          {description}
        </p>
      )}
    </AnimatedElement>
  );
};

export default SectionHeader;

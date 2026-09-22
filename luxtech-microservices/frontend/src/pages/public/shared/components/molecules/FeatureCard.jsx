// vitrine/shared/components/molecules/FeatureCard.jsx
import React, { useState } from 'react';
import FeatureModal from './FeatureModal.jsx';

/**
 * 🃏 Carte de fonctionnalité réutilisable avec modal de détails
 * Utilisée dans AboutSection, BenefitsSection, etc.
 */
const FeatureCard = ({ 
  icon: Icon,
  title,
  description,
  features = [],
  bgColor = 'from-blue-50 to-cyan-50',
  details,
  isVisible = true,
  index = 0,
  variant = 'default' // 'default' | 'compact' | 'minimal'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const variants = {
    default: 'p-6',
    compact: 'p-4',
    minimal: 'p-5'
  };

  // Ouvrir le modal au clic si details existe
  const handleClick = () => {
    if (details) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`group relative bg-white border border-gray-200 rounded-xl ${variants[variant]} transition-all duration-300 transform ${
          isHovered ? '-translate-y-1 shadow-lg border-[#00BCD4]' : 'hover:shadow-md border-gray-200'
        } ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } overflow-hidden ${details ? 'cursor-pointer' : ''}`}
        style={{
          transitionDelay: `${200 + index * 60}ms`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Background linear on Hover */}
        <div 
          className={`absolute inset-0 bg-linear-to-br ${bgColor} opacity-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'group-hover:opacity-30'
          }`}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon and Title Row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Icon Container */}
            {Icon && (
              <div 
                className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isHovered 
                    ? 'bg-linear-to-r from-[#00BCD4] to-[#5E35B1] scale-110 shadow-md' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}
              >
                <Icon 
                  size={24} 
                  className={`transition-colors duration-300 ${
                    isHovered ? 'text-white' : 'text-gray-700'
                  }`}
                />
              </div>
            )}

            {/* Title */}
            <h3 
              className={`text-lg font-bold transition-colors duration-300 ${
                isHovered ? 'text-[#00BCD4]' : 'text-gray-900'
              }`}
            >
              {title}
            </h3>
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-600 text-md leading-relaxed mb-3">
              {description}
            </p>
          )}

          {/* Features List */}
          {features.length > 0 && (
            <div className="space-y-1.5">
              {features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors duration-300 group-hover:text-gray-700"
                >
                  <div 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                      isHovered 
                        ? 'bg-[#00BCD4] scale-110' 
                        : 'bg-gray-400 group-hover:bg-[#00BCD4]'
                    }`}
                  />
                  <span className="leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Indicator pour "Cliquer pour plus de détails" */}
          {details && (
          <div
            className={`mt-4 pt-3 border-t border-gray-100 transition-all duration-300 flex justify-end ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <button
              type="button"
              className=" group flex items-center gap-2 text-sm font-medium text-[#00BCD4] hover:text-[#0097A7] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/40 rounded-md transition-colors"
            >
              {/* Text */}
              <span>En savoir plus</span>
              {/* Arrow */}
              <span
                className="transform translate-x-0opacity-0group-hover:opacity-100 group-hover:translate-x-1transition-all duration-200"
              >
                →
              </span>
            </button>
          </div>
        )}

        </div>
      </div>

      {/* Modal de détails */}
      <FeatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={Icon}
        title={title}
        description={description}
        details={details}
        features={features}
        bgColor={bgColor}
      />
    </>
  );
};

export default FeatureCard;
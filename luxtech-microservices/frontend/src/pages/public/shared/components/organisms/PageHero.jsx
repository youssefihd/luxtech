// vitrine/shared/components/organisms/PageHero.jsx
import React from 'react';
import Badge from '../atoms/Badge.jsx';
import AnimatedElement from '../atoms/AnimatedElement.jsx';
import GradientText from '../atoms/GradientText.jsx';

/**
 * 🎯 Hero Section réutilisable pour toutes les pages
 * Remplace le code dupliqué dans AboutPage, SolutionsPage, PricingPage, ContactPage
 */
const PageHero = ({ 
  badge,
  title,
  highlightText,
  description,
  isVisible = true,
  children // Pour du contenu custom (ex: toggle de tarifs)
}) => {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-[#0F1A2F] via-[#1A237E] to-[#0F172A] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#00BCD4] rounded-full mix-blend-multiply filter blur-xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5E35B1] rounded-full mix-blend-multiply filter blur-xl animate-float-medium" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement
          isVisible={isVisible}
          animation="fade-up"
          className="text-center"
        >
          {/* Badge */}
          {badge && (
            <div className="mb-6 flex justify-center">
              <Badge variant="info" withDot size="md">
                {badge}
              </Badge>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {title}{' '}
            {highlightText && <GradientText>{highlightText}</GradientText>}
          </h1>
          
          {/* Description */}
          {description && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          {/* Custom Content (ex: toggle, buttons) */}
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </AnimatedElement>
      </div>
    </section>
  );
};

export default PageHero;
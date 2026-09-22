// vitrine/shared/components/organisms/CTASection.jsx
import React from 'react';
import SectionContainer from '../atoms/SectionContainer.jsx';
import ContentWrapper from '../atoms/ContentWrapper.jsx';
import Button from '../atoms/Button.jsx';

/**
 * 📣 Section Call-to-Action réutilisable
 * Remplace les CTA répétées dans AboutPage, SolutionsPage, PricingPage, ContactPage
 */
const CTASection = ({ 
  title,
  description,
  primaryButton,
  secondaryButton,
  badges, // Array of { icon, text }
  className = ''
}) => {
  return (
    <SectionContainer 
      bgColor="bg-gradient-to-r from-[#1A237E] to-[#5E35B1]"
      py="py-10"
      className={className}
    >
      <ContentWrapper maxWidth="max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {title}
          </h2>
          
          {description && (
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryButton && (
              <Button
                onClick={primaryButton.onClick}
                variant="secondary"
                size="lg"
                icon={primaryButton.icon}
              >
                {primaryButton.text}
              </Button>
            )}
            
            {secondaryButton && (
              <Button
                onClick={secondaryButton.onClick}
                variant="outline"
                size="lg"
                icon={secondaryButton.icon}
                className="border-white text-white hover:bg-white hover:text-[#1A237E]"
              >
                {secondaryButton.text}
              </Button>
            )}
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-blue-100">
                    {Icon && <Icon size={18} />}
                    <span className="text-sm">{badge.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ContentWrapper>
    </SectionContainer>
  );
};

export default CTASection;
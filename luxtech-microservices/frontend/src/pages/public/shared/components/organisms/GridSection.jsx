// vitrine/shared/components/organisms/GridSection.jsx
import React from 'react';
import SectionContainer from '../atoms/SectionContainer.jsx';
import ContentWrapper from '../atoms/ContentWrapper.jsx';
import SectionHeader from '../molecules/SectionHeader.jsx';

/**
 * 📊 Section avec grille réutilisable
 * Pour afficher des cartes de valeurs, services, features, etc.
 */
const GridSection = ({ 
  title,
  highlightText,
  subtitle,
  description,
  items,
  renderItem, // Fonction pour rendre chaque item
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  bgColor = 'bg-gradient-to-b from-white to-gray-50',
  isVisible = true,
  className = ''
}) => {
  const gridClasses = `
    grid 
    grid-cols-${columns.sm} 
    md:grid-cols-${columns.md} 
    lg:grid-cols-${columns.lg}
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}
    gap-6 lg:gap-8
  `;

  return (
    <SectionContainer bgColor={bgColor} className={className}>
      <ContentWrapper>
        
        {/* Header */}
        {(title || description) && (
          <SectionHeader
            title={title}
            highlightText={highlightText}
            subtitle={subtitle}
            description={description}
            isVisible={isVisible}
          />
        )}

        {/* Grid */}
        <div className={gridClasses}>
          {items.map((item, index) => (
            <React.Fragment key={item.id || index}>
              {renderItem(item, index, isVisible)}
            </React.Fragment>
          ))}
        </div>
      </ContentWrapper>
    </SectionContainer>
  );
};

export default GridSection;
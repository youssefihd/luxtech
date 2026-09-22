// vitrine/shared/components/molecules/InfoCard.jsx
import React from 'react';

/**
 * 🃏 Carte d'information réutilisable
 * Utilisée pour : contact info, statistiques, services, etc.
 */
const InfoCard = ({ 
  icon: Icon,
  title,
  subtitle,
  content,
  description,
  link,
  onClick,
  variant = 'default', // 'default' | 'gradient' | 'bordered' | 'highlight'
  children,
  className = ''
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 hover:border-[#5E35B1]',
    gradient: 'bg-gradient-to-br from-[#1A237E] to-[#5E35B1] text-white',
    bordered: 'bg-white border-2 border-gray-200 hover:border-[#5E35B1]',
    highlight: 'bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200'
  };

  const Wrapper = link ? 'a' : onClick ? 'button' : 'div';
  const wrapperProps = link 
    ? { href: link, target: link.startsWith('http') ? '_blank' : undefined }
    : onClick 
    ? { onClick, type: 'button' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`
        flex items-start gap-4 p-4 rounded-2xl 
        transition-all duration-300 transform hover:-translate-y-1
        ${variants[variant]}
        ${onClick || link ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Icon */}
      {Icon && (
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          ${variant === 'gradient' ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-r from-[#1A237E] to-[#5E35B1]'}
        `}>
          <Icon size={20} className={variant === 'gradient' ? 'text-white' : 'text-white'} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold mb-1 ${
            variant === 'gradient' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h4>
        )}
        
        {subtitle && (
          <p className={`text-sm mb-1 ${
            variant === 'gradient' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {subtitle}
          </p>
        )}

        {content && (
          <p className={`break-words ${
            variant === 'gradient' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {content}
          </p>
        )}

        {description && (
          <p className={`leading-relaxed ${
            variant === 'gradient' ? 'text-blue-100' : 'text-gray-700'
          }`}>
            {description}
          </p>
        )}

        {children}
      </div>
    </Wrapper>
  );
};

export default InfoCard;
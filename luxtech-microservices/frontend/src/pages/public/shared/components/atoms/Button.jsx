// vitrine/shared/components/atoms/Button.jsx
import React from 'react';

/**
 * 🔘 Bouton réutilisable avec plusieurs variantes
 */
const Button = ({ 
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  disabled = false,
  icon, // Composant d'icône optionnel
  iconPosition = 'left', // 'left' | 'right'
  className = ''
}) => {
  // Styles de base
  const baseClasses = 'group relative font-bold transition-all duration-300 overflow-hidden inline-flex items-center justify-center gap-2';

  // Variantes de style
  const variants = {
    primary: `
      bg-gradient-to-r from-[#1A237E] to-[#5E35B1] text-white 
      hover:shadow-2xl transform hover:scale-105 shadow-lg
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#5E35B1] before:to-[#7E57C2] 
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
    `,
    secondary: `
      bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white 
      hover:shadow-2xl transform hover:scale-105 shadow-lg
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#5E35B1] before:to-[#00BCD4] 
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
    `,
    outline: `
      border-2 border-[#00BCD4] text-[#00BCD4] bg-transparent
      hover:bg-[#00BCD4] hover:text-white transform hover:scale-105
      before:absolute before:inset-0 before:bg-[#00BCD4] before:scale-x-0 
      before:transition-transform before:duration-300 before:origin-left hover:before:scale-x-100
    `,
    ghost: `
      text-[#00BCD4] bg-transparent hover:bg-[#00BCD4]/10
      transform hover:scale-105
    `
  };

  // Tailles
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };

  // Classes de disabled
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';

  // Classes de largeur
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
    >
      {/* Contenu avec z-index pour être au-dessus des pseudo-éléments */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </button>
  );
};

export default Button;

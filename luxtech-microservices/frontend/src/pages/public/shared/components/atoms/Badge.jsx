// vitrine/shared/components/atoms/Badge.jsx
import React from 'react';

/**
 * 🏷️ Badge réutilisable avec plusieurs variantes
 */
const Badge = ({ 
  children,
  variant = 'default', // 'default' | 'success' | 'warning' | 'error' | 'info'
  size = 'md', // 'sm' | 'md' | 'lg'
  withDot = false,
  className = ''
}) => {
  const variants = {
    default: 'bg-gradient-to-r from-[#00BCD4]/10 to-[#5E35B1]/10 border-[#00BCD4]/20 text-gray-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  };

  const dotColors = {
    default: 'bg-[#00BCD4]',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <span 
      className={`inline-flex items-center gap-2 ${variants[variant]} border ${sizes[size]} rounded-full font-medium ${className}`}
    >
      {withDot && (
        <span className={`w-2 h-2 ${dotColors[variant]} rounded-full animate-pulse`} />
      )}
      {children}
    </span>
  );
};

export default Badge;

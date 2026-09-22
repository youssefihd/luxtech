// vitrine/shared/components/atoms/FormInput.jsx
import React from 'react';

/**
 * 📝 Input de formulaire réutilisable
 * Utilisé dans ContactPage et autres formulaires
 */
const FormInput = ({ 
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  rows, // Pour textarea
  className = '',
  error,
  ...props
}) => {
  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <Icon 
            size={18} 
            className={`absolute ${
              type === 'textarea' ? 'left-3 top-4' : 'left-3 top-1/2 transform -translate-y-1/2'
            } text-gray-400`}
          />
        )}

        {/* Input */}
        <InputComponent
          type={type !== 'textarea' ? type : undefined}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`
            w-full 
            ${Icon ? 'pl-10' : 'pl-4'} 
            pr-4 py-3 
            border 
            ${error ? 'border-red-500' : 'border-gray-300'}
            rounded-xl 
            focus:outline-none 
            focus:ring-2 
            ${error ? 'focus:ring-red-500' : 'focus:ring-[#1A237E]'}
            focus:border-transparent 
            transition-all duration-300
            ${type === 'textarea' ? 'resize-none' : ''}
          `}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const SiteModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  headerGradient = "from-[#1A237E] to-[#5E35B1]",
  size = "lg",
  showFooter = true,
  footerContent,
  showDecorations = false,
  badge
}) => {
  // Gestion ESC + scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tailles du modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className={`
            relative w-full ${sizeClasses[size]}
            bg-white rounded-3xl shadow-2xl
            max-h-[90vh] overflow-y-auto
            animate-scaleIn
          `}
        >
          {/* Header avec Gradient */}
          <div className={`sticky top-0 bg-gradient-to-r ${headerGradient} px-8 py-6 rounded-t-3xl`}>
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="flex items-center gap-4">
              {/* Badge ou Icône */}
              {badge && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{badge}</span>
                  </div>
                </div>
              )}

              {Icon && !badge && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
              )}

              {/* Titre et sous-titre */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white mb-1 truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-white/90 text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="px-8 py-6">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="sticky bottom-0 px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-3xl">
              {footerContent || (
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default SiteModal;
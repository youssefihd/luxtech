// vitrine/shared/components/molecules/FeatureModal.jsx
import React from 'react';
import Modal from '../atoms/Modal.jsx';

/**
 * 🎨 Modal élégante pour afficher les détails d'une feature
 */
const FeatureModal = ({
  isOpen,
  onClose,
  icon,
  title,
  description,
  details,
  features = [],
  bgColor = 'from-blue-50 to-cyan-50'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={description}
      icon={icon}
      headerGradient="from-[#00BCD4] to-[#5E35B1]"
      size="lg"
      showDecorations={true}
    >
      {/* Details */}
      {details && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-[#00BCD4] to-[#5E35B1] rounded-full" />
            Description détaillée
          </h3>

          <div className="space-y-4">
            {details
              .split('\n')
              .filter(Boolean)
              .map((line, index) => (
                <p key={index} className="text-gray-700 text-base leading-relaxed">
                  {line}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Features List (si fournie) */}
      {features.length > 0 && (
        <div className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default FeatureModal;
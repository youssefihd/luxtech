// vitrine/homepage/components/TourismSection/ServiceTourismeModal.jsx
import React from 'react';
import Modal from '../atoms/Modal.jsx';

/**
 * 🎨 Modal détaillée pour un service touristique
 */
const ServiceTourismeModal = ({ 
  isOpen, 
  onClose, 
  service 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service.title}
      subtitle={service.soustitle}
      badge={service.number}
      headerGradient="from-[#00BCD4] to-[#5E35B1]"
      size="lg"
    >
      {/* Full Description */}
      {service.fullDescription && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-[#00BCD4] to-[#5E35B1] rounded-full" />
            Vue d'ensemble
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {service.fullDescription}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ServiceTourismeModal;
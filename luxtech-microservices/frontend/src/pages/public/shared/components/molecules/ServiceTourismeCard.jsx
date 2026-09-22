// vitrine/homepage/components/TourismSection/ServiceTourismeCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import ServiceTourismeModal from './ServiceTourismeModal.jsx';

/**
 * 🎯 Carte de service interactive avec modal au hover
 */
const ServiceTourismeCard = ({ 
  service, 
  index 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hoverTimerRef = useRef(null);
  const Icon = service.icon;

  // Ouvrir le modal après 800ms de hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    if (service.fullDescription) {
      hoverTimerRef.current = setTimeout(() => {
        setIsModalOpen(true);
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className="relative group bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#00BCD4]/30 cursor-pointer"
        style={{
          animationDelay: `${200 + index * 100}ms`
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start gap-4">
          {/* Number Badge avec Icon */}
          <div className="relative flex-shrink-0">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              text-white font-bold text-lg
              transition-all duration-300
              ${isHovered 
                ? 'bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] scale-110 shadow-lg' 
                : 'bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]'
              }
            `}>
              {service.number}
            </div>
            
            {/* Icon Badge */}
            <div className={`
              absolute -top-1 -right-1 w-6 h-6
              bg-white border-2 border-[#00BCD4] rounded-full
              flex items-center justify-center shadow-sm
              transition-all duration-300
              ${isHovered ? 'scale-110 rotate-12' : ''}
            `}>
              <Icon size={12} className="text-[#00BCD4]" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className={`
              text-lg font-bold mb-2
              transition-colors duration-300
              ${isHovered ? 'text-[#00BCD4]' : 'text-gray-900'}
            `}>
              {service.title}
            </h3>
            
            <p className="text-gray-600 leading-relaxed text-md mb-3">
              {service.summary}
            </p>

            {/* Tags/Keywords */}
            {service.keywords && (
              <div className="flex flex-wrap gap-2 mb-3">
                {service.keywords.map((keyword, i) => (
                  <span 
                    key={i}
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      transition-all duration-300
                      ${isHovered 
                        ? 'bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/20' 
                        : 'bg-gray-100 text-gray-600 border border-transparent'
                      }
                    `}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {/* Hover Indicator */}
            {service.fullDescription && (
              <div className={`
                flex items-center gap-2 text-xs font-medium
                transition-all duration-300
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
              `}>
                <span className="inline-block w-1.5 h-1.5 bg-[#00BCD4] rounded-full animate-pulse" />
                <span className="text-[#00BCD4]">Survolez pour plus de détails</span>
              </div>
            )}
          </div>
        </div>

        {/* Gradient Background on Hover */}
        <div className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-br from-[#00BCD4]/5 to-[#5E35B1]/5
          transition-opacity duration-300 -z-10
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `} />
      </div>

      {/* Modal */}
      {service.fullDescription && (
        <ServiceTourismeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={service}
        />
      )}
    </>
  );
};

export default ServiceTourismeCard;
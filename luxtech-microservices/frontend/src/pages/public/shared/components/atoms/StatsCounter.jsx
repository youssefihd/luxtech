// vitrine/shared/components/atoms/StatsCounter.jsx
import React, { useState, useEffect } from 'react';

/**
 * 📊 Compteur animé pour les statistiques
 */
const StatsCounter = ({ 
  end, 
  duration = 2000,
  suffix = '+',
  prefix = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration]);

  const formattedCount = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span>
      {prefix}{formattedCount}{suffix}
    </span>
  );
};

export default StatsCounter;

// vitrine/shared/components/index.js
// 📦 Exports centralisés pour faciliter les imports

// ⚛️ Atoms
export { default as SectionContainer } from './atoms/SectionContainer.jsx';
export { default as ContentWrapper } from './atoms/ContentWrapper.jsx';
export { default as AnimatedElement } from './atoms/AnimatedElement.jsx';
export { default as GradientText } from './atoms/GradientText.jsx';
export { default as Button } from './atoms/Button.jsx';
export { default as Badge } from './atoms/Badge.jsx';
export { default as StatsCounter } from './atoms/StatsCounter.jsx';

// 🧬 Molecules
export { default as SectionHeader } from './molecules/SectionHeader.jsx';
export { default as FeatureCard } from './molecules/FeatureCard.jsx';

// 🪝 Hooks
export { default as useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
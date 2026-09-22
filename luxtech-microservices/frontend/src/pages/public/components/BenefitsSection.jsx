import { memo } from 'react'
import { MapPin, Package, DollarSign, Zap, Users, Target } from 'lucide-react'
import { SectionContainer, ContentWrapper, SectionHeader, FeatureCard, useIntersectionObserver } from './shared'

const BenefitsSection = () => {
    const [sectionRef, isVisible] = useIntersectionObserver()

    const benefits = [
        { icon: MapPin, title: 'Technologie Locale', description: 'Solution conçue spécifiquement pour le marché marocain.', features: ['Adaptée aux spécificités locales', 'Conforme aux régulations', 'Optimisée contexte national'] },
        { icon: Package, title: 'Solution Complète', description: 'Tous vos outils réunis dans une plateforme unifiée.', features: ['Interface centralisée', 'Modules intégrés', 'Gestion simplifiée'] },
        { icon: DollarSign, title: 'Économique', description: 'Plus abordable que les solutions internationales.', features: ['Prix adapté localement', 'Coûts réduits', 'Meilleur rapport qualité-prix'] },
        { icon: Zap, title: 'Déploiement Rapide', description: 'Mise en place accélérée pour résultats immédiats.', features: ['Installation rapide', 'Configuration simple', 'Résultats visibles'] },
        { icon: Users, title: 'Support Local', description: 'Accompagnement personnalisé pour votre réussite.', features: ['Support dédié', 'Formations adaptées', 'Assistance continue'] },
        { icon: Target, title: 'Vision 2030', description: 'Aligné avec les objectifs de développement du Maroc.', features: ['Stratégie nationale', 'Transformation digitale', 'Économie locale'] },
    ]

    return (
        <div ref={sectionRef}>
            <SectionContainer withGradientBlobs py="py-16 md:py-20">
                <ContentWrapper maxWidth="max-w-6xl">
                    <SectionHeader title="Pourquoi" highlightText="LuxTech"
                                   description="Une solution marocaine innovante conçue pour vos besoins" isVisible={isVisible}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {benefits.map((benefit, index) => (
                            <FeatureCard key={benefit.title} icon={benefit.icon} title={benefit.title}
                                         description={benefit.description} features={benefit.features}
                                         isVisible={isVisible} index={index}/>
                        ))}
                    </div>
                </ContentWrapper>
            </SectionContainer>
        </div>
    )
}

export default memo(BenefitsSection)
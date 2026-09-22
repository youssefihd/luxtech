import { MapPin, Package, Star, Rocket, Megaphone, Flag, Target } from 'lucide-react'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'
import ServiceTourismeCard from './ServiceTourismeCard'

const SERVICES = [
    {
        number: '1', title: 'Circuits et expériences locales',
        summary: "Création d'itinéraires authentiques mettant en valeur le patrimoine et les savoir-faire locaux.",
        icon: MapPin, soustitle: 'Des Itinéraires Authentiques et Personnalisés',
        fullDescription: `LuxTech accompagne les acteurs du tourisme dans la création de circuits uniques, valorisant le patrimoine culturel, naturel et artisanal des régions marocaines.\nNotre approche combine technologie digitale et expertise locale pour concevoir des expériences touristiques mémorables et respectueuses des traditions.`,
    },
    {
        number: '2', title: 'Packages régionaux',
        summary: "Conception d'offres touristiques complètes incluant hébergement, restauration et activités.",
        icon: Package, soustitle: 'Des Offres Touristiques Complètes et Attractives',
        fullDescription: `LuxTech facilite la conception de packages régionaux intégrant hébergement, restauration, transport et activités, afin d'offrir une expérience clé en main aux visiteurs.\nNotre plateforme permet de centraliser et optimiser toutes les composantes d'un séjour réussi.`,
    },
    {
        number: '3', title: 'Mise en avant du territoire',
        summary: 'Valorisation des atouts uniques de chaque région à travers des contenus engageants.',
        icon: Star, soustitle: 'Valoriser les Régions à Travers le Digital',
        fullDescription: `LuxTech accompagne les acteurs territoriaux dans la promotion de leurs destinations grâce à des contenus digitaux attractifs et engageants.\nPhotos professionnelles, vidéos immersives, storytelling captivant : nous mettons en lumière l'identité unique de chaque région.`,
    },
    {
        number: '4', title: 'Intégration dans la plateforme',
        summary: 'Digitalisation et mise en ligne immédiate sur notre marketplace touristique.',
        icon: Rocket, soustitle: 'Une Digitalisation Immédiate et Structurée',
        fullDescription: `LuxTech facilite l'intégration rapide des offres touristiques dans son écosystème digital afin de garantir une visibilité immédiate et une gestion centralisée.\nNotre plateforme garantit une mise en ligne professionnelle et optimisée pour la conversion.`,
    },
    {
        number: '5', title: 'Promotion digitale',
        summary: 'Campagnes nationales et internationales pour maximiser la visibilité.',
        icon: Megaphone, soustitle: 'Une Stratégie Marketing pour Maximiser Votre Visibilité',
        fullDescription: `LuxTech accompagne ses partenaires dans la promotion de leurs offres grâce à des campagnes digitales ciblées, déployées à l'échelle nationale et internationale.\nNotre expertise en marketing touristique permet d'augmenter la notoriété, d'attirer de nouveaux clients et de renforcer la performance commerciale.`,
    },
]

const STATS = [
    { value: '12+', label: 'Régions' },
    { value: '50+', label: 'Circuits' },
    { value: '100%', label: 'Digitalisé' },
    { value: '24/7', label: 'Support' },
]

const TourismSection = ({ onGetStartedClick }) => {
    return (
        <SectionContainer bgColor="bg-gray-50" withGradientBlobs>
            <ContentWrapper>
                <SectionHeader title="LuxTech accompagne" highlightText="les régions du Maroc"
                               description="Création et digitalisation de produits touristiques pour valoriser le patrimoine et renforcer l'attractivité des territoires."/>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="space-y-6">
                        {SERVICES.map((service, index) => (
                            <ServiceTourismeCard key={index} service={service} index={index}/>
                        ))}
                    </div>

                    <AnimatedElement animation="fade-left" delay={400}>
                        <div className="space-y-6 sticky top-24">
                            <div className="relative bg-gradient-to-br from-[#00BCD4] to-[#5E35B1] rounded-2xl p-8 text-white overflow-hidden">
                                <Flag size={60} className="absolute top-4 right-4 opacity-10"/>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-4">Valorisez votre région</h3>
                                    <p className="text-white/90 leading-relaxed mb-6">
                                        Rejoignez notre réseau de destinations marocaines et bénéficiez d'un accompagnement complet.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {STATS.map((stat, index) => (
                                            <div key={index} className="text-center transition-transform hover:scale-105">
                                                <div className="text-2xl font-bold">{stat.value}</div>
                                                <div className="text-white/80 text-sm">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <button onClick={onGetStartedClick}
                                                className="w-full bg-white text-[#00BCD4] py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                            Devenir partenaire <Rocket size={16}/>
                                        </button>
                                        <button type="button"
                                                className="w-full border-2 border-white text-white py-3 rounded-xl font-bold hover:bg-white hover:text-[#00BCD4] transition-all flex items-center justify-center gap-2">
                                            <MapPin size={16}/> Voir les régions
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center transition-shadow hover:shadow-lg">
                                <div className="flex justify-center mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-full flex items-center justify-center">
                                        <Target size={24} className="text-white"/>
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Vision 2030</h4>
                                <p className="text-gray-600 text-md font-serif">
                                    Partenaire stratégique du développement touristique du Maroc
                                </p>
                            </div>
                        </div>
                    </AnimatedElement>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default TourismSection
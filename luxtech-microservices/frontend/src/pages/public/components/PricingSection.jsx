import { useNavigate } from 'react-router-dom'
import { Check, Star, ArrowRight } from 'lucide-react'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'

const PricingSection = () => {
    const navigate = useNavigate()

    const singlePlan = {
        name: 'Pro',
        price: 129,
        badge: 'Annuel -17%',
        tagline: 'Solution complète pour Hôtels & Agences',
        description: 'Optimisé pour la croissance de votre activité touristique.',
        features: ['Outils avancés', 'Automatisations', 'Reporting', 'Support prioritaire'],
    }

    return (
        <SectionContainer id="pricing" className="scroll-mt-24" bgColor="bg-gradient-to-br from-gray-50 to-white" withGradientBlobs>
            <ContentWrapper>
                <SectionHeader title="Un tarif" highlightText="unique & transparent"
                               description="Profitez de la puissance de LuxTech avec un plan tout-en-un conçu pour tous les acteurs du tourisme."/>

                <div className="flex justify-center mt-12">
                    <AnimatedElement animation="fade-up" delay={200} className="w-full max-w-lg">
                        <div className="relative bg-white border-2 border-[#00BCD4] rounded-[2.5rem] p-8 shadow-xl transition-transform hover:scale-[1.02] duration-300">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
                                <Star size={16} fill="white"/> {singlePlan.badge}
                            </div>

                            <div className="text-center mb-10">
                                <h3 className="text-4xl font-black text-gray-900 mb-3">{singlePlan.name}</h3>
                                <div className="inline-block px-4 py-1 rounded-lg bg-[#00BCD4]/10 text-[#00BCD4] font-bold text-sm mb-4">
                                    {singlePlan.tagline}
                                </div>
                                <p className="text-gray-500 font-medium">{singlePlan.description}</p>
                            </div>

                            <div className="text-center mb-10">
                                <span className="text-gray-400 text-lg mr-2 font-medium">À partir de</span>
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">{singlePlan.price} MAD</span>
                                <span className="text-gray-400 text-2xl font-medium"> /mois</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-12">
                                {singlePlan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-7 h-7 bg-[#00BCD4]/10 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#00BCD4] shrink-0">
                                            <Check size={18} className="text-[#00BCD4] group-hover:text-white"/>
                                        </div>
                                        <span className="text-gray-700 text-lg font-medium tracking-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/contact')}
                                    className="w-full py-5 rounded-2xl font-bold text-white text-xl bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] hover:shadow-[0_10px_25px_rgba(0,188,212,0.4)] transition-all flex justify-center items-center gap-3 active:scale-95">
                                Demander une démo <ArrowRight size={24}/>
                            </button>
                        </div>
                    </AnimatedElement>
                </div>

                <AnimatedElement animation="fade-up" delay={400}>
                    <div className="flex justify-center gap-6 mt-16 text-[#00BCD4] font-semibold">
                        <button onClick={() => navigate('/pricing')} className="hover:underline">Voir tous les détails</button>
                        <span className="text-gray-300">•</span>
                        <button onClick={() => navigate('/contact')} className="hover:underline">Nous contacter</button>
                    </div>
                </AnimatedElement>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default PricingSection

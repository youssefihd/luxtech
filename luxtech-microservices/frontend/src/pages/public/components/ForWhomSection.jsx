import { useState } from 'react'
import { Building2, Handshake, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'

const TARGETS = {
    hotels: {
        icon: Building2,
        title: 'Pour les Hébergements',
        description: "Optimisez la gestion de vos établissements avec des outils spécialisés pour l'hospitalité.",
        features: [
            'Gestion centralisée des chambres',
            "Optimisation des taux d'occupation",
            'Suivi des revenus et performances',
            'Booking Engine intégré (réservations directes)',
            'Comptabilité & facturation intégrées',
            'Service client dédié',
        ],
        image: '/images/dashboard-img-hotel.png',
        alt: 'Dashboard de gestion hôtelière LuxTech',
    },
    agencies: {
        icon: Handshake,
        title: 'Pour les Agences',
        description: 'Simplifiez les réservations multi-hébergements et maximisez vos commissions.',
        features: [
            "Réseau d'hébergements",
            'Réservations groupées optimisées',
            'Gestion transparente des commissions',
            'Comptabilité & facturation intégrées',
            'CRM intégré',
            'Rapports analytiques',
        ],
        image: '/images/dashboard-img-agency.png',
        alt: 'Dashboard agences de voyage LuxTech',
    },
}

const ForWhomSection = () => {
    const [activeTab, setActiveTab] = useState('hotels')
    const activeTarget = TARGETS[activeTab]
    const Icon = activeTarget.icon
    const navigate = useNavigate()

    return (
        <SectionContainer bgColor="bg-gradient-to-br from-gray-50 to-white" withGradientBlobs>
            <ContentWrapper>
                <SectionHeader title="Pour" highlightText="qui"
                               description="Une plateforme complète qui sert tous les acteurs de l'écosystème touristique."/>

                <AnimatedElement animation="fade-up" delay={200}>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                        {Object.keys(TARGETS).map((key) => {
                            const TabIcon = TARGETS[key].icon
                            const isActive = activeTab === key
                            return (
                                <button key={key} onClick={() => setActiveTab(key)}
                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white shadow-lg scale-105'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#00BCD4] hover:scale-105'
                                        }`}>
                                    <TabIcon size={20}/>
                                    {TARGETS[key].title}
                                </button>
                            )
                        })}
                    </div>
                </AnimatedElement>

                <AnimatedElement animation="fade-up" delay={400}>
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 lg:p-12 shadow-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] flex items-center justify-center text-white shrink-0">
                                        <Icon size={26}/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{activeTarget.title}</h3>
                                        <p className="text-gray-600">{activeTarget.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {activeTarget.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"/>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-2xl">
                                <div className="relative">
                                    <img src={activeTarget.image} alt={activeTarget.alt}
                                         className="w-full h-auto rounded-xl block transition-transform duration-700"
                                         onError={(e) => { e.currentTarget.style.display = 'none' }}/>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                    <button onClick={() => navigate('/contact')}
                                            className="bg-white/95 text-gray-900 px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-[#00BCD4] hover:text-white transition-all transform hover:scale-105 active:scale-95">
                                        Demander une démo
                                        <ArrowRight size={20} style={{ color: '#5E35B1' }}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedElement>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default ForWhomSection
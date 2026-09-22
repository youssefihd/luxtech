import { useState, useEffect } from 'react'
import { Lightbulb, Handshake, Flag, Cpu, Rocket, Target, Eye, Zap, Users, Globe, Shield, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FooterSection from './components/FooterSection'
import Navbar from './components/Navbar'

const AboutPage = ({ onLoginClick, onRegisterClick }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const navigate = useNavigate()

    useEffect(() => { setIsVisible(true) }, [])

    const values = [
        { icon: Lightbulb, title: 'Innovation', description: "Nous nous engageons à toujours apporter les solutions les plus modernes et efficaces pour révolutionner l'industrie hôtelière." },
        { icon: Handshake, title: 'Accessibilité', description: 'Nos outils sont conçus pour être intuitifs et accessibles à tous les acteurs du tourisme, des grands groupes aux établissements indépendants.' },
        { icon: Flag, title: 'Transformation Locale', description: 'Nous croyons fermement au potentiel du Maroc et œuvrons chaque jour pour accélérer sa digitalisation touristique.' },
        { icon: Cpu, title: 'Excellence Technique', description: 'La qualité, la performance et la sécurité de nos solutions sont au cœur de nos développements et de notre philosophie.' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick}/>
            {/* Hero */}
            <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-28 bg-gradient-to-br from-[#0F1A2F] via-[#1A237E] to-[#0F172A] overflow-hidden">                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-[#00BCD4] rounded-full mix-blend-multiply filter blur-xl"/>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5E35B1] rounded-full mix-blend-multiply filter blur-xl"/>
                </div>
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
                            <div className="w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse"/>
                            <span className="text-white text-sm font-medium">Notre Histoire</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            À Propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">LuxTech</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Découvrez notre histoire, notre mission et les valeurs qui nous animent pour transformer l'écosystème touristique marocain.
                        </p>
                    </div>
                </div>
            </section>

            {/* Qui sommes-nous */}
            <section className="py-6 lg:py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 lg:p-12 shadow-2xl border border-gray-100">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                                    Qui <span className="text-[#1A237E]">sommes-nous</span> ?
                                </h2>
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                    <strong className="text-[#1A237E]">LuxTech</strong> est une startup marocaine innovante spécialisée dans la digitalisation du secteur touristique.
                                    Fondée avec la vision de moderniser l'industrie hôtelière, nous développons des solutions SaaS
                                    performantes adaptées aux besoins spécifiques des professionnels du tourisme.
                                </p>
                                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                                    Notre ambition est de positionner le <strong className="text-[#5E35B1]">Maroc comme leader technologique</strong> dans le domaine
                                    du tourisme digital à l'échelle de la région MENA d'ici 2030.
                                </p>
                                <div className="flex justify-end">
                                    <button onClick={() => setShowHistoryModal(true)}
                                            className="group inline-flex items-center gap-2 text-[#1A237E] font-semibold hover:text-[#5E35B1] transition-all duration-300">
                                        <span>En savoir plus</span>
                                        <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform duration-300"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                            <div className="relative">
                                <div className="bg-gradient-to-br from-[#1A237E] to-[#5E35B1] rounded-2xl p-8 text-white shadow-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Rocket size={32} className="text-[#00BCD4]"/>
                                        <h3 className="text-2xl font-bold">LuxTech Team</h3>
                                    </div>
                                    <p className="text-blue-100 leading-relaxed">
                                        Une équipe passionnée d'experts en technologie, tourisme et innovation,
                                        unis par la vision commune de révolutionner l'expérience hôtelière au Maroc et au-delà.
                                    </p>
                                </div>
                                <div className="absolute -top-4 -right-4 bg-[#00BCD4] text-white px-4 py-2 rounded-lg font-bold transform rotate-6 shadow-lg flex items-center gap-2">
                                    <Flag size={16}/>
                                    <span>Made in Morocco</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-10 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className={`bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#1A237E] to-[#5E35B1] rounded-xl flex items-center justify-center shrink-0">
                                    <Target size={24} className="text-white"/>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                    Notre <span className="text-[#1A237E]">Mission</span>
                                </h3>
                            </div>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                <strong>Digitaliser le tourisme marocain</strong> et devenir la référence technologique incontournable
                                dans la région MENA à l'horizon 2030, en offrant des solutions innovantes qui simplifient la gestion
                                et amplifient la croissance de nos partenaires.
                            </p>
                        </div>
                        <div className={`bg-gradient-to-br from-[#1A237E] to-[#5E35B1] rounded-3xl p-8 lg:p-10 shadow-xl text-white transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                                    <Eye size={24} className="text-white"/>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold">
                                    Notre <span className="text-[#00BCD4]">Vision</span>
                                </h3>
                            </div>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Un <strong>Maroc 100% connecté</strong> où tous les acteurs du tourisme - hôtels, agences,
                                prestataires, OTA et régions touristiques - collaborent de manière fluide et optimale grâce
                                à nos plateformes technologiques unifiées.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valeurs */}
            <section className="py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                            Nos <span className="text-[#1A237E]">Valeurs</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Les principes fondamentaux qui guident chacune de nos actions et décisions
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon
                            return (
                                <div key={index}
                                     className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                     style={{ transitionDelay: `${900 + index * 150}ms` }}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-xl flex items-center justify-center shrink-0">
                                            <Icon size={24} className="text-white"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-10 bg-gradient-to-r from-[#1A237E] to-[#5E35B1]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Prêt à rejoindre la révolution digitale ?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Découvrez comment LuxTech peut transformer votre établissement et accélérer votre croissance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={onRegisterClick}
                                className="bg-white text-[#1A237E] px-8 py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                            <Zap size={20}/> <span>Démarrer maintenant</span>
                        </button>
                        <button onClick={() => navigate('/contact')}
                                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#1A237E] transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                            <Users size={20}/> <span>Contactez-nous</span>
                        </button>
                    </div>
                    <div className="mt-8 flex justify-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2 text-blue-100"><Globe size={18}/><span className="text-sm">Solutions Globales</span></div>
                        <div className="flex items-center gap-2 text-blue-100"><Shield size={18}/><span className="text-sm">Sécurité Garantie</span></div>
                        <div className="flex items-center gap-2 text-blue-100"><Users size={18}/><span className="text-sm">Support 24/7</span></div>
                    </div>
                </div>
            </section>

            <FooterSection/>

            {/* Modal Notre Histoire */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowHistoryModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-white relative bg-gradient-to-r from-[#1A237E] to-[#5E35B1] shrink-0">
                            <button onClick={() => setShowHistoryModal(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18}/></button>
                            <div className="flex items-center gap-3">
                                <Flag size={22}/>
                                <h2 className="text-xl font-black">Notre Histoire</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                <strong className="text-[#1A237E]">LuxTech</strong> est née d'un constat simple : malgré le fort potentiel du tourisme marocain,
                                de nombreux établissements et agences utilisent encore des outils traditionnels peu performants.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Face à ce défi, notre équipe a décidé de créer une solution moderne, accessible et adaptée au contexte local,
                                afin d'accompagner les acteurs du tourisme dans leur transformation digitale.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Depuis sa création, <strong className="text-[#5E35B1]">LuxTech s'engage à proposer des technologies innovantes</strong> au service
                                du développement du secteur.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AboutPage
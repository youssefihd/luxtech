import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Cloud, Zap, Shield, Code, Building, Users, LifeBuoy, Palette } from 'lucide-react'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement, useIntersectionObserver } from './shared'

const AboutSection = () => {
    const [sectionRef, isVisible] = useIntersectionObserver()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [slidesPerView, setSlidesPerView] = useState(1)

    useEffect(() => {
        const updateSlidesPerView = () => setSlidesPerView(window.innerWidth >= 768 ? 2 : 1)
        updateSlidesPerView()
        window.addEventListener('resize', updateSlidesPerView)
        return () => window.removeEventListener('resize', updateSlidesPerView)
    }, [])

    const features = [
        { icon: Cloud, title: '100% Cloud', description: "Accédez à votre plateforme depuis n'importe où, sans installation requise.", bgColor: 'from-blue-50 to-cyan-50' },
        { icon: Zap, title: 'Ultra Rapide', description: 'Performance optimisée pour une expérience utilisateur fluide et réactive.', bgColor: 'from-amber-50 to-orange-50' },
        { icon: Shield, title: 'Sécurisé', description: 'Protection avancée de vos données avec chiffrement et sauvegardes automatiques.', bgColor: 'from-emerald-50 to-green-50' },
        { icon: Code, title: 'API Ouverte', description: 'Intégrez facilement avec vos outils existants grâce à notre API documentée.', bgColor: 'from-violet-50 to-purple-50' },
        { icon: Building, title: 'Multi-établissements', description: 'Gérez plusieurs hébergements simultanément depuis une interface unique.', bgColor: 'from-indigo-50 to-blue-50' },
        { icon: Users, title: 'Multi-agences', description: 'Collaborez avec toutes vos agences partenaires sur une même plateforme.', bgColor: 'from-pink-50 to-rose-50' },
        { icon: LifeBuoy, title: 'Support 7j/7', description: 'Notre équipe locale vous accompagne tous les jours de la semaine.', bgColor: 'from-cyan-50 to-sky-50' },
        { icon: Palette, title: 'UX Moderne', description: 'Interface intuitive et design épuré pour une prise en main immédiate.', bgColor: 'from-fuchsia-50 to-pink-50' },
    ]

    const totalSlides = features.length
    const maxSlide = Math.max(0, totalSlides - slidesPerView)
    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, maxSlide))
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0))
    const goToSlide = (index) => setCurrentSlide(Math.min(index, maxSlide))

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1)
        }, 4000)
        return () => clearInterval(interval)
    }, [currentSlide, maxSlide])

    const isPrevDisabled = currentSlide === 0
    const isNextDisabled = currentSlide >= maxSlide

    return (
        <div ref={sectionRef}>
            <SectionContainer bgColor="bg-gradient-to-br from-gray-50 to-white" withGradientBlobs>
                <ContentWrapper>
                    <SectionHeader title="Une Solution" highlightText="Intégrée"
                                   description="Notre plateforme SaaS révolutionne la collaboration entre hébergements et agences de voyage, offrant un écosystème unifié pour une gestion optimale."
                                   isVisible={isVisible}/>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <AnimatedElement isVisible={isVisible} animation="fade-right" delay={300} className="space-y-8">
                            <div className="space-y-6">
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                    <strong style={{ color: '#1A237E' }}>LuxTech</strong> est une startup marocaine innovante spécialisée dans la digitalisation du secteur touristique.
                                    Fondée avec la vision de moderniser l'industrie hôtelière, nous développons des solutions SaaS
                                    performantes adaptées aux besoins spécifiques des professionnels du tourisme.
                                </p>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Notre ambition est de positionner le <strong style={{ color: '#5E35B1' }}>Maroc comme leader technologique</strong> dans le domaine
                                    du tourisme digital à l'échelle de la région MENA d'ici 2030.
                                </p>
                            </div>

                            <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-4 shadow-lg">
                                <div className="relative w-full overflow-hidden">
                                    <div className="h-48 overflow-hidden">
                                        <div className="flex h-full transition-transform duration-500 ease-in-out"
                                             style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}>
                                            {features.map((feature, index) => {
                                                const Icon = feature.icon
                                                return (
                                                    <div key={index} className="shrink-0" style={{ width: `${100 / slidesPerView}%` }}>
                                                        <div className={`bg-gradient-to-br ${feature.bgColor} flex h-full flex-col justify-center items-center p-4 rounded-xl border border-gray-200 mx-1`}>
                                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white mb-3">
                                                                <Icon size={24}/>
                                                            </div>
                                                            <h3 className="text-base font-bold text-gray-900 mb-1 text-center">{feature.title}</h3>
                                                            <p className="text-gray-600 text-xs leading-relaxed text-center">{feature.description}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <button type="button" onClick={prevSlide} disabled={isPrevDisabled}
                                        className={`absolute left-2 top-1/2 -translate-y-1/2 size-8 bg-white flex items-center justify-center rounded-full shadow-lg border border-gray-200 transition-all duration-200 ${isPrevDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}`}>
                                    <ChevronLeft size={16} className="text-gray-700"/>
                                </button>
                                <button type="button" onClick={nextSlide} disabled={isNextDisabled}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-white flex items-center justify-center rounded-full shadow-lg border border-gray-200 transition-all duration-200 ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}`}>
                                    <ChevronRight size={16} className="text-gray-700"/>
                                </button>

                                <div className="flex justify-center mt-4 space-x-2">
                                    {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                                        <button key={index} onClick={() => goToSlide(index)}
                                                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] w-6' : 'bg-gray-300 hover:bg-gray-400 w-2'}`}/>
                                    ))}
                                </div>
                            </div>
                        </AnimatedElement>

                        <AnimatedElement isVisible={isVisible} animation="fade-left" delay={500}>
                            <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-4 shadow-xl">
                                <img src="/images/about-img.jpeg" alt="LuxTech - Hotel Management Platform" className="w-full h-auto rounded-lg"
                                     onError={e => { e.target.style.display = 'none' }}/>
                            </div>
                            <div className="absolute -top-4 -left-4 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white px-3 py-1 rounded-lg font-bold transform rotate-6 shadow-lg z-10 text-sm">
                                🚀 Innovant
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded-lg font-bold transform -rotate-6 shadow-lg text-sm">
                                ⚡ Rapide
                            </div>
                        </AnimatedElement>
                    </div>
                </ContentWrapper>
            </SectionContainer>
        </div>
    )
}

export default AboutSection
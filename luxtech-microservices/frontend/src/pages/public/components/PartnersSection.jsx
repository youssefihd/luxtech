import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Building } from 'lucide-react'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'

const PARTNERS = [
    { id: 1, name: 'Maroc PME', logo: '/images/partners/maroc-pme.png', description: 'Agence nationale pour la promotion des PME' },
    { id: 2, name: 'SMIT', logo: '/images/partners/maroc-smit.png', description: "Société Marocaine d'Ingénierie Touristique" },
    { id: 3, name: 'Partenaire', description: 'Bientôt disponible' },
    { id: 4, name: 'Partenaire', description: 'Bientôt disponible' },
    { id: 5, name: 'Partenaire', description: 'Bientôt disponible' },
]

const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth >= 1280) return 5
    if (window.innerWidth >= 1024) return 4
    if (window.innerWidth >= 768) return 3
    if (window.innerWidth >= 640) return 2
    return 1
}

const PartnersSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView())
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        const onResize = () => setSlidesPerView(getSlidesPerView())
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const nextSlide = useCallback(() => setCurrentSlide(prev => (prev + 1) % PARTNERS.length), [])
    const prevSlide = useCallback(() => setCurrentSlide(prev => (prev - 1 + PARTNERS.length) % PARTNERS.length), [])

    useEffect(() => {
        if (!isAutoPlaying) return
        const interval = setInterval(nextSlide, 3000)
        return () => clearInterval(interval)
    }, [isAutoPlaying, nextSlide])

    return (
        <SectionContainer withGradientBlobs>
            <ContentWrapper>
                <SectionHeader title="Ils nous" highlightText="font confiance"
                               description="Nous collaborons avec les acteurs majeurs du tourisme et de la technologie au Maroc pour offrir les meilleures solutions à nos clients."/>

                <AnimatedElement animation="fade-up" delay={150}>
                    <div className="relative" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
                        <div className="overflow-hidden">
                            <div className="flex transition-transform duration-500 ease-in-out"
                                 style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)`, width: `${(PARTNERS.length / slidesPerView) * 100}%` }}>
                                {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                                    <div key={`${partner.id}-${index}`} className="px-3 shrink-0" style={{ width: `${100 / slidesPerView}%` }}>
                                        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full transition-all hover:shadow-lg hover:scale-105 group">
                                            <div className="text-center">
                                                <div className="w-24 h-24 mx-auto mb-3 bg-white border border-gray-200 rounded-xl flex items-center justify-center group-hover:border-[#00BCD4] transition">
                                                    {partner.logo ? (
                                                        <img src={partner.logo} alt={partner.name} className="w-20 h-20 object-contain"
                                                             onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg></svg>' }}/>
                                                    ) : (
                                                        <Building className="text-gray-400"/>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#00BCD4] transition">{partner.name}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2">{partner.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition">
                            <ChevronLeft size={20}/>
                        </button>
                        <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition">
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                </AnimatedElement>

                <AnimatedElement animation="fade-up" delay={400}>
                    <div className="flex justify-center mt-8 gap-2">
                        {PARTNERS.map((_, index) => (
                            <button key={index} onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}/>
                        ))}
                    </div>
                </AnimatedElement>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default PartnersSection
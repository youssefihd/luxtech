import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Cloud,
    Zap,
    ShieldCheck,
    Code2,
    Building2,
    Users,
    LifeBuoy,
    Palette,
} from 'lucide-react'
import {
    SectionContainer,
    ContentWrapper,
    SectionHeader,
    AnimatedElement,
    useIntersectionObserver,
} from './shared'

const FEATURES = [
    { icon: Cloud, title: '100% Cloud', description: "Accédez à votre environnement depuis n'importe où, sans installation." },
    { icon: Zap, title: 'Rapide par conception', description: 'Une interface pensée pour les équipes qui travaillent avec beaucoup de données.' },
   { icon: ShieldCheck, title: 'Sécurité intégrée', description: "Contrôles d'accès, sauvegardes et bonnes pratiques de protection des données." },
    { icon: Code2, title: 'API ouverte', description: 'Connectez vos outils existants avec une API claire et documentée.' },
    { icon: Building2, title: 'Multi-établissements', description: 'Pilotez plusieurs propriétés depuis une même expérience.' },
    { icon: Users, title: 'Multi-agences', description: 'Travaillez avec vos partenaires sans multiplier les outils.' },
    { icon: LifeBuoy, title: 'Support humain', description: 'Un accompagnement local quand votre équipe en a besoin.' },
    { icon: Palette, title: 'UX professionnelle', description: 'Des écrans conçus pour la lisibilité, la vitesse et la prise de décision.' },
]

const AboutSection = () => {
    const [sectionRef, isVisible] = useIntersectionObserver()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [slidesPerView, setSlidesPerView] = useState(2)

    useEffect(() => {
        const update = () => setSlidesPerView(window.innerWidth >= 900 ? 2 : 1)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    const maxSlide = Math.max(0, FEATURES.length - slidesPerView)

    useEffect(() => {
        setCurrentSlide(prev => Math.min(prev, maxSlide))
    }, [maxSlide])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1)
        }, 5000)
        return () => clearInterval(timer)
    }, [maxSlide])

    return (
        <section ref={sectionRef} id="about" className="bg-white border-t border-slate-100">
            <SectionContainer py="py-20 lg:py-28">
                <ContentWrapper maxWidth="max-w-7xl">
                    <SectionHeader
                        title="Une solution"
                        highlightText="intégrée"
                        description="LuxTech réunit les opérations, les données et les partenaires touristiques dans un environnement conçu pour le quotidien des professionnels."
                        isVisible={isVisible}
                    />

                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-start">
                        <AnimatedElement isVisible={isVisible} animation="fade-right" delay={150}>
                            <div className="max-w-xl">
                                <div className="border-l-2 border-[#20BFD3] pl-6 mb-8">
                                    <p className="text-xl leading-8 text-slate-700">
                                        <strong className="text-[#172B63]">LuxTech</strong> est une startup marocaine spécialisée dans la digitalisation du tourisme.
                                        Nous construisons des outils SaaS adaptés aux réalités opérationnelles des hébergements et des agences.
                                    </p>
                                </div>

                                <p className="text-base leading-7 text-slate-500 mb-8">
                                    L'objectif est simple : réduire la fragmentation des outils, améliorer la visibilité sur l'activité
                                    et faciliter la collaboration entre les différents acteurs du voyage.
                                </p>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-slate-200 pt-7">
                                    <div>
                                        <p className="text-2xl font-bold text-[#172B63]">01</p>
                                        <p className="text-sm text-slate-500 mt-1">Un environnement unifié</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#172B63]">02</p>
                                        <p className="text-sm text-slate-500 mt-1">Des données plus lisibles</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#172B63]">03</p>
                                        <p className="text-sm text-slate-500 mt-1">Des processus connectés</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#172B63]">04</p>
                                        <p className="text-sm text-slate-500 mt-1">Un support de proximité</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedElement>

                        <AnimatedElement isVisible={isVisible} animation="fade-left" delay={250}>
                            <div className="relative">
                                <div className="border border-slate-200 bg-slate-50 p-2">
                                    <img
                                        src="/images/about-img.jpeg"
                                        alt="Interface LuxTech de gestion hôtelière"
                                        className="w-full aspect-[16/10] object-cover"
                                        onError={e => { e.currentTarget.style.display = 'none' }}
                                    />
                                </div>
                                <div className="absolute -bottom-5 left-5 bg-[#172B63] text-white px-5 py-3 shadow-lg">
                                    <span className="block text-[10px] uppercase tracking-[0.18em] text-cyan-200">LuxTech</span>
                                    <span className="font-semibold">Hospitality technology</span>
                                </div>
                            </div>
                        </AnimatedElement>
                    </div>

                    <AnimatedElement isVisible={isVisible} animation="fade-up" delay={350}>
                        <div className="mt-20 border-y border-slate-200">
                            <div className="flex items-center justify-between px-1 py-5">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Conçu pour l'opérationnel</p>
                                    <p className="text-sm text-slate-600 mt-1">Des fonctionnalités utiles, sans surcharge visuelle.</p>
                                </div>
                                <div className="hidden sm:flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                                        disabled={currentSlide === 0}
                                        className="w-9 h-9 border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:border-[#20BFD3] transition"
                                        aria-label="Précédent"
                                    >
                                        <ChevronLeft size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentSlide(Math.min(maxSlide, currentSlide + 1))}
                                        disabled={currentSlide === maxSlide}
                                        className="w-9 h-9 border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:border-[#20BFD3] transition"
                                        aria-label="Suivant"
                                    >
                                        <ChevronRight size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
                                >
                                    {FEATURES.map((feature) => {
                                        const Icon = feature.icon
                                        return (
                                            <div
                                                key={feature.title}
                                                className="shrink-0"
                                                style={{ width: `${100 / slidesPerView}%` }}
                                            >
                                                <div className="min-h-40 border-t border-slate-200 p-6 sm:p-8 mr-0 lg:mr-6 group hover:bg-slate-50 transition">
                                                    <div className="flex gap-5">
                                                        <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#172B63] text-white">
                                                            <Icon size={19} strokeWidth={1.8} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                                                            <p className="text-sm leading-6 text-slate-500 mt-2 max-w-sm">{feature.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-1.5 py-5">
                                {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`Aller à la position ${index + 1}`}
                                        className={`h-1 transition-all ${index === currentSlide ? 'w-8 bg-[#20BFD3]' : 'w-2 bg-slate-300'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </AnimatedElement>
                </ContentWrapper>
            </SectionContainer>
        </section>
    )
}

export default AboutSection

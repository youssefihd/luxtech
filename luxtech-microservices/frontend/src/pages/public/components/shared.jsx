import { useState, useEffect, useRef } from 'react'

export const NAVY = '#1D2252'
export const CYAN = '#66CAD8'
export const PURPLE = '#5D2E8B'

export const useIntersectionObserver = (options = {}) => {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true)
                observer.unobserve(el)
            }
        }, { threshold: 0.15, ...options })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, isVisible]
}

export const SectionContainer = ({ children, className = '', py = 'py-16 md:py-24', bgColor = '', withGradientBlobs = false }) => (
    <section className={`relative w-full overflow-hidden ${py} ${bgColor} ${className}`}>
        {withGradientBlobs && (
            <>
                <div className="absolute top-0 left-[-10%] w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"/>
                <div className="absolute bottom-0 right-[-10%] w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"/>
            </>
        )}
        <div className="relative">{children}</div>
    </section>
)

export const ContentWrapper = ({ children, className = '', maxWidth = 'max-w-7xl' }) => (
    <div className={`${maxWidth} mx-auto ${className}`}>
        {children}
    </div>
)

export const AnimatedElement = ({ children, animation = 'fade-up', delay = 0, isVisible = true, className = '' }) => {
    const animations = {
        'fade-up':    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        'fade-right': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
        'fade-left':  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
        'fade-in':    isVisible ? 'opacity-100' : 'opacity-0',
    }
    return (
        <div className={`transition-all duration-700 ease-out ${animations[animation] || animations['fade-up']} ${className}`}
             style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    )
}

export const GradientText = ({ children, className = '' }) => (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
          style={!className.includes('from-') ? { backgroundImage: `linear-gradient(90deg, ${NAVY}, ${PURPLE})` } : {}}>
        {children}
    </span>
)

export const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all'
    const variants = {
        primary: 'text-white shadow-lg',
        outline: 'border-2 border-gray-200 text-gray-700 hover:border-gray-300',
    }
    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}
                style={variant === 'primary' ? { background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` } : {}}>
            {children}
        </button>
    )
}

export const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${className}`}
          style={{ background: `${CYAN}15`, color: NAVY }}>
        {children}
    </span>
)

// SectionHeader : titre + mot-clé en dégradé + description, centré par défaut
export const SectionHeader = ({ title, highlightText, subtitle, description, isVisible = true, center = true }) => {
    const text = description || subtitle
    return (
        <div className={`mb-10 md:mb-14 ${center ? 'text-center mx-auto max-w-3xl' : ''}`}>
            <AnimatedElement animation="fade-up" isVisible={isVisible}>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
                    {title}{highlightText && <> <GradientText className="from-blue-600 to-indigo-600">{highlightText}</GradientText></>}
                </h2>
                {text && <p className="text-base md:text-lg text-gray-500 leading-relaxed">{text}</p>}
            </AnimatedElement>
        </div>
    )
}

// FeatureCard : icône + titre + description + liste de points (variant compact utilisé sur la homepage)
export const FeatureCard = ({ icon: Icon, title, description, features = [], isVisible = true, index = 0, color = CYAN }) => (
    <AnimatedElement animation="fade-up" delay={index * 100} isVisible={isVisible}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                <Icon size={22} className="text-white"/>
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{description}</p>
            {features.length > 0 && (
                <ul className="space-y-1.5">
                    {features.map((f, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }}/> {f}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </AnimatedElement>
)
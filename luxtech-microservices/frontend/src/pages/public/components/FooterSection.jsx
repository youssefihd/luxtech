import { useEffect, useRef, useState } from 'react'
import { BookOpen, Building2, Mail, MapPin, Phone, Scale, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ChatWidget from './ChatWidget'

const FooterSection = () => {
    const navigate = useNavigate()
    const [showScrollTop, setShowScrollTop] = useState(false)
    const footerRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            const footer = footerRef.current
            if (!footer) return
            setShowScrollTop(footer.getBoundingClientRect().top < window.innerHeight)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    const sections = {
        produit: {
            title: 'Produit',
            icon: Building2,
            links: [
                ['Accueil', '/'],
                ['À propos', '/about'],
                ['Solutions', '/solutions'],
                ['Tarifs', '/pricing'],
                ['Contact', '/contact'],
            ],
        },
        ressources: {
            title: 'Ressources',
            icon: BookOpen,
            links: [
                ['Documentation', '/documentation'],
                ['Blog', '/BlogPost'],
                ["Centre d'aide", '#'],
                ['Guides', '#'],
            ],
        },
        legal: {
            title: 'Légal',
            icon: Scale,
            links: [
                ['Mentions légales', '#'],
                ['Politique de confidentialité', '#'],
            ],
        },
    }

    const contact = [
        { icon: Mail, value: 'contact@luxtech.ma', href: 'mailto:contact@luxtech.ma' },
        { icon: Phone, value: '+212 5 22 21 44 94', href: 'tel:+212522214494' },
        { icon: MapPin, value: 'Bd Dammam, Technopark-Bureau 371, Casablanca, Maroc' },
    ]

    return (
        <footer ref={footerRef} className="bg-[#101D3D] text-white">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <div className="py-16 lg:py-20 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-24">
                    <div>
                        <button onClick={() => navigate('/')} className="block">
                            <img
                                src="/images/Luxtech_logo.png"
                                alt="LuxTech"
                                className="h-11 w-auto brightness-0 invert"
                                onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                        </button>

                        <p className="max-w-md text-sm leading-7 text-white/60 mt-7">
                            Startup marocaine spécialisée dans la digitalisation du tourisme.
                            Des solutions SaaS conçues pour les hébergements, agences et acteurs de l'écosystème du voyage.
                        </p>

                        <div className="mt-8 space-y-4">
                            {contact.map(({ icon: Icon, value, href }) => (
                                <div key={value} className="flex items-start gap-3 text-sm text-white/65">
                                    <Icon size={17} className="text-[#65D1DF] mt-0.5 shrink-0" />
                                    {href ? (
                                        <a href={href} className="hover:text-white transition">{value}</a>
                                    ) : (
                                        <span>{value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-9">
                        {Object.values(sections).map(section => {
                            const Icon = section.icon
                            return (
                                <div key={section.title}>
                                    <div className="flex items-center gap-2 mb-5">
                                        <Icon size={16} className="text-[#65D1DF]" />
                                        <h3 className="text-sm font-semibold">{section.title}</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {section.links.map(([label, path]) => (
                                            <li key={label}>
                                                <button
                                                    onClick={() => path === '#' ? undefined : navigate(path)}
                                                    className="text-sm text-white/50 hover:text-[#65D1DF] transition text-left"
                                                >
                                                    {label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">© {new Date().getFullYear()} LuxTech. Tous droits réservés.</p>
                    <div className="flex items-center gap-5 text-xs text-white/45">
                        <button onClick={() => navigate('/contact')} className="hover:text-[#65D1DF] transition">Contact</button>
                        <button onClick={scrollToTop} className="hover:text-[#65D1DF] transition">Haut de page ↑</button>
                    </div>
                </div>
            </div>

            <ChatWidget showScrollTop={showScrollTop} onScrollTop={scrollToTop} />
        </footer>
    )
}

export default FooterSection

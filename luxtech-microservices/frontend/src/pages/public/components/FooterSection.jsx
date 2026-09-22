import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, Sparkles, MapPin, ArrowUp, Send, Building, BookOpen, Scale } from 'lucide-react'
import ChatWidget from './ChatWidget'

const FooterSection = () => {
    const navigate = useNavigate()
    const [showScrollTop, setShowScrollTop] = useState(false)
    const footerRef = useRef(null)

    const handleNavigation = (path) => navigate(path)
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.querySelector('footer')
            if (!footer) return
            setShowScrollTop(footer.getBoundingClientRect().top < window.innerHeight)
        }
        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const footerSections = {
        produit: {
            title: 'Produit', icon: Building,
            links: [
                { label: 'Accueil', path: '/' },
                { label: 'À Propos', path: '/about' },
                { label: 'Solutions', path: '/solutions' },
                { label: 'Tarifs', path: '/pricing' },
                { label: 'Contact', path: '/contact' },
            ],
        },
        ressources: {
            title: 'Ressources', icon: BookOpen,
            links: [
                { label: 'Documentation', action: () => window.open('/documentation', '_blank') },
                { label: 'Blog', action: () => window.open('/BlogPost', '_blank') },
                { label: "Centre d'Aide", action: () => window.open('#', '_blank') },
                { label: 'Guides', action: () => window.open('#', '_blank') },
            ],
        },
        legal: {
            title: 'Légal', icon: Scale,
            links: [
                { label: 'Mentions Légales', action: () => window.open('#', '_blank') },
                { label: 'Politique de Confidentialité', action: () => window.open('#', '_blank') },
            ],
        },
    }



    const contactInfo = [
        { icon: Mail, value: 'contact@luxtech.ma', link: 'mailto:contact@luxtech.ma' },
        { icon: Phone, value: '+212 5 22 21 44 94', link: 'tel:+212522214494' },
        { icon: MapPin, value: 'Bd Dammam, Technopark-Bureau 371, Casablanca, Maroc' },
    ]

    return (
        <footer className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#00BCD4] rounded-full mix-blend-multiply filter blur-3xl"/>
                <div className="absolute top-10 right-10 w-80 h-80 bg-[#5E35B1] rounded-full mix-blend-multiply filter blur-3xl"/>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-10 lg:py-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNavigation('/')}>
                                <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                                     onError={e => {
                                         e.target.style.display = 'none'
                                         e.target.parentElement.innerHTML = `<span style="font-size:22px;font-weight:900;color:white">LUX<span style="color:#66CAD8">TECH</span></span>`
                                     }}/>
                            </div>
                            <p className="text-gray-300 leading-relaxed max-w-md text-base sm:text-lg">
                                Startup marocaine innovante spécialisée dans la digitalisation du tourisme.
                                Des solutions SaaS modernes pour hébergements, agences et acteurs régionaux.
                            </p>
                            <div className="space-y-3">
                                {contactInfo.map((contact, index) => {
                                    const Icon = contact.icon
                                    return (
                                        <div key={index} className="flex items-center gap-3 text-gray-300 text-sm">
                                            <Icon size={18} className="text-[#00BCD4] shrink-0"/>
                                            {contact.link ? (
                                                <a href={contact.link} className="hover:text-[#00BCD4] transition">{contact.value}</a>
                                            ) : (
                                                <span>{contact.value}</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex flex-wrap gap-3 pt-4">
                                {['LinkedIn', 'Twitter', 'Instagram'].map((name) => (
                                    <a key={name} href="#" title={name}
                                       className="px-3 h-10 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-xs font-bold text-gray-300 hover:bg-white/20 hover:text-white transition">
                                        {name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-rows-auto gap-12">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                {Object.entries(footerSections).map(([key, section]) => {
                                    const Icon = section.icon
                                    return (
                                        <div key={key} className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Icon size={18} className="text-[#00BCD4]"/>
                                                <h3 className="text-white font-semibold">{section.title}</h3>
                                            </div>
                                            <ul className="space-y-2">
                                                {section.links.map((link, index) => (
                                                    <li key={index}>
                                                        <button onClick={link.path ? () => handleNavigation(link.path) : link.action}
                                                                className="text-gray-400 hover:text-[#00BCD4] text-sm transition transform hover:translate-x-1">
                                                            {link.label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="bg-gradient-to-r from-[#1A237E]/20 to-[#5E35B1]/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-[#5E35B1]/30">
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Restez Informé</h3>
                                        <p className="text-gray-300 text-sm sm:text-base">Recevez les dernières actualités sur la digitalisation touristique.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="email" placeholder="Votre email professionnel"
                                               className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"/>
                                        <button className="bg-gradient-to-r from-[#00BCD4] to-[#1A237E] px-6 py-2 rounded-xl text-white font-semibold hover:scale-105 transition flex items-center justify-center gap-2 whitespace-nowrap">
                                            <Send size={18}/> S'abonner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700/50 mt-8 pt-4">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-sm text-gray-400">
                            <p>© {new Date().getFullYear()} LuxTech. Tous droits réservés.</p>
                            <div className="flex flex-wrap gap-6 justify-center">
                                <button onClick={() => handleNavigation('/contact')} className="hover:text-[#00BCD4]">Contact</button>
                                <a href="#" className="hover:text-[#00BCD4]">Support</a>
                                <a href="#" className="hover:text-[#00BCD4]">Plan du Site</a>
                                <button onClick={scrollToTop} className="hover:text-[#00BCD4]">Haut de page ↑</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChatWidget showScrollTop={showScrollTop} onScrollTop={scrollToTop}/>

            <div ref={footerRef} className="w-full h-1"/>
        </footer>
    )
}

export default FooterSection
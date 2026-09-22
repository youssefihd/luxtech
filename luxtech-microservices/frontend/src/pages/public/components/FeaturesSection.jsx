import { useState, useEffect } from 'react'

const FeaturesSection = () => {
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300)
        return () => clearTimeout(timer)
    }, [])

    const features = [
        { icon: '☁️', title: '100% Cloud', description: "Accédez à votre plateforme depuis n'importe où, sans installation requise." },
        { icon: '⚡', title: 'Ultra Rapide', description: 'Performance optimisée pour une expérience utilisateur fluide et réactive.' },
        { icon: '🔒', title: 'Sécurisé', description: 'Protection avancée de vos données avec chiffrement et sauvegardes automatiques.' },
        { icon: '🔌', title: 'API Ouverte', description: 'Intégrez facilement avec vos outils existants grâce à notre API documentée.' },
        { icon: '🏨', title: 'Multi-établissements', description: 'Gérez plusieurs hébergements simultanément depuis une interface unique.' },
        { icon: '🤝', title: 'Multi-agences', description: 'Collaborez avec toutes vos agences partenaires sur une même plateforme.' },
        { icon: '🛟', title: 'Support 7j/7', description: 'Notre équipe locale vous accompagne tous les jours de la semaine.' },
        { icon: '🎨', title: 'UX Moderne', description: 'Interface intuitive et design épuré pour une prise en main immédiate.' },
    ]

    return (
        <section id="features" className="relative py-10 lg:py-12 bg-gray-50 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-10 left-10 w-80 h-80 bg-[#00BCD4] rounded-full mix-blend-multiply filter blur-3xl"/>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#5E35B1] rounded-full mix-blend-multiply filter blur-3xl"/>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center mb-12 lg:mb-16 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Une plateforme <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">complète</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Tous les outils dont vous avez besoin pour gérer votre activité hôtelière, réunis dans une solution moderne et efficace
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index}
                             className={`group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-lg overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                             style={{ transitionDelay: `${index * 100}ms` }}>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00BCD4]/5 to-[#5E35B1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"/>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
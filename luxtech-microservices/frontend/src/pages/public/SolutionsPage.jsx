import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hotel, RefreshCw, Plane, Users, BarChart, Check, Zap, X, Send } from 'lucide-react'
import Navbar from './components/Navbar'
import FooterSection from './components/FooterSection'

const DemoModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ nom: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    useEffect(() => { if (isOpen) { setSent(false); setForm({ nom: '', email: '', message: '' }) } }, [isOpen])

    const handleSubmit = (e) => {
        e.preventDefault()
        setSent(true)
    }

    if (!isOpen) return null
    const ic = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00BCD4] transition"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-white relative bg-gradient-to-r from-[#1A237E] to-[#5E35B1]">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18}/></button>
                    <h2 className="text-xl font-black">Demander une démo</h2>
                    <p className="text-white/70 text-sm mt-1">Notre équipe vous recontacte sous 24h.</p>
                </div>
                <div className="p-6">
                    {sent ? (
                        <div className="text-center py-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Check size={26} className="text-emerald-600"/></div>
                            <p className="font-bold text-gray-900">Demande envoyée !</p>
                            <p className="text-gray-500 text-sm mt-1">Nous vous répondrons rapidement.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input required placeholder="Votre nom" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className={ic}/>
                            <input required type="email" placeholder="Votre email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={ic}/>
                            <textarea rows={3} placeholder="Votre message (optionnel)" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className={ic}/>
                            <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] hover:shadow-lg transition flex items-center justify-center gap-2">
                                <Send size={16}/> Envoyer la demande
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

const SolutionsPage = ({ onLoginClick, onRegisterClick }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [activeSolution, setActiveSolution] = useState(0)
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => { setIsVisible(true) }, [])

    const solutions = [
        {
            icon: Hotel, title: 'PMS – Pour les hôtels', category: 'Gestion Hôtelière',
            description: 'Solution complète de Property Management System pour une gestion optimisée de votre établissement',
            features: ['Planning intelligent des chambres', 'Réservations multi-canaux', 'Comptabilité & facturation intégrées', 'Housekeeping en temps réel', 'Inventaire dynamique', 'Rapports et statistiques avancés'],
            advantages: ['Compatible hôtels classés et non classés', 'Réduction du surbooking à 0%', "Gain de temps jusqu'à 70%", 'Meilleure gestion des revenus', "Optimisation du taux d'occupation"],
        },
        {
            icon: RefreshCw, title: 'Channel Manager', category: 'Distribution',
            description: 'Synchronisez vos disponibilités sur toutes les plateformes en temps réel',
            features: ['Synchronisation temps réel des disponibilités', 'Mise à jour automatique des tarifs', 'Intégration des OTA', 'Gestion centralisée des canaux', 'Alertes de performance'],
            advantages: ['Gestion des disponibilités sans risque de surbooking', 'Visibilité multiplateforme accrue', 'Optimisation des ventes directes', 'Gestion simplifiée des tarifs', 'Augmentation du Revenu par chambre disponible (RevPAR)'],
        },
        {
            icon: Plane, title: 'TAMS – Pour les agences', category: 'Tour Operator',
            description: 'Plateforme dédiée aux agences de voyage pour une gestion optimale',
            features: ['Accès aux disponibilités des hébergements touristiques', 'Création de circuits & packages', 'Gestion des devis et factures', 'Espace B2B professionnel', 'Site B2C intégré'],
            advantages: ['Optimise la vente de packages', 'Connecte les agences aux hébergements', 'Automatisation complète de la gestion', 'Économie de temps et de ressources', 'Expérience client améliorée'],
        },
        {
            icon: Users, title: 'CRM Tourisme', category: 'Relation Client',
            description: 'Solution CRM spécialisée pour la fidélisation et le marketing touristique',
            features: ['Base clients centralisée', 'Historique complet des interactions', 'Segmentation avancée'],
            advantages: ['Fidélisation client renforcée', 'Ciblage marketing ultra-précis', 'Amélioration de la relation client', 'Augmentation du taux de répétition', 'Personnalisation des offres'],
        },
        {
            icon: BarChart, title: 'Outils Marketing', category: 'Acquisition',
            description: "Suite complète d'outils marketing pour booster vos réservations",
            features: ['Campagnes SMS massives', 'Emailing automatisé', 'Pages de vente optimisées', 'Coupons & promotions ciblées', 'Référencement OTA optimisé'],
            advantages: ['Acquisition de nouveaux clients', 'Promotion efficace et mesurable', 'Augmentation des réservations directes', 'ROI marketing optimisé', 'Automatisation des campagnes'],
        },
    ]

    const ActiveIcon = solutions[activeSolution].icon

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick}/>
            <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)}/>

            {/* Hero */}
            <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-28 bg-gradient-to-br from-[#0F1A2F] via-[#1A237E] to-[#0F172A] overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-[#00BCD4] rounded-full mix-blend-multiply filter blur-xl"/>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5E35B1] rounded-full mix-blend-multiply filter blur-xl"/>
                </div>
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
                            <div className="w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse"/>
                            <span className="text-white text-sm font-medium">Solutions Digitales</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Nos Solutions <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">Complètes</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            La suite SaaS la plus complète pour digitaliser et optimiser le tourisme marocain.
                            Des outils performants adaptés à chaque acteur de l'écosystème.
                        </p>
                    </div>
                </div>
            </section>

            {/* Navigation des solutions */}
            <section className="py-6 bg-gray-50 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex overflow-x-auto space-x-2 pb-1">
                        {solutions.map((solution, index) => {
                            const Icon = solution.icon
                            return (
                                <button key={index} onClick={() => setActiveSolution(index)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 shrink-0 ${
                                            activeSolution === index ? 'bg-white shadow-lg border border-gray-200 text-[#1A237E]' : 'text-gray-600 hover:text-[#5E35B1] hover:bg-white/50'
                                        }`}>
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-lg flex items-center justify-center shrink-0">
                                        <Icon size={16} className="text-white"/>
                                    </div>
                                    <span>{solution.title.split('–')[0].trim()}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Détail de la solution active */}
            <section className="py-6 lg:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1 space-y-4">
                            {solutions.map((solution, index) => {
                                const Icon = solution.icon
                                return (
                                    <div key={index} onClick={() => setActiveSolution(index)}
                                         className={`p-6 rounded-2xl cursor-pointer transition-all duration-500 transform ${
                                             activeSolution === index ? 'bg-gradient-to-r from-[#1A237E] to-[#5E35B1] text-white shadow-2xl scale-105' : 'bg-white border border-gray-200 hover:border-[#5E35B1] hover:shadow-lg'
                                         }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-xl flex items-center justify-center shrink-0 ${activeSolution === index ? 'scale-110' : ''} transition-transform duration-300`}>
                                                <Icon size={20} className="text-white"/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-lg ${activeSolution === index ? 'text-white' : 'text-gray-900'}`}>{solution.title}</h3>
                                                <p className={`text-sm ${activeSolution === index ? 'text-blue-100' : 'text-gray-600'} mt-1`}>{solution.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-2xl flex items-center justify-center shrink-0">
                                        <ActiveIcon size={32} className="text-white"/>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{solutions[activeSolution].title}</h2>
                                        <p className="text-lg text-gray-600 mt-2">{solutions[activeSolution].description}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#00BCD4] rounded-full"/> Fonctionnalités Principales
                                        </h3>
                                        <ul className="space-y-3">
                                            {solutions[activeSolution].features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-3 text-gray-700">
                                                    <Check size={16} className="text-[#00BCD4] shrink-0"/> <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#5E35B1] rounded-full"/> Avantages Clés
                                        </h3>
                                        <ul className="space-y-3">
                                            {solutions[activeSolution].advantages.map((advantage, index) => (
                                                <li key={index} className="flex items-center gap-3 text-gray-700">
                                                    <Zap size={16} className="text-[#5E35B1] shrink-0"/> <span>{advantage}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Écosystème */}
            <section className="py-8 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Un Écosystème <span className="text-[#1A237E]">Complet</span>
                    </h2>
                    <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                        Grâce à notre plateforme connectée, vous gérez vos réservations, vos clients, vos partenaires et votre marketing depuis un seul espace.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {[
                            { label: 'Moins de perte de temps', icon: RefreshCw, color: 'from-[#00BCD4] to-[#5E35B1]' },
                            { label: "Plus d'efficacité", icon: Zap, color: 'from-[#5E35B1] to-[#1A237E]' },
                            { label: 'Meilleure visibilité', icon: BarChart, color: 'from-[#00BCD4] to-[#1A237E]' },
                            { label: 'Plus de revenus', icon: Users, color: 'from-[#5E35B1] to-[#00BCD4]' },
                        ].map((item, index) => {
                            const Icon = item.icon
                            return (
                                <div key={index} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
                                    <div className={`w-16 h-16 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r ${item.color} text-white mx-auto`}>
                                        <Icon size={28}/>
                                    </div>
                                    <p className="text-gray-800 font-semibold">{item.label}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA final */}
            <section className="py-10 bg-gradient-to-r from-[#1A237E] to-[#5E35B1]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Prêt à digitaliser votre activité ?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Rejoignez les centaines d'établissements qui ont déjà transformé leur gestion avec LuxTech.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => setIsDemoModalOpen(true)}
                                className="bg-white text-[#1A237E] px-8 py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                            <Zap size={16}/> <span>Demander une démo</span>
                        </button>
                        <button onClick={() => navigate('/pricing')}
                                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#1A237E] transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                            <span>Voir les tarifs</span>
                        </button>
                    </div>
                </div>
            </section>

            <FooterSection/>
        </div>
    )
}

export default SolutionsPage
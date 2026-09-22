import { useState, useEffect } from 'react'
import { Rocket, GraduationCap, RefreshCw, Shield, Check, X, Send } from 'lucide-react'
import Navbar from './components/Navbar'
import FooterSection from './components/FooterSection'

const DemoModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ nom: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    useEffect(() => { if (isOpen) { setSent(false); setForm({ nom: '', email: '', message: '' }) } }, [isOpen])

    const handleSubmit = (e) => { e.preventDefault(); setSent(true) }

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

const TarifsPage = ({ onLoginClick, onRegisterClick }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [isAnnual, setIsAnnual] = useState(true)
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

    useEffect(() => { setIsVisible(true) }, [])

    const plansData = {
        monthly: [{
            title: 'Pro', price: 155, period: 'mois', description: 'Optimisé pour la croissance',
            billingInfo: 'facturé mensuellement',
            features: ['Outils avancés', 'Automatisations', 'Reporting', 'Support prioritaire'],
            cta: 'Demander une démo',
        }],
        annual: [{
            title: 'Pro', price: 129, period: 'mois', badge: 'Annuel -17%', description: 'Optimisé pour la croissance',
            billingInfo: 'facturé annuellement',
            features: ['Outils avancés', 'Automatisations', 'Reporting', 'Support prioritaire'],
            cta: 'Demander une démo',
        }],
    }

    const includedFeatures = [
        { icon: Rocket, title: 'Onboarding & configuration' },
        { icon: GraduationCap, title: 'Formation' },
        { icon: RefreshCw, title: 'Support' },
        { icon: Shield, title: 'Sécurité & accès' },
        { icon: RefreshCw, title: 'Mises à jour' },
    ]

    const comparisonRows = [
        { label: 'PMS' }, { label: 'Gestionnaire de canaux' }, { label: 'TAMS' },
        { label: 'CRM Tourisme' }, { label: 'Outils Marketing' }, { label: 'Support' },
        { label: 'Accès Multi-établissements' },
    ]

    const plans = isAnnual ? plansData.annual : plansData.monthly

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick}/>
            <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)}/>

            {/* Hero */}
            <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-28 bg-gradient-to-br from-[#0F1A2F] via-[#1A237E] to-[#0F172A] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-[#00BCD4] rounded-full mix-blend-screen filter blur-3xl"/>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5E35B1] rounded-full mix-blend-screen filter blur-3xl"/>
                </div>
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6">
                            <span className="text-white text-sm font-medium">Tarifs</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Tarifs <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">Flexibles</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Activez rapidement, évoluez selon vos besoins avec notre solution tout-en-un.
                        </p>
                    </div>
                </div>
            </section>

            {/* Plan */}
            <section className="py-12">
                <div className="flex items-center justify-center gap-6 mb-6 flex-wrap px-4">
                    <span className={`text-lg font-semibold transition-colors duration-300 ${!isAnnual ? 'text-[#1A237E]' : 'text-gray-500'}`}>Mensuel</span>
                    <button onClick={() => setIsAnnual(!isAnnual)}
                            className="relative w-20 h-10 bg-gray-200 rounded-full border border-gray-300 p-1 flex items-center cursor-pointer hover:shadow-lg transition-shadow duration-300">
                        <div className={`w-8 h-8 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isAnnual ? 'translate-x-10' : 'translate-x-0'}`}/>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-semibold transition-colors duration-300 ${isAnnual ? 'text-[#1A237E]' : 'text-gray-500'}`}>Annuel</span>
                        <span className="bg-green-500 text-white px-3 py-2 rounded-full text-md font-bold shadow-md">-17% (2 mois offerts)</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center">
                        {plans.map((plan, index) => (
                            <div key={index} className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-2 border-[#00BCD4]/20 max-w-lg w-full transform transition-all hover:scale-[1.02] duration-500">
                                <div className="text-center mb-8">
                                    <h3 className="text-5xl font-black text-gray-900 mb-4">{plan.title}</h3>
                                    <p className="text-gray-500 font-medium mb-8 italic">"{plan.description}"</p>
                                    <div className="flex items-baseline justify-center gap-2 mb-2 flex-wrap">
                                        <span className="text-gray-400 text-xl font-medium">À partir de</span>
                                        <span className="text-6xl sm:text-7xl font-black text-[#1A237E] tracking-tighter">{plan.price} MAD</span>
                                        <span className="text-gray-400 text-2xl">/{plan.period}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{plan.billingInfo}</p>
                                </div>
                                <div className="space-y-4 mb-10 bg-gray-50 p-6 rounded-3xl">
                                    {plan.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-4">
                                            <div className="bg-[#00BCD4] rounded-full p-1 shrink-0"><Check size={14} className="text-white"/></div>
                                            <span className="text-gray-700 font-semibold">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setIsDemoModalOpen(true)}
                                        className="w-full py-5 rounded-2xl font-bold text-white text-xl bg-gradient-to-r from-[#00BCD4] via-[#1A237E] to-[#5E35B1] hover:shadow-[0_10px_30px_rgba(26,35,126,0.3)] transition-all flex items-center justify-center gap-3">
                                    <span>{plan.cta}</span> <Rocket size={24}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ce qui est inclus */}
            <section className="py-10 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Ce qui est <span className="text-[#1A237E]">inclus</span></h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        {includedFeatures.map((feat, i) => {
                            const Icon = feat.icon
                            return (
                                <div key={i} className="flex flex-col items-center text-center group">
                                    <div className="w-16 h-16 bg-white shadow-lg rounded-2xl flex items-center justify-center mb-4 border border-gray-100 group-hover:border-[#00BCD4] transition-colors duration-300">
                                        <Icon className="text-[#1A237E]" size={28}/>
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm px-2 leading-tight">{feat.title}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Tableau comparatif */}
            <section className="pb-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gradient-to-r from-[#0F1A2F] to-[#1A237E] text-white">
                                <th className="p-6 text-xl font-bold">Fonctionnalités</th>
                                <th className="p-6 text-center text-xl font-bold">
                                    <div className="flex flex-col items-center">
                                        <span>Pro</span>
                                        <span className="text-xs bg-[#00BCD4] px-2 py-0.5 rounded text-white mt-1">Recommandé</span>
                                    </div>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {comparisonRows.map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                    <td className="p-6 font-semibold text-gray-700 border-b border-gray-100">{row.label}</td>
                                    <td className="p-6 text-center border-b border-gray-100">
                                        <div className="flex justify-center">
                                            <Check className="text-green-500 bg-green-50 rounded-full p-1" size={24}/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <FooterSection/>
        </div>
    )
}

export default TarifsPage
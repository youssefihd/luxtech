import { useState } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'

const FAQ_DATA = [
    { question: 'Comment fonctionne le paiement en ligne ?', answer: "La plateforme peut intégrer des passerelles de paiement sécurisées selon les moyens de paiement disponibles pour votre activité.", category: 'Paiements' },
    { question: 'Comment sont calculées les commissions ?', answer: 'Les règles de commission peuvent être configurées selon votre modèle commercial et suivies dans les rapports.', category: 'Commissions' },
    { question: 'Puis-je annuler mon abonnement ?', answer: "Les modalités d'annulation dépendent de votre contrat et de la formule souscrite. Contactez-nous pour connaître les conditions applicables.", category: 'Abonnement' },
    { question: 'La plateforme est-elle conforme RGPD ?', answer: "LuxTech peut être configuré avec des principes de protection des données et des contrôles d'accès adaptés. Les modalités exactes dépendent de votre environnement.", category: 'Sécurité' },
    { question: "Comment fonctionne l'intégration ?", answer: "Des API et mécanismes d'intégration permettent de connecter LuxTech à votre environnement existant. Notre équipe peut vous accompagner sur le périmètre technique.", category: 'Technique' },
    { question: 'Quel support technique proposez-vous ?', answer: "Le support accompagne les équipes dans l'utilisation de la plateforme et le traitement des demandes liées au produit.", category: 'Support' },
]

const CATEGORIES = ['Toutes', 'Paiements', 'Commissions', 'Abonnement', 'Sécurité', 'Technique', 'Support']

const FAQSection = ({ onLoginClick }) => {
    const [openIndex, setOpenIndex] = useState(null)
    const [activeCategory, setActiveCategory] = useState('Toutes')
    const navigate = useNavigate()

    const filtered = activeCategory === 'Toutes'
        ? FAQ_DATA
        : FAQ_DATA.filter(item => item.category === activeCategory)

    return (
        <section className="bg-white border-t border-slate-100">
            <SectionContainer py="py-20 lg:py-28">
                <ContentWrapper maxWidth="max-w-5xl">
                    <SectionHeader
                        title="Questions"
                        highlightText="fréquentes"
                        description="Les réponses essentielles avant de commencer."
                    />

                    <AnimatedElement animation="fade-up">
                        <div className="flex flex-wrap gap-2 mb-10 border-b border-slate-200 pb-5">
                            {CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category)
                                        setOpenIndex(null)
                                    }}
                                    className={`px-3.5 py-2 text-xs font-semibold border transition ${
                                        activeCategory === category
                                            ? 'bg-[#172B63] border-[#172B63] text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-[#20BFD3]'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </AnimatedElement>

                    <div className="divide-y divide-slate-200 border-y border-slate-200">
                        {filtered.map((item, index) => {
                            const open = openIndex === index
                            return (
                                <AnimatedElement key={`${activeCategory}-${item.question}`} animation="fade-up" delay={index * 50}>
                                    <div>
                                        <button
                                            onClick={() => setOpenIndex(open ? null : index)}
                                            className="w-full py-6 flex items-start gap-5 text-left group"
                                        >
                                            <span className={`w-7 h-7 shrink-0 flex items-center justify-center text-xs font-bold transition ${open ? 'bg-[#20BFD3] text-[#172B63]' : 'bg-slate-100 text-slate-500'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className="flex-1">
                                                <span className={`block text-base sm:text-lg font-semibold ${open ? 'text-[#1677C8]' : 'text-slate-900 group-hover:text-[#1677C8]'} transition`}>
                                                    {item.question}
                                                </span>
                                                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-slate-400">{item.category}</span>
                                            </span>
                                            <ChevronDown size={19} className={`text-slate-400 mt-1 transition-transform ${open ? 'rotate-180 text-[#1677C8]' : ''}`} />
                                        </button>

                                        {open && (
                                            <div className="pb-6 pl-12 pr-8">
                                                <p className="text-sm leading-7 text-slate-600 max-w-3xl">{item.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                </AnimatedElement>
                            )
                        })}
                    </div>

                    <AnimatedElement animation="fade-up" delay={250}>
                        <div className="mt-14 bg-[#172B63] px-7 py-8 sm:px-10 sm:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-7">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Besoin d'aide ?</p>
                                <h3 className="text-xl sm:text-2xl font-semibold text-white mt-2">Parlez directement à notre équipe.</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={onLoginClick} className="bg-white text-[#172B63] px-5 py-3 text-sm font-semibold hover:bg-cyan-50 transition">
                                    Contacter le support
                                </button>
                                <button onClick={() => navigate('/documentation')} className="border border-white/30 text-white px-5 py-3 text-sm font-semibold hover:border-[#65D1DF] hover:text-[#65D1DF] transition flex items-center gap-2">
                                    Documentation <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    </AnimatedElement>
                </ContentWrapper>
            </SectionContainer>
        </section>
    )
}

export default FAQSection

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'

const FAQ_DATA = [
    { question: 'Comment fonctionne le paiement en ligne ?', answer: "Notre plateforme utilise des passerelles de paiement sécurisées PCI DSS. Les paiements sont chiffrés end-to-end et supportent cartes de crédit, virements bancaires et portefeuilles électroniques.", category: 'Paiements' },
    { question: 'Comment sont calculées les commissions ?', answer: 'Les commissions sont calculées automatiquement selon vos règles : taux fixes, pourcentages variables ou modèles hybrides, avec rapports détaillés.', category: 'Commissions' },
    { question: 'Puis-je annuler mon abonnement ?', answer: "Oui. L'annulation est possible à tout moment depuis votre tableau de bord, sans frais, avec accès conservé jusqu'à la fin de la période en cours.", category: 'Abonnement' },
    { question: 'La plateforme est-elle conforme RGPD ?', answer: "Oui. LuxTech applique le RGPD avec privacy by design, DPA et droit à l'effacement. Les données sont chiffrées et hébergées dans l'UE.", category: 'Sécurité' },
    { question: "Comment fonctionne l'intégration ?", answer: "API REST complète, webhooks et connecteurs pré-construits. Notre équipe technique vous accompagne durant toute la phase d'intégration.", category: 'Technique' },
    { question: 'Quel support technique proposez-vous ?', answer: 'Support 24/7 avec SLA clair : urgences < 15 min, incidents majeurs < 2h, demandes standards < 24h.', category: 'Support' },
]

const CATEGORIES = ['Toutes', 'Paiements', 'Commissions', 'Abonnement', 'Sécurité', 'Technique', 'Support']

const FAQSection = ({ onLoginClick }) => {
    const [openIndex, setOpenIndex] = useState(null)
    const [activeCategory, setActiveCategory] = useState('Toutes')
    const navigate = useNavigate()

    const filteredFaq = activeCategory === 'Toutes' ? FAQ_DATA : FAQ_DATA.filter(item => item.category === activeCategory)

    return (
        <SectionContainer withGradientBlobs>
            <ContentWrapper>
                <SectionHeader title="Questions" highlightText="fréquentes"
                               description="Trouvez rapidement des réponses à vos questions les plus courantes."/>

                <AnimatedElement animation="fade-up">
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {CATEGORIES.map((category) => (
                            <button key={category} onClick={() => { setActiveCategory(category); setOpenIndex(null) }}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                        activeCategory === category ? 'bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                {category}
                            </button>
                        ))}
                    </div>
                </AnimatedElement>

                <div className="space-y-4 mb-14">
                    {filteredFaq.map((item, index) => (
                        <AnimatedElement key={index} animation="fade-up" delay={index * 80}>
                            <div className={`border rounded-2xl transition ${openIndex === index ? 'border-[#00BCD4] shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
                                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-start gap-4 p-6 text-left">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
                                        openIndex === index ? 'bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-semibold transition ${openIndex === index ? 'text-[#00BCD4]' : 'text-gray-900'}`}>{item.question}</h3>
                                        <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.category}</span>
                                    </div>
                                    <span className={`ml-4 transition-transform shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {openIndex === index && (
                                    <div className="px-6 pb-6 ml-12">
                                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        </AnimatedElement>
                    ))}
                </div>

                <AnimatedElement animation="fade-up" delay={300}>
                    <div className="bg-gradient-to-br from-[#00BCD4] to-[#5E35B1] rounded-3xl p-8 lg:p-12 text-white text-center">
                        <h3 className="text-2xl lg:text-3xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h3>
                        <p className="text-white/90 mb-6 max-w-2xl mx-auto">Notre équipe est disponible pour vous accompagner rapidement.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={onLoginClick} className="bg-white text-[#00BCD4] px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition">
                                Contacter le support
                            </button>
                            <button onClick={() => navigate('/documentation')} className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#00BCD4] transition">
                                Voir la documentation
                            </button>
                        </div>
                    </div>
                </AnimatedElement>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default FAQSection
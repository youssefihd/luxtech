import { useState } from 'react'
import { Send, Check } from 'lucide-react'
import { SectionContainer, ContentWrapper, SectionHeader, AnimatedElement } from './shared'

const ContactSection = () => {
    const [form, setForm] = useState({ nom: '', email: '', telephone: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setSent(true)
        setForm({ nom: '', email: '', telephone: '', message: '' })
        setTimeout(() => setSent(false), 5000)
    }

    const ic = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00BCD4] transition"

    return (
        <SectionContainer bgColor="bg-gradient-to-br from-gray-50 to-white" withGradientBlobs>
            <ContentWrapper maxWidth="max-w-6xl">
                <SectionHeader title="Prêt à" highlightText="commencer"
                               description="Discutons de votre projet et découvrez comment LuxTech peut transformer votre activité hôtelière."/>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
                    <AnimatedElement animation="fade-right">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900">Parlons de votre projet</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Notre équipe d'experts marocains vous accompagne dans la digitalisation de votre activité hôtelière, avec des solutions adaptées au marché local.
                            </p>
                            <div className="flex items-center gap-2 text-[#00BCD4] font-semibold">
                                <span className="w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse"/>
                                Réponse sous 24h garantie
                            </div>
                        </div>
                    </AnimatedElement>

                    <AnimatedElement animation="fade-left" delay={150}>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                            {sent ? (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                        <Check size={26} className="text-emerald-600"/>
                                    </div>
                                    <p className="font-bold text-gray-900 text-lg">Message envoyé !</p>
                                    <p className="text-gray-500 text-sm mt-1">Nous vous répondrons sous 24h.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <input required placeholder="Votre nom" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className={ic}/>
                                    <input required type="email" placeholder="Votre email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={ic}/>
                                    <input placeholder="Téléphone (optionnel)" value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} className={ic}/>
                                    <textarea required rows={4} placeholder="Votre message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className={ic}/>
                                    <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] hover:shadow-lg transition flex items-center justify-center gap-2">
                                        <Send size={16}/> Envoyer
                                    </button>
                                </form>
                            )}
                        </div>
                        <div className="mt-6 text-center text-gray-600">
                            Ou contactez-nous par{' '}
                            <a href="mailto:contact@luxtech.ma" className="text-[#00BCD4] font-semibold hover:underline">email</a>{' '}
                            ou{' '}
                            <a href="tel:+212500000000" className="text-[#00BCD4] font-semibold hover:underline">téléphone</a>
                        </div>
                    </AnimatedElement>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default ContactSection
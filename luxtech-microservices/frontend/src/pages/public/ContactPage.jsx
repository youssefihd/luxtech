import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Clock, CheckCircle, Send } from 'lucide-react'
import Navbar from './components/Navbar'
import FooterSection from './components/FooterSection'

const ContactPage = ({ onLoginClick, onRegisterClick }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => { setIsVisible(true) }, [])

    const contactInfo = [
        { icon: Mail, title: 'Email', content: 'contact@luxtech.ma', link: 'mailto:contact@luxtech.ma' },
        { icon: Phone, title: 'Téléphone', content: '+212 5 22 21 44 94', link: 'tel:+212522214494' },
        { icon: MapPin, title: 'Adresse', content: 'Bd Dammam, Technopark-Bureau 371, Casablanca, Maroc', link: 'https://maps.google.com/?q=Technopark+Casablanca' },
        { icon: Clock, title: 'Horaires', content: 'Lun - Ven: 9h00 - 17h00' },
    ]


    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1200))
        setIsSubmitted(true)
        setFormData({ name: '', email: '', company: '', phone: '', subject: '', message: '' })
        setIsSubmitting(false)
    }

    const ic = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00BCD4] transition"

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick}/>

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
                            <span className="text-white text-sm font-medium">Contact</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Prenons <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">Contact</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Prêt à transformer votre gestion hôtelière ? Contactez-nous pour une démonstration personnalisée.
                        </p>
                    </div>
                </div>
            </section>

            {/* Corps principal */}
            <section className="py-6 lg:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className={`space-y-8 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-100 shadow-xl">
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Discutons de votre projet</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    Notre équipe d'experts est là pour vous accompagner dans la digitalisation
                                    de votre activité hôtelière. Que vous soyez un petit hôtel indépendant ou
                                    une grande chaîne, nous avons la solution adaptée.
                                </p>
                                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                                    <CheckCircle size={20} className="text-green-500 shrink-0"/>
                                    <span className="text-green-800 font-semibold">Réponse sous 24h garantie</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Nos Coordonnées</h3>
                                <div className="space-y-4">
                                    {contactInfo.map((info, index) => {
                                        const Icon = info.icon
                                        return (
                                            <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#5E35B1] transition-all duration-300 transform hover:-translate-y-1">
                                                <div className="shrink-0 w-12 h-12 bg-gradient-to-r from-[#1A237E] to-[#5E35B1] rounded-xl flex items-center justify-center text-white">
                                                    <Icon size={20}/>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-gray-900 font-semibold mb-1">{info.title}</h4>
                                                    {info.link ? (
                                                        <a href={info.link} className="text-gray-600 hover:text-[#1A237E] transition-colors duration-300 break-words">{info.content}</a>
                                                    ) : (
                                                        <p className="text-gray-600">{info.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Suivez-nous</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['LinkedIn', 'Twitter'].map((name) => (
                                        <a key={name} href="#"
                                           className="flex items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-[#1A237E] hover:to-[#5E35B1] hover:text-white transition-all duration-300 font-medium">
                                            {name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
                                {isSubmitted ? (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={28} className="text-emerald-600"/>
                                        </div>
                                        <p className="font-bold text-gray-900 text-lg">Message envoyé !</p>
                                        <p className="text-gray-500 text-sm mt-1">Nous vous répondrons sous 24h.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input required name="name" placeholder="Votre nom" value={formData.name} onChange={handleInputChange} className={ic}/>
                                            <input required type="email" name="email" placeholder="Votre email" value={formData.email} onChange={handleInputChange} className={ic}/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input name="company" placeholder="Établissement" value={formData.company} onChange={handleInputChange} className={ic}/>
                                            <input name="phone" placeholder="Téléphone" value={formData.phone} onChange={handleInputChange} className={ic}/>
                                        </div>
                                        <input name="subject" placeholder="Sujet" value={formData.subject} onChange={handleInputChange} className={ic}/>
                                        <textarea required rows={5} name="message" placeholder="Votre message" value={formData.message} onChange={handleInputChange} className={ic}/>
                                        <button type="submit" disabled={isSubmitting}
                                                className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50">
                                            {isSubmitting ? 'Envoi en cours...' : <><Send size={16}/> Envoyer le message</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Localisation */}
            <section className="py-10 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                            Notre <span className="text-[#1A237E]">Localisation</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Situés au cœur de Technopark Casablanca, pôle d'innovation technologique du Maroc
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
                        <div className="rounded-2xl overflow-hidden h-96">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.987234902447!2d-7.632623924014922!3d33.58989164185715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d3731f922c01%3A0x1a5c7a5e4b13f9f7!2sTechnopark%20Casablanca!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma"
                                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade" title="Technopark Casablanca" className="rounded-xl"/>
                        </div>
                        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <MapPin size={20} className="text-[#1A237E]"/>
                                <div>
                                    <p className="font-semibold text-gray-900">Technopark Casablanca</p>
                                    <p className="text-gray-600 text-sm">Bd Dammam, Bureau 371</p>
                                </div>
                            </div>
                            <a href="https://maps.google.com/?q=Technopark+Casablanca" target="_blank" rel="noopener noreferrer"
                               className="bg-[#1A237E] text-white px-4 py-2 rounded-lg hover:bg-[#5E35B1] transition-colors duration-300 flex items-center gap-2">
                                <MapPin size={16}/> Voir sur Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <FooterSection/>
        </div>
    )
}

export default ContactPage
import React, { useState, useCallback } from 'react';
import { User, Mail, Building, Phone, Calendar, MessageCircle, Send, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

const ContactForm = ({ hotelId }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '',
    subject: 'information', message: '', hotel_id: hotelId || null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }, [error]);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) return 'Le nom est requis';
    if (!formData.email.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Email invalide';
    if (!formData.message.trim()) return 'Le message est requis';
    return null;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setIsSubmitting(true); setError(null);
    try {
      // Simulation d'envoi — à remplacer par votre API
      await new Promise(r => setTimeout(r, 1500));
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name:'', email:'', company:'', phone:'', subject:'information', message:'', hotel_id: hotelId || null });
      }, 3000);
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  if (isSubmitted) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center py-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Message envoyé !</h3>
          <p className="text-gray-600 mb-8">Nous vous recontacterons sous 24h. Merci pour votre intérêt.</p>
          <button onClick={() => setIsSubmitted(false)}
                  className="bg-linear-to-r from-[#1A237E] to-[#5E35B1] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 mx-auto">
            Nouveau message <ArrowRight size={16} />
          </button>
        </div>
    );
  }

  return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                       placeholder="Votre nom"
                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A237E] outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email professionnel *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                       placeholder="email@entreprise.com"
                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A237E] outline-none transition-all" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Entreprise</label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="company" value={formData.company} onChange={handleInputChange}
                       placeholder="Nom de l'entreprise"
                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A237E] outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                       placeholder="+212 ..."
                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A237E] outline-none transition-all" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Type de demande *</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select name="subject" value={formData.subject} onChange={handleInputChange} required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A237E] outline-none transition-all appearance-none bg-white">
                <option value="information">Demande d'information</option>
                <option value="demo">Demande de démo</option>
                <option value="partenariat">Partenariat</option>
                <option value="support">Support technique</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Message *</label>
            <div className="relative">
              <MessageCircle size={18} className="absolute left-3 top-4 text-gray-400" />
              <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5}
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A237E] outline-none transition-all resize-none" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-linear-to-r from-[#1A237E] to-[#5E35B1] text-white hover:shadow-xl hover:scale-[1.02]'
                  }`}>
            {isSubmitting
                ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi...</>
                : <><Send size={18} /> Envoyer le message</>
            }
          </button>
          <p className="text-gray-400 text-xs text-center">Soumis selon notre politique de confidentialité.</p>
        </form>
      </div>
  );
};

export default ContactForm;
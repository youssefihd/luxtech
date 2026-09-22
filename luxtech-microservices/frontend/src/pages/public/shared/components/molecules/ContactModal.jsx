import React from 'react';
import { X } from 'lucide-react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ContactForm from '../organisms/ContactForm.jsx'; // Ton composant extrait précédemment

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel coulissant */}
      <div className={`relative w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header du Modal */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Demander une démo</h2>
              <p className="text-sm text-gray-500">Remplissez le formulaire pour commencer.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Corps du Modal avec le formulaire */}
          <div className="flex-1 overflow-y-auto p-2">
            <GoogleReCaptchaProvider reCaptchaKey="6LdqRkQsAAAAAH1i86g4ahMrl-bczrhf775vb-Qg">
              <ContactForm />
            </GoogleReCaptchaProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
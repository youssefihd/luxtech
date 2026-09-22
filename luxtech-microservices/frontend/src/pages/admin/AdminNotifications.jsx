import { useState } from 'react'
import {
    Bell, Mail, MessageSquare, Smartphone, Check,
    RefreshCw, Save, AlertTriangle, Users, Building2,
    CheckCircle, XCircle, ShieldOff, Clock, Info
} from 'lucide-react'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? '' : 'bg-gray-200'}`}
            style={checked ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
            checked ? 'left-6' : 'left-1'
        }`}/>
    </button>
)

const EVENTS = [
    {
        category: 'Inscriptions & Validations',
        icon: Users,
        color: `linear-gradient(135deg, ${CYAN}, ${NAVY})`,
        items: [
            { key: 'new_registration',    label: 'Nouvelle inscription partenaire',     desc: 'Notifier quand un nouveau partenaire s\'inscrit' },
            { key: 'pending_approval',    label: 'Demande en attente de validation',    desc: 'Rappel quotidien des demandes non traitées' },
            { key: 'long_pending',        label: 'Demande en attente +7 jours',         desc: 'Alerte urgente pour les demandes critiques' },
            { key: 'approved',            label: 'Partenaire approuvé',                 desc: 'Confirmation d\'approbation au partenaire' },
            { key: 'rejected',            label: 'Partenaire rejeté',                   desc: 'Notification de rejet avec motif au partenaire' },
        ]
    },
    {
        category: 'Comptes & Accès',
        icon: ShieldOff,
        color: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)`,
        items: [
            { key: 'account_suspended',   label: 'Compte suspendu',                    desc: 'Notifier l\'admin et le partenaire' },
            { key: 'account_reactivated', label: 'Compte réactivé',                    desc: 'Confirmation de réactivation' },
            { key: 'login_admin',         label: 'Connexion administrateur',            desc: 'Alerte à chaque connexion admin' },
            { key: 'password_change',     label: 'Changement de mot de passe',         desc: 'Notifier le compte concerné' },
        ]
    },
    {
        category: 'Dossiers & Documents',
        icon: Building2,
        color: `linear-gradient(135deg, ${NAVY}, ${PURPLE})`,
        items: [
            { key: 'dossier_submitted',   label: 'Dossier complet soumis',             desc: 'Notifier l\'admin à chaque nouveau dossier' },
            { key: 'dossier_incomplete',  label: 'Dossier incomplet après 48h',        desc: 'Rappel au partenaire de compléter son dossier' },
            { key: 'document_uploaded',   label: 'Document uploadé',                   desc: 'Confirmer la réception du document' },
        ]
    },
]

const CHANNELS = [
    { key: 'email',  label: 'Email',           icon: Mail,          desc: 'Notifications par email' },
    { key: 'sms',    label: 'SMS',             icon: Smartphone,    desc: 'Notifications par SMS' },
    { key: 'push',   label: 'Notifications push', icon: Bell,       desc: 'Notifications dans l\'application' },
    { key: 'intern', label: 'Messagerie interne', icon: MessageSquare, desc: 'Messagerie interne LuxTech' },
]

export default function AdminNotifications() {
    const [toast, setToast] = useState(null)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('evenements')

    // État des canaux
    const [channels, setChannels] = useState({
        email: true, sms: false, push: true, intern: true
    })

    // État des événements par canal
    const [eventSettings, setEventSettings] = useState(
        EVENTS.flatMap(cat => cat.items).reduce((acc, item) => ({
            ...acc,
            [item.key]: { email: true, sms: false, push: true, intern: false }
        }), {})
    )

    // Paramètres email
    const [emailSettings, setEmailSettings] = useState({
        expediteur: 'noreply@luxtech.ma',
        nomExpediteur: 'LuxTech Platform',
        signature: 'L\'équipe LuxTech',
        frequenceResume: 'daily',
    })

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleSave = async () => {
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))
        setSaving(false)
        showToast('Paramètres de notifications sauvegardés !')
    }

    const toggleEvent = (eventKey, channel) => {
        setEventSettings(prev => ({
            ...prev,
            [eventKey]: { ...prev[eventKey], [channel]: !prev[eventKey][channel] }
        }))
    }

    const toggleAllChannel = (channel) => {
        const allOn = EVENTS.flatMap(c => c.items).every(i => eventSettings[i.key]?.[channel])
        setEventSettings(prev => {
            const next = { ...prev }
            EVENTS.flatMap(c => c.items).forEach(i => {
                next[i.key] = { ...next[i.key], [channel]: !allOn }
            })
            return next
        })
    }

    const tabs = [
        { key: 'evenements', label: 'Événements', icon: Bell },
        { key: 'canaux',     label: 'Canaux',     icon: Mail },
        { key: 'email',      label: 'Email',      icon: MessageSquare },
    ]

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Configurez les alertes et notifications de la plateforme</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                    {saving ? <RefreshCw size={15} className="animate-spin"/> : <Save size={15}/>}
                    Sauvegarder
                </button>
            </div>

            {/* Onglets */}
            <div className="flex gap-1 border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const active = activeTab === tab.key
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                                    active ? 'border-[#66CAD8] text-[#1D2252]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}>
                            <Icon size={15}/> {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* ── Onglet Événements ── */}
            {activeTab === 'evenements' && (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
                        <p className="text-sm text-blue-700">
                            Activez ou désactivez les notifications pour chaque événement et chaque canal de communication.
                        </p>
                    </div>

                    {/* Header colonnes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center px-5 py-3 border-b border-gray-100 bg-gray-50">
                            <span className="flex-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Événement</span>
                            {CHANNELS.map(ch => (
                                <div key={ch.key} className="w-20 text-center">
                                    <button onClick={() => toggleAllChannel(ch.key)}
                                            className="flex flex-col items-center gap-1 hover:opacity-70 transition mx-auto">
                                        <ch.icon size={14} style={{ color: CYAN }}/>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{ch.label}</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {EVENTS.map((cat, ci) => {
                            const CatIcon = cat.icon
                            return (
                                <div key={ci}>
                                    <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-y border-gray-100">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                                             style={{ background: cat.color }}>
                                            <CatIcon size={13}/>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{cat.category}</span>
                                    </div>
                                    {cat.items.map((item, ii) => (
                                        <div key={ii} className="flex items-center px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition last:border-0">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                            </div>
                                            {CHANNELS.map(ch => (
                                                <div key={ch.key} className="w-20 flex justify-center">
                                                    <Toggle
                                                        checked={eventSettings[item.key]?.[ch.key] && channels[ch.key]}
                                                        onChange={() => toggleEvent(item.key, ch.key)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Onglet Canaux ── */}
            {activeTab === 'canaux' && (
                <div className="space-y-4">
                    {CHANNELS.map(ch => {
                        const Icon = ch.icon
                        return (
                            <div key={ch.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                             style={{ background: channels[ch.key] ? `linear-gradient(135deg, ${CYAN}, ${NAVY})` : '#e5e7eb' }}>
                                            <Icon size={20} className={channels[ch.key] ? 'text-white' : 'text-gray-400'}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{ch.label}</p>
                                            <p className="text-sm text-gray-500">{ch.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-500">
                                            {channels[ch.key] ? 'Activé' : 'Désactivé'}
                                        </span>
                                        <Toggle checked={channels[ch.key]}
                                                onChange={v => setChannels(p => ({ ...p, [ch.key]: v }))}/>
                                    </div>
                                </div>
                                {channels[ch.key] && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle size={14} style={{ color: CYAN }}/>
                                            <span>
                                                {EVENTS.flatMap(c => c.items).filter(i => eventSettings[i.key]?.[ch.key]).length} événement(s) configuré(s) sur ce canal
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Onglet Email ── */}
            {activeTab === 'email' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail size={16} style={{ color: CYAN }}/> Paramètres d'envoi
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse expéditeur</label>
                                    <input type="email" value={emailSettings.expediteur}
                                           onChange={e => setEmailSettings(p => ({ ...p, expediteur: e.target.value }))}
                                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
                                    <input type="text" value={emailSettings.nomExpediteur}
                                           onChange={e => setEmailSettings(p => ({ ...p, nomExpediteur: e.target.value }))}
                                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Signature email</label>
                                <input type="text" value={emailSettings.signature}
                                       onChange={e => setEmailSettings(p => ({ ...p, signature: e.target.value }))}
                                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence du résumé</label>
                                <select value={emailSettings.frequenceResume}
                                        onChange={e => setEmailSettings(p => ({ ...p, frequenceResume: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm bg-white">
                                    <option value="realtime">Temps réel</option>
                                    <option value="hourly">Toutes les heures</option>
                                    <option value="daily">Quotidien</option>
                                    <option value="weekly">Hebdomadaire</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Prévisualisation */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell size={16} style={{ color: CYAN }}/> Prévisualisation email
                        </h3>
                        <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 text-white"
                                 style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                                <p className="font-bold text-lg">LUXTECH</p>
                                <p className="text-white/70 text-sm mt-0.5">Plateforme de gestion hôtelière</p>
                            </div>
                            <div className="p-6">
                                <p className="font-bold text-gray-900 text-lg mb-3">Nouvelle inscription partenaire</p>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    Bonjour,<br/><br/>
                                    Un nouveau partenaire vient de s'inscrire sur la plateforme LuxTech et attend votre validation.
                                    Veuillez examiner son dossier dès que possible.
                                </p>
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Détails du partenaire</p>
                                    <p className="text-sm text-gray-700"><strong>Nom :</strong> Mohammed Alami</p>
                                    <p className="text-sm text-gray-700"><strong>Établissement :</strong> Riad Atlas Marrakech</p>
                                    <p className="text-sm text-gray-700"><strong>Type :</strong> Riad</p>
                                    <p className="text-sm text-gray-700"><strong>Ville :</strong> Marrakech</p>
                                </div>
                                <div className="text-center">
                                    <div className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                        Voir la demande
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400">{emailSettings.signature} · {emailSettings.expediteur}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
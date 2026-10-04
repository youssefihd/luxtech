import { useState, useEffect, useCallback } from 'react'
import {
    Zap, Check, RefreshCw, AlertTriangle, Copy, ExternalLink, Power,
    Type, Palette, Settings, Layout, Sparkles, Eye
} from 'lucide-react'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const DEFAULT_CONFIG = {
    primaryColor: NAVY,
    secondaryColor: CYAN,
    accentColor: PURPLE,
    fontFamily: 'Poppins, sans-serif',
    heroTitle: 'Réservez votre séjour',
    heroSubtitle: 'Meilleur tarif garanti en direct.',
    backgroundPattern: 'soft-gradient',
    ctaLabel: 'Rechercher',
    heroHeight: 'immersive',
    showAboutSection: true,
    showAmenitiesSection: true,
    showRoomsSection: true,
    showContactSection: true,
}

const FONT_OPTIONS = [
    { value: 'Poppins, sans-serif', label: 'Poppins (Moderne)' },
    { value: 'DM Sans, sans-serif', label: 'DM Sans (Épuré)' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat (Affirmé)' },
    { value: 'Playfair Display, serif', label: 'Playfair (Élégant)' },
]

const PATTERN_OPTIONS = [
    { value: 'soft-gradient', label: '💎 Dégradé doux' },
    { value: 'mesh', label: '🎨 Mesh Gradient' },
    { value: 'minimal', label: '✨ Minimal' },
]

const HERO_HEIGHT_OPTIONS = [
    { value: 'compact', label: 'Compact (350px)' },
    { value: 'balanced', label: 'Équilibré (450px)' },
    { value: 'immersive', label: 'Immersif (600px)' },
]

const SectionCard = ({ id, icon: Icon, title, subtitle, iconBg, iconColor, children }) => (
    <div id={id} className="scroll-mt-32 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="p-2.5 rounded-xl" style={{ background: iconBg }}>
                <Icon size={18} style={{ color: iconColor }}/>
            </div>
            <div>
                <h2 className="font-black text-gray-900">{title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
)

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <button type="button" onClick={() => onChange(!checked)}
                className="relative w-12 h-7 rounded-full transition-colors shrink-0"
                style={{ background: checked ? `linear-gradient(135deg, ${CYAN}, ${NAVY})` : '#e5e7eb' }}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
)

export default function HebergementBookingEngine() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [description, setDescription] = useState('')
    const [config, setConfig] = useState(DEFAULT_CONFIG)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = res?.data?.data
            setHebergement(h)
            setDescription(h?.bookingEngineDescription || '')
            if (h?.bookingPageConfig) {
                try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(h.bookingPageConfig) }) }
                catch { setConfig(DEFAULT_CONFIG) }
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const publicUrl = hebergement?.slug ? `${window.location.origin}/reserver/${hebergement.slug}` : null
    const publicPageAvailable = Boolean(publicUrl
        && hebergement?.isActive
        && hebergement?.status === 'APPROVED'
        && hebergement?.bookingEngineActif)
    const publicPageUnavailableReason = !hebergement?.isActive
        ? 'L’établissement est désactivé. Réactivez-le pour publier la page.'
        : hebergement?.status !== 'APPROVED'
            ? 'L’établissement doit être approuvé par un administrateur avant sa publication.'
            : !hebergement?.bookingEngineActif
                ? 'Activez le Booking Engine pour publier cette page.'
                : ''

    const setField = (field, value) => setConfig(p => ({ ...p, [field]: value }))

    const handleToggle = async () => {
        setSaving(true)
        try {
            const res = await hebergementAxios.patch(`/hebergement/hebergements/${hebergement.id}/booking-engine`, {
                actif: !hebergement.bookingEngineActif,
            })
            setHebergement(res.data?.data)
            showToast(res.data?.data?.bookingEngineActif ? 'Booking Engine activé !' : 'Booking Engine désactivé.')
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveDescription = async () => {
        setSaving(true)
        try {
            const res = await hebergementAxios.patch(`/hebergement/hebergements/${hebergement.id}/booking-engine`, { description })
            setHebergement(res.data?.data)
            showToast('Description enregistrée !')
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveConfig = async () => {
        setSaving(true)
        try {
            const res = await hebergementAxios.patch(`/hebergement/hebergements/${hebergement.id}/booking-page-config`, {
                bookingPageConfig: JSON.stringify(config),
            })
            setHebergement(res.data?.data)
            showToast('Design enregistré et publié !')
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleCopyLink = () => {
        if (!publicPageAvailable) return
        navigator.clipboard.writeText(publicUrl)
        showToast('Lien copié !')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/>
            </div>
        )
    }

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="space-y-5 max-w-5xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="sticky top-0 z-40 rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/15">
                            <Sparkles size={20} className="text-white"/>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Distribution</p>
                            <h1 className="text-xl font-black text-white">Booking Engine Designer</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {publicPageAvailable && (
                            <a href={publicUrl} target="_blank" rel="noreferrer"
                               className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20">
                                <Eye size={15}/> Aperçu
                            </a>
                        )}
                        <button onClick={handleSaveConfig} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg disabled:opacity-50"
                                style={{ color: NAVY }}>
                            {saving ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={16}/> Enregistrer</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Anchors rapides */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'designer-hero', label: 'Contenu Hero', icon: Type },
                    { id: 'designer-appearance', label: 'Apparence', icon: Palette },
                    { id: 'designer-advanced', label: 'Configuration', icon: Settings },
                    { id: 'designer-visibility', label: 'Sections', icon: Layout },
                ].map(item => {
                    const Icon = item.icon
                    return (
                        <button key={item.id} onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-600 hover:border-[#66CAD8] hover:text-[#1D2252] hover:bg-[#66CAD8]/5 transition">
                            <Icon size={14}/> {item.label}
                        </button>
                    )
                })}
            </div>

            {/* Activation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
                            hebergement?.bookingEngineActif ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                            <Power size={24} className={hebergement?.bookingEngineActif ? 'text-emerald-600' : 'text-gray-400'}/>
                        </div>
                        <div>
                            <p className="font-black text-gray-900">
                                {hebergement?.bookingEngineActif ? 'Booking Engine actif' : 'Booking Engine désactivé'}
                            </p>
                            <p className="text-sm text-gray-400">
                                {publicPageAvailable
                                    ? 'Les clients peuvent réserver directement en ligne'
                                    : hebergement?.bookingEngineActif
                                        ? 'Le moteur est activé, mais la page n’est pas encore publiée.'
                                        : 'Votre page est actuellement masquée'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleToggle} disabled={saving}
                            className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${hebergement?.bookingEngineActif ? '' : 'bg-gray-300'}`}
                            style={hebergement?.bookingEngineActif ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                        <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${hebergement?.bookingEngineActif ? 'translate-x-7' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </div>

            {publicUrl && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Lien public</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-mono text-gray-600 truncate">{publicUrl}</div>
                        <button onClick={handleCopyLink} disabled={!publicPageAvailable} title={publicPageAvailable ? 'Copier le lien public' : publicPageUnavailableReason} className="p-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8] hover:text-[#1D2252] transition shrink-0 disabled:cursor-not-allowed disabled:opacity-40"><Copy size={16}/></button>
                        {publicPageAvailable
                            ? <a href={publicUrl} target="_blank" rel="noreferrer" aria-label="Ouvrir la page publique" className="p-3 rounded-xl text-white transition hover:shadow-lg shrink-0" style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}><ExternalLink size={16}/></a>
                            : <button type="button" disabled title={publicPageUnavailableReason} aria-label={publicPageUnavailableReason} className="p-3 rounded-xl text-white shrink-0 opacity-40 cursor-not-allowed" style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}><ExternalLink size={16}/></button>}
                    </div>
                    {!publicPageAvailable && <p role="status" className="mt-3 text-sm text-amber-700">{publicPageUnavailableReason}</p>}
                </div>
            )}

            {/* Message de bienvenue */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Message de bienvenue</p>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                          placeholder="Ex: Bienvenue dans notre établissement..." className={ic}/>
                <button onClick={handleSaveDescription} disabled={saving}
                        className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:shadow-lg disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                    {saving ? <RefreshCw size={15} className="animate-spin"/> : <><Check size={15}/> Enregistrer</>}
                </button>
            </div>

            {/* Contenu Hero */}
            <SectionCard id="designer-hero" icon={Type} title="Contenu du Hero" subtitle="Titre, sous-titre et bouton principal" iconBg="#dbeafe" iconColor="#2563eb">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Titre principal</label>
                        <input value={config.heroTitle} onChange={e => setField('heroTitle', e.target.value)} className={ic}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Sous-titre</label>
                        <textarea rows={2} value={config.heroSubtitle} onChange={e => setField('heroSubtitle', e.target.value)} className={ic}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Texte du bouton</label>
                        <input value={config.ctaLabel} onChange={e => setField('ctaLabel', e.target.value)} className={ic}/>
                    </div>
                </div>
            </SectionCard>

            {/* Apparence */}
            <SectionCard id="designer-appearance" icon={Palette} title="Apparence" subtitle="Couleurs, typographie et design" iconBg="#f3e8ff" iconColor={PURPLE}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { key: 'primaryColor', label: 'Couleur primaire' },
                        { key: 'secondaryColor', label: 'Couleur secondaire' },
                        { key: 'accentColor', label: 'Couleur accent' },
                    ].map(c => (
                        <div key={c.key}>
                            <label className="block text-xs font-bold text-gray-500 mb-2">{c.label}</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={config[c.key]} onChange={e => setField(c.key, e.target.value)}
                                       className="h-12 w-14 rounded-xl border-2 border-gray-100 cursor-pointer"/>
                                <span className="text-xs font-mono text-gray-500">{config[c.key]}</span>
                            </div>
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Police</label>
                        <select value={config.fontFamily} onChange={e => setField('fontFamily', e.target.value)} className={ic}>
                            {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Fond du hero</label>
                        <select value={config.backgroundPattern} onChange={e => setField('backgroundPattern', e.target.value)} className={ic}>
                            {PATTERN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </SectionCard>

            {/* Configuration avancée */}
            <SectionCard id="designer-advanced" icon={Settings} title="Configuration avancée" subtitle="Hauteur du hero" iconBg="#fef3c7" iconColor="#d97706">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Hauteur du hero</label>
                    <select value={config.heroHeight} onChange={e => setField('heroHeight', e.target.value)} className={ic}>
                        {HERO_HEIGHT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </SectionCard>

            {/* Sections visibles */}
            <SectionCard id="designer-visibility" icon={Layout} title="Sections visibles" subtitle="Activez/désactivez les sections de la page" iconBg="#d1fae5" iconColor="#059669">
                <div className="space-y-2">
                    <Toggle label="Section À propos" checked={config.showAboutSection} onChange={v => setField('showAboutSection', v)}/>
                    <Toggle label="Section Équipements" checked={config.showAmenitiesSection} onChange={v => setField('showAmenitiesSection', v)}/>
                    <Toggle label="Section Chambres" checked={config.showRoomsSection} onChange={v => setField('showRoomsSection', v)}/>
                    <Toggle label="Section Contact" checked={config.showContactSection} onChange={v => setField('showContactSection', v)}/>
                </div>
            </SectionCard>

            <button onClick={handleSaveConfig} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                {saving ? <RefreshCw size={18} className="animate-spin"/> : <><Check size={18}/> Enregistrer et publier</>}
            </button>
        </div>
    )
}

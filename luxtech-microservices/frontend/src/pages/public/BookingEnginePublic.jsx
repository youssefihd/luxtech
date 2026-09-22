import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
    Home, Calendar, Users, Check, RefreshCw, AlertTriangle, Bed, X,
    ArrowLeft, PartyPopper, MapPin, Phone, Mail, Star, Wifi, Car,
    Coffee, Waves, Dumbbell, UtensilsCrossed, ChevronLeft, ChevronRight,
    Sparkles, ShieldCheck, Clock3, Loader, Plus, Minus, ArrowRight,
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios.js'

const NAVY = '#1D2252', CYAN = '#66CAD8', PURPLE = '#5D2E8B'
const DEFAULT_CONFIG = {
    primaryColor: NAVY, secondaryColor: CYAN, accentColor: PURPLE,
    fontFamily: 'Poppins, sans-serif',
    heroTitle: 'Réservez votre séjour', heroSubtitle: 'Meilleur tarif garanti en direct.',
    backgroundPattern: 'soft-gradient', ctaLabel: 'Rechercher', heroHeight: 'immersive',
    showAboutSection: true, showAmenitiesSection: true, showRoomsSection: true, showContactSection: true,
}
const HERO_HEIGHTS = { compact: 340, balanced: 440, immersive: 580 }
const AMENITY_ICONS = { wifi: Wifi, parking: Car, 'petit-déjeuner': Coffee, piscine: Waves, 'salle de sport': Dumbbell, restaurant: UtensilsCrossed }
const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const todayStr = () => new Date().toISOString().split('T')[0]

const getAmenityIcon = (label) => {
    const key = (label || '').toLowerCase().trim()
    for (const k in AMENITY_ICONS) if (key.includes(k)) return AMENITY_ICONS[k]
    return Sparkles
}

// ── Sélecteur de voyageurs ──────────────────────────────────
const TravelersSelector = ({ adultes, enfants, onChange, config }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen(v => !v)}
                    className="w-full flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-left focus:outline-none hover:border-gray-300 transition">
                <Users size={15} className="text-gray-400 shrink-0"/>
                <span className="text-gray-700 font-medium">{adultes} adulte{adultes > 1 ? 's' : ''}{enfants > 0 ? `, ${enfants} enfant${enfants > 1 ? 's' : ''}` : ''}</span>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}/>
                    <div className="absolute z-40 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 right-0">
                        {[{ label: 'Adultes', value: adultes, key: 'adultes', min: 1 }, { label: 'Enfants', value: enfants, key: 'enfants', min: 0 }].map(row => (
                            <div key={row.key} className="flex items-center justify-between py-2">
                                <span className="text-sm font-semibold text-gray-700">{row.label}</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => onChange(row.key, Math.max(row.min, row.value - 1))}
                                            className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-30"
                                            disabled={row.value <= row.min}><Minus size={12}/></button>
                                    <span className="w-5 text-center text-sm font-bold">{row.value}</span>
                                    <button type="button" onClick={() => onChange(row.key, row.value + 1)}
                                            className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition"
                                            style={{ borderColor: config.secondaryColor }}><Plus size={12}/></button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => setOpen(false)}
                                className="w-full mt-2 py-2 rounded-xl text-white text-sm font-bold"
                                style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>OK</button>
                    </div>
                </>
            )}
        </div>
    )
}
// ── Modal de réservation ────────────────────────────────────
const BookingModal = ({ isOpen, type, hebergement, dateArrivee, dateDepart, nbNuits, config, onClose, onSuccess }) => {
    const [form, setForm] = useState({ clientNom: '', clientPrenom: '', clientEmail: '', clientTelephone: '', clientNationalite: '', clientCinPasseport: '', nbAdultes: 2, nbEnfants: 0, notes: '' })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setForm({ clientNom: '', clientPrenom: '', clientEmail: '', clientTelephone: '', clientNationalite: '', clientCinPasseport: '', nbAdultes: 2, nbEnfants: 0, notes: '' })
        }
    }, [isOpen])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const handleSubmit = async () => {
        if (!form.clientNom.trim()) { setError('Le nom est obligatoire'); return }
        if (!form.clientEmail.trim()) { setError("L'email est obligatoire"); return }
        setProcessing(true)
        try {
            await bookingAxios.post('/booking/public/reserver', {
                hotelId: hebergement.id, chambreTypeId: type.chambreTypeId, dateArrivee, dateDepart,
                clientNom: form.clientNom.trim(), clientPrenom: form.clientPrenom || null,
                clientEmail: form.clientEmail.trim(), clientTelephone: form.clientTelephone || null,
                clientNationalite: form.clientNationalite || null, clientCinPasseport: form.clientCinPasseport || null,
                nbAdultes: Number(form.nbAdultes) || 1, nbEnfants: Number(form.nbEnfants) || 0, notes: form.notes || null,
            })
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réservation. Réessayez.')
        } finally { setProcessing(false) }
    }

    if (!isOpen || !type) return null
    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Réservation</p>
                            <h2 className="text-lg font-black text-white">{type.nom}</h2>
                            <p className="text-white/70 text-sm mt-1">{dateArrivee} → {dateDepart} · {nbNuits} nuit{nbNuits > 1 ? 's' : ''}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition shrink-0"><X size={18} className="text-white"/></button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 font-medium"><AlertTriangle size={14}/>{error}</div>}
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Nom *</label><input {...F('clientNom')} placeholder="Votre nom" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Prénom</label><input {...F('clientPrenom')} placeholder="Votre prénom" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Email *</label><input type="email" {...F('clientEmail')} placeholder="email@exemple.com" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Téléphone</label><input {...F('clientTelephone')} placeholder="+212 6XX XXXXXX" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Nationalité</label><input {...F('clientNationalite')} placeholder="Ex: Marocaine" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">CIN / Passeport</label><input {...F('clientCinPasseport')} placeholder="Ex: AB123456" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Adultes</label><input type="number" min="1" {...F('nbAdultes')} className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Enfants</label><input type="number" min="0" {...F('nbEnfants')} className={ic}/></div>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Demandes spéciales</label><textarea rows={2} {...F('notes')} placeholder="Optionnel..." className={ic}/></div>
                    <div className="rounded-2xl p-4 flex justify-between items-center" style={{ background: `${config.secondaryColor}15`, border: `1.5px solid ${config.secondaryColor}40` }}>
                        <span className="text-sm font-medium text-gray-600">Total estimé</span>
                        <span className="text-xl font-black" style={{ color: config.primaryColor }}>{fmt(type.prixBase * nbNuits)}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5"><ShieldCheck size={13}/> Votre demande sera confirmée par l'établissement sous peu.</p>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">Annuler</button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Confirmer la demande</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Galerie avec navigation ──────────────────────────────────
const Gallery = ({ photos, hotelName }) => {
    const [index, setIndex] = useState(0)
    const [lightbox, setLightbox] = useState(false)
    if (!photos || photos.length === 0) return null
    const next = () => setIndex(i => (i + 1) % photos.length)
    const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length)
    return (
        <>
            <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                <img src={photos[index].url} alt={hotelName} onClick={() => setLightbox(true)}
                     className="w-full h-72 sm:h-96 object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"/>
                {photos.length > 1 && (
                    <>
                        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition shadow"><ChevronLeft size={18}/></button>
                        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition shadow"><ChevronRight size={18}/></button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {photos.map((_, i) => (
                                <button key={i} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}/>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {lightbox && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
                    <button className="absolute top-5 right-5 text-white p-2"><X size={28}/></button>
                    <img src={photos[index].url} alt="" className="max-h-[85vh] max-w-full object-contain rounded-xl" onClick={e => e.stopPropagation()}/>
                    {photos.length > 1 && (
                        <>
                            <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-5 top-1/2 -translate-y-1/2 text-white p-3"><ChevronLeft size={32}/></button>
                            <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-5 top-1/2 -translate-y-1/2 text-white p-3"><ChevronRight size={32}/></button>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

// ── Calendrier personnalisé ──────────────────────────────────
const parseLocalDate = (s) => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const formatDateStr = (d) => { if (!d) return ''; const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${day}` }
const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const CustomCalendar = ({ selectedDate, minDate, onSelect, onClose, config }) => {
    const [currentMonth, setCurrentMonth] = useState(() => parseLocalDate(selectedDate) || parseLocalDate(minDate) || new Date())

    const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = (d) => { const day = new Date(d.getFullYear(), d.getMonth(), 1).getDay(); return day === 0 ? 6 : day - 1 }

    const handleDateClick = (day) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const min = minDate ? parseLocalDate(minDate) : null
        if (min && selected < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return
        onSelect(formatDateStr(selected))
        onClose()
    }
    const isDisabled = (day) => {
        if (!minDate) return false
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const min = parseLocalDate(minDate)
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()) < new Date(min.getFullYear(), min.getMonth(), min.getDate())
    }
    const isSelected = (day) => selectedDate && isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), parseLocalDate(selectedDate))
    const isToday = (day) => isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), new Date())

    const days = []
    for (let i = 0; i < firstDayOfMonth(currentMonth); i++) days.push(<div key={`e${i}`} className="h-10"/>)
    for (let day = 1; day <= daysInMonth(currentMonth); day++) {
        const disabled = isDisabled(day), selected = isSelected(day), today = isToday(day)
        days.push(
            <button key={day} type="button" disabled={disabled} onClick={() => !disabled && handleDateClick(day)}
                    className={`h-10 rounded-xl font-semibold text-sm transition-all ${disabled ? 'cursor-not-allowed opacity-30 text-gray-300' : 'cursor-pointer hover:scale-105 text-gray-700'} ${selected ? 'text-white scale-105 shadow-lg' : ''}`}
                    style={{
                        background: selected ? `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` : today ? `${config.secondaryColor}20` : 'transparent',
                        border: today && !selected ? `1.5px solid ${config.secondaryColor}` : '1px solid transparent',
                    }}>
                {day}
            </button>
        )
    }
    return (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-xl border border-gray-100 bg-white overflow-hidden">
            <div className="p-4 flex items-center justify-between text-white" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 rounded-lg hover:bg-white/20 transition"><ChevronLeft size={18}/></button>
                <span className="font-bold">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                <div className="flex gap-1">
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 rounded-lg hover:bg-white/20 transition"><ChevronRight size={18}/></button>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition"><X size={18}/></button>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">{DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-bold py-1" style={{ color: config.primaryColor }}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">{days}</div>
            </div>
            <div className="px-4 pb-4 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ border: `1.5px solid ${config.secondaryColor}` }}/> Aujourd'hui</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}/> Sélectionné</div>
            </div>
        </div>
    )
}
const DateInput = ({ label, value, minDate, onChange, config }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Calendar size={12}/> {label}</label>
            <button type="button" onClick={() => setOpen(v => !v)}
                    className="w-full flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-left hover:border-gray-300 transition">
                <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                    {value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choisir une date'}
                </span>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
                    <CustomCalendar selectedDate={value} minDate={minDate} onSelect={onChange} onClose={() => setOpen(false)} config={config}/>
                </>
            )}
        </div>
    )
}
// ── Sections personnalisées (CMS) ────────────────────────────
const CustomSection = ({ section, config }) => {
    const style = section.style || 'light'
    const alignment = section.alignment === 'center' ? 'text-center items-center' : 'text-left items-start'
    const variant = section.variant || 'cards'
    const sectionData = section.data || {}

    const styleMap = {
        light: { wrapper: 'bg-white border border-gray-100 shadow-sm', title: 'text-gray-900', text: 'text-gray-600' },
        accent: { wrapper: 'border border-transparent text-white shadow-xl', title: 'text-white', text: 'text-white/85', background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` },
        dark: { wrapper: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-lg', title: 'text-white', text: 'text-gray-300' },
    }
    const cs = styleMap[style] || styleMap.light
    const containerClass = variant === 'full-width' ? 'max-w-none rounded-none p-10 sm:p-16' : 'max-w-6xl rounded-3xl p-8 sm:p-12'

    const renderContent = () => {
        if (section.templateType === 'faq') {
            const items = Array.isArray(sectionData.items) ? sectionData.items : []
            return (
                <div className="w-full grid gap-4">
                    {items.map((item, i) => (
                        <div key={i} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-5">
                            <p className={`font-bold ${cs.title}`}>{item.question || 'Question'}</p>
                            <p className={`mt-2 text-sm leading-relaxed ${cs.text}`}>{item.answer || 'Réponse'}</p>
                        </div>
                    ))}
                </div>
            )
        }
        if (section.templateType === 'testimonials') {
            const items = Array.isArray(sectionData.items) ? sectionData.items : []
            return (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {items.map((item, i) => (
                        <article key={i} className="rounded-2xl bg-white/95 border border-gray-100 p-6 shadow-sm hover:-translate-y-1 transition">
                            <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={16} className="text-amber-400" fill="currentColor"/>)}</div>
                            <p className="text-gray-700 italic text-sm leading-relaxed">"{item.quote || 'Avis client'}"</p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="font-bold text-gray-900">{item.name || 'Client'}</p>
                                <p className="text-xs text-gray-400">{item.role || ''}</p>
                            </div>
                        </article>
                    ))}
                </div>
            )
        }
        if (section.templateType === 'gallery') {
            const images = Array.isArray(sectionData.images) ? sectionData.images : []
            return (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((url, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 shadow-md group">
                            <img src={url} alt="" className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"/>
                        </div>
                    ))}
                </div>
            )
        }
        if (section.templateType === 'promo') {
            return (
                <div className="w-full rounded-3xl border border-white/20 bg-black/20 backdrop-blur-md p-8 sm:p-10">
                    <div className={`flex flex-col gap-4 ${alignment}`}>
                        {sectionData.badge && <span className="inline-flex px-4 py-2 rounded-full text-xs font-bold bg-amber-300 text-amber-950">{sectionData.badge}</span>}
                        {sectionData.highlight && <p className="text-3xl sm:text-4xl font-black leading-tight">{sectionData.highlight}</p>}
                        {sectionData.details && <p className={`text-sm leading-relaxed max-w-2xl ${cs.text}`}>{sectionData.details}</p>}
                    </div>
                </div>
            )
        }
        return <div className={`text-base leading-relaxed ${cs.text}`}>{section.content || ''}</div>
    }

    return (
        <section className="py-12 sm:py-16 px-4 sm:px-6">
            <div className={`mx-auto ${containerClass} ${cs.wrapper}`} style={cs.background ? { background: cs.background } : undefined}>
                <div className={`flex flex-col gap-6 ${alignment}`}>
                    <h3 className={`text-3xl sm:text-4xl font-black leading-tight ${cs.title}`}>{section.title || 'Section personnalisée'}</h3>
                    {renderContent()}
                    {section.ctaLabel && section.ctaUrl && (
                        <a href={section.ctaUrl} className="inline-flex px-7 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition w-fit"
                           style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>
                            {section.ctaLabel}
                        </a>
                    )}
                </div>
            </div>
        </section>
    )
}
const RoomTypeCard = ({ type, config, onReserve }) => {
    const [photoIndex, setPhotoIndex] = useState(0)
    const photos = type.imagesUrls ? type.imagesUrls.split(',').map(u => u.trim()).filter(Boolean) : []
    const amenitiesList = type.amenities ? type.amenities.split(',').map(a => a.trim()).filter(Boolean) : []

    const nextPhoto = (e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length) }
    const prevPhoto = (e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="relative h-48 group">
                {photos.length > 0 ? (
                    <>
                        <img src={photos[photoIndex]} alt={type.nom} className="w-full h-full object-cover"/>
                        {photos.length > 1 && (
                            <>
                                <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"><ChevronLeft size={16}/></button>
                                <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"><ChevronRight size={16}/></button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {photos.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === photoIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}/>)}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${config.secondaryColor}20, ${config.accentColor}20)` }}>
                        <Bed size={40} style={{ color: config.primaryColor, opacity: 0.4 }}/>
                    </div>
                )}
                <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-white/95 shadow" style={{ color: config.primaryColor }}>{type.nbDisponibles} dispo</span>
            </div>
            <div className="p-5">
                <h3 className="font-black text-gray-900 text-lg">{type.nom}</h3>
                {type.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{type.description}</p>}
                {(type.capaciteAdultes || type.capaciteEnfants) && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Users size={12}/> Jusqu'à {(type.capaciteAdultes || 0) + (type.capaciteEnfants || 0)} personnes</p>
                )}
                {amenitiesList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {amenitiesList.slice(0, 4).map((a, i) => {
                            const Icon = getAmenityIcon(a)
                            return <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100"><Icon size={10}/> {a}</span>
                        })}
                        {amenitiesList.length > 4 && <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-50 text-gray-400">+{amenitiesList.length - 4}</span>}
                    </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div>
                        <p className="text-xl font-black" style={{ color: config.primaryColor }}>{fmt(type.prixBase)}</p>
                        <p className="text-[10px] text-gray-400">par nuit</p>
                    </div>
                    <button onClick={onReserve} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-black transition hover:shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>
                        Réserver <ArrowRight size={13}/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function BookingEnginePublic() {
    const { slug } = useParams()
    const [hebergement, setHebergement] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [loading, setLoading] = useState(true)

    const [dateArrivee, setDateArrivee] = useState('')
    const [dateDepart, setDateDepart] = useState('')
    const [adultes, setAdultes] = useState(2)
    const [enfants, setEnfants] = useState(0)
    const [searching, setSearching] = useState(false)
    const [searched, setSearched] = useState(false)
    const [disponibilites, setDisponibilites] = useState([])
    const [searchError, setSearchError] = useState('')

    const [bookingType, setBookingType] = useState(null)
    const [success, setSuccess] = useState(false)
    const [contactForm, setContactForm] = useState({ nom: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)

    useEffect(() => {
        hebergementAxios.get(`/hebergement/public/${slug}`)
            .then(res => setHebergement(res.data?.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [slug])

    const config = useMemo(() => {
        if (!hebergement?.bookingPageConfig) return DEFAULT_CONFIG
        try { return { ...DEFAULT_CONFIG, ...JSON.parse(hebergement.bookingPageConfig) } } catch { return DEFAULT_CONFIG }
    }, [hebergement])

    const nbNuits = useMemo(() => {
        if (!dateArrivee || !dateDepart) return 0
        return Math.max(0, Math.round((new Date(dateDepart) - new Date(dateArrivee)) / 86400000))
    }, [dateArrivee, dateDepart])
    const handleSearch = useCallback(async () => {
        if (!dateArrivee || !dateDepart || nbNuits <= 0) { setSearchError('Veuillez choisir des dates valides'); return }
        setSearchError(''); setSearching(true); setSearched(false)
        try {
            const res = await bookingAxios.get(`/booking/public/disponibilite/${hebergement.id}`, { params: { dateArrivee, dateDepart } })
            setDisponibilites(res.data?.data || [])
            setSearched(true)
            setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        } catch (err) {
            setSearchError('Erreur lors de la recherche. Réessayez.')
        } finally { setSearching(false) }
    }, [dateArrivee, dateDepart, nbNuits, hebergement])

    const handleContactSubmit = (e) => {
        e.preventDefault()
        setContactSent(true)
        setTimeout(() => setContactSent(false), 4000)
        setContactForm({ nom: '', email: '', message: '' })
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader size={32} className="animate-spin" style={{ color: CYAN }}/></div>

    if (notFound || !hebergement) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}><Home size={32} style={{ color: CYAN }}/></div>
                <p className="text-xl font-black text-gray-800">Établissement introuvable</p>
                <p className="text-gray-400 text-sm mt-1">Ce lien de réservation n'est plus disponible.</p>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6" style={{ fontFamily: config.fontFamily }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-emerald-100"><PartyPopper size={32} className="text-emerald-600"/></div>
                <p className="text-2xl font-black text-gray-900">Demande envoyée !</p>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">Votre demande a bien été transmise à <strong>{hebergement.nom}</strong>. Vous recevrez une confirmation par email prochainement.</p>
                <button onClick={() => window.location.reload()} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}><ArrowLeft size={15}/> Retour à la page</button>
            </div>
        )
    }
    const heroHeight = HERO_HEIGHTS[config.heroHeight] || HERO_HEIGHTS.immersive
    const heroBackground = config.backgroundPattern === 'minimal' ? config.primaryColor
        : config.backgroundPattern === 'mesh' ? `radial-gradient(circle at 20% 20%, ${config.accentColor}, transparent 50%), radial-gradient(circle at 80% 80%, ${config.secondaryColor}, transparent 50%), ${config.primaryColor}`
            : `linear-gradient(135deg, ${config.primaryColor} 0%, ${config.accentColor} 60%, ${config.secondaryColor} 100%)`
    const equipementsList = hebergement.equipements ? hebergement.equipements.split(',').map(e => e.trim()).filter(Boolean) : []
    const photos = hebergement.photos || []
    const ic = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none"

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: config.fontFamily }}>

            {/* HERO */}
            <header className="text-white relative overflow-hidden flex items-end" style={{ background: heroBackground, minHeight: `${heroHeight}px` }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white -translate-y-1/3 translate-x-1/4"/>
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5 bg-white translate-y-1/2 -translate-x-1/4"/>
                <div className="max-w-6xl mx-auto px-6 py-10 relative w-full">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: `${config.secondaryColor}30` }}><Home size={16}/></div>
                        <span className="font-black text-lg">LUX<span style={{ color: config.secondaryColor }}>TECH</span></span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black leading-tight">{config.heroTitle}</h1>
                    <p className="text-white/80 text-sm sm:text-lg mt-3 max-w-xl">{config.heroSubtitle}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-white/70">
                        {hebergement.ville && <span className="flex items-center gap-1.5"><MapPin size={14}/> {hebergement.nom} — {hebergement.ville}, {hebergement.pays}</span>}
                        {hebergement.etoiles && <span className="flex items-center gap-1">{Array.from({ length: hebergement.etoiles }).map((_, i) => <Star key={i} size={13} fill="currentColor"/>)}</span>}
                    </div>
                </div>
            </header>
            {/* BARRE DE RECHERCHE */}
            <div id="search-section" className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-6">
                    {searchError && <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2"><AlertTriangle size={14}/>{searchError}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <DateInput label="Arrivée" value={dateArrivee} minDate={todayStr()} onChange={setDateArrivee} config={config}/>
                        <DateInput label="Départ" value={dateDepart} minDate={dateArrivee || todayStr()} onChange={setDateDepart} config={config}/>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Users size={12}/> Voyageurs</label>
                            <TravelersSelector adultes={adultes} enfants={enfants} config={config}
                                               onChange={(k, v) => k === 'adultes' ? setAdultes(v) : setEnfants(v)}/>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleSearch} disabled={searching}
                                    className="w-full py-3 rounded-xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>
                                {searching ? <RefreshCw size={16} className="animate-spin"/> : <><Sparkles size={16}/> {config.ctaLabel}</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTATS / CHAMBRES */}
            {config.showRoomsSection && (
                <div id="results-section" className="max-w-6xl mx-auto px-6 py-12">
                    {!searched ? (
                        <div className="text-center py-16"><Bed size={40} className="mx-auto text-gray-200 mb-3"/><p className="text-gray-400 text-sm">Choisissez vos dates pour voir les chambres disponibles</p></div>
                    ) : disponibilites.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-amber-50"><AlertTriangle size={28} className="text-amber-500"/></div>
                            <p className="text-gray-700 font-bold">Aucune chambre disponible</p>
                            <p className="text-gray-400 text-sm mt-1">Essayez d'autres dates.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Chambres disponibles</h2>
                                    <p className="text-sm text-gray-400 mt-1">{disponibilites.length} type{disponibilites.length > 1 ? 's' : ''} · {nbNuits} nuit{nbNuits > 1 ? 's' : ''}</p>
                                </div>
                                <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: `${config.secondaryColor}15`, color: config.primaryColor }}><Clock3 size={12}/> Réponse rapide</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {disponibilites.map(type => (
                                    <RoomTypeCard key={type.chambreTypeId} type={type} config={config} onReserve={() => setBookingType(type)}/>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* À PROPOS + GALERIE */}
            {(() => {
                const customSections = Array.isArray(config.customSections) ? config.customSections : []
                const customMap = Object.fromEntries(customSections.filter(s => s?.id).map(s => [`custom:${s.id}`, s]))
                const customKeys = Object.keys(customMap)
                const visible = { about: config.showAboutSection, amenities: config.showAmenitiesSection, rooms: false, contact: config.showContactSection }
                const order = Array.isArray(config.sectionOrder) && config.sectionOrder.length ? config.sectionOrder : ['about', 'amenities', 'contact', ...customKeys]
                const safeOrder = Array.from(new Set([...order, ...customKeys]))

                const sectionMap = {
                    about: (hebergement.description || photos.length > 0) && (
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: config.secondaryColor }}>À propos</p>
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">{hebergement.nom}</h2>
                                    {hebergement.description && <p className="text-sm text-gray-600 leading-relaxed">{hebergement.description}</p>}
                                    <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-500">
                                        {hebergement.heureCheckin && <span className="flex items-center gap-1.5"><Clock3 size={14}/> Check-in {hebergement.heureCheckin}</span>}
                                        {hebergement.heureCheckout && <span className="flex items-center gap-1.5"><Clock3 size={14}/> Check-out {hebergement.heureCheckout}</span>}
                                    </div>
                                </div>
                                {photos.length > 0 && <Gallery photos={photos} hotelName={hebergement.nom}/>}
                            </div>
                        </div>
                    ),
                    amenities: equipementsList.length > 0 && (
                        <div className="max-w-6xl mx-auto px-6">
                            <p className="text-xs font-black uppercase tracking-widest mb-2 text-center" style={{ color: config.secondaryColor }}>Équipements</p>
                            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Tout ce qu'il vous faut</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {equipementsList.map((e, i) => {
                                    const Icon = getAmenityIcon(e)
                                    return (
                                        <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${config.secondaryColor}15` }}><Icon size={18} style={{ color: config.primaryColor }}/></div>
                                            <span className="text-sm font-semibold text-gray-700">{e}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ),
                    contact: (
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: config.secondaryColor }}>Contact</p>
                                    <h2 className="text-2xl font-black text-gray-900 mb-5">Une question ?</h2>
                                    <div className="space-y-3">
                                        {hebergement.telephone && (
                                            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${config.secondaryColor}15` }}><Phone size={16} style={{ color: config.primaryColor }}/></div>
                                                <div><p className="text-xs text-gray-400">Téléphone</p><p className="text-sm font-bold text-gray-800">{hebergement.telephone}</p></div>
                                            </div>
                                        )}
                                        {hebergement.email && (
                                            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${config.secondaryColor}15` }}><Mail size={16} style={{ color: config.primaryColor }}/></div>
                                                <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-bold text-gray-800">{hebergement.email}</p></div>
                                            </div>
                                        )}
                                        {hebergement.adresse && (
                                            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${config.secondaryColor}15` }}><MapPin size={16} style={{ color: config.primaryColor }}/></div>
                                                <div><p className="text-xs text-gray-400">Adresse</p><p className="text-sm font-bold text-gray-800">{hebergement.adresse}</p></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                                    {contactSent ? (
                                        <div className="text-center py-8">
                                            <Check size={32} className="mx-auto text-emerald-500 mb-3"/>
                                            <p className="font-bold text-gray-800">Message envoyé !</p>
                                            <p className="text-xs text-gray-400 mt-1">L'établissement vous répondra rapidement.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleContactSubmit} className="space-y-3">
                                            <input required placeholder="Votre nom" value={contactForm.nom} onChange={e => setContactForm(p => ({ ...p, nom: e.target.value }))} className={ic}/>
                                            <input required type="email" placeholder="Votre email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} className={ic}/>
                                            <textarea required rows={4} placeholder="Votre message" value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} className={ic}/>
                                            <button type="submit" className="w-full py-3 rounded-xl text-white text-sm font-black transition hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})` }}>Envoyer</button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    ),
                }
                return (
                    <div className="bg-gradient-to-b from-white via-gray-50 to-white">
                        {safeOrder
                            .filter(key => key.startsWith('custom:') ? customMap[key]?.visible !== false : visible[key])
                            .map((key, idx) => {
                                const isEven = idx % 2 === 0
                                return (
                                    <div key={key} className={`${isEven ? 'bg-white' : 'bg-gradient-to-b from-gray-50/80 to-white'} border-b border-gray-100/50 py-8 sm:py-16`}>
                                        {key.startsWith('custom:') ? <CustomSection section={customMap[key]} config={config}/> : sectionMap[key]}
                                    </div>
                                )
                            })}
                    </div>
                )
            })()}

            {/* FOOTER */}
            <footer className="text-white py-10 mt-8" style={{ background: config.primaryColor }}>
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${config.secondaryColor}30` }}><Home size={16}/></div>
                        <span className="font-black">LUX<span style={{ color: config.secondaryColor }}>TECH</span></span>
                    </div>
                    <p className="text-xs text-white/50">© {new Date().getFullYear()} {hebergement.nom} — Propulsé par LuxTech</p>
                </div>
            </footer>

            <BookingModal isOpen={!!bookingType} type={bookingType} hebergement={hebergement}
                          dateArrivee={dateArrivee} dateDepart={dateDepart} nbNuits={nbNuits} config={config}
                          onClose={() => setBookingType(null)} onSuccess={() => { setBookingType(null); setSuccess(true) }}/>
        </div>
    )
}
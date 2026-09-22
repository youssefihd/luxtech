import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
    Building2, Check, X, RefreshCw, AlertTriangle, Edit3, Save,
    Star, MapPin, Phone, Mail, Clock, Globe, Upload, Plus, Trash2,
    ChevronDown, ChevronUp, Expand, CheckCircle, AlertCircle, Calendar,
    FileText, CreditCard, Navigation
} from 'lucide-react'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const EQUIPEMENTS_PREDEFINIS = [
    'WiFi gratuit', 'Piscine', 'Parking', 'Climatisation', 'Restaurant',
    'Spa', 'Salle de sport', 'Bar', 'Room service', 'Navette aéroport',
]
const SERVICES_PREDEFINIS = [
    'Petit-déjeuner inclus', 'Ménage quotidien', 'Blanchisserie', 'Conciergerie',
    'Location de voiture', 'Excursions', 'Baby-sitting', 'Massage',
]

const CHAMPS_COMPLETION = [
    { key: 'description', label: 'Description' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'email', label: 'Email' },
    { key: 'website', label: 'Site web' },
    { key: 'etoiles', label: 'Étoiles' },
    { key: 'numeroFiscal', label: 'Identifiant fiscal' },
    { key: 'rc', label: 'Registre de commerce' },
    { key: 'ice', label: 'ICE' },
    { key: 'iban', label: 'IBAN' },
    { key: 'latitude', label: 'Coordonnées GPS' },
    { key: 'equipements', label: 'Équipements' },
]

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)

const KPICard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="relative rounded-2xl p-5 border-2 border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: color }}/>
        <div className="relative p-2.5 rounded-xl w-fit mb-3" style={{ background: bg }}>
            <Icon className="h-5 w-5" style={{ color }}/>
        </div>
        <p className="relative text-3xl font-black text-gray-900 mb-0.5">{value ?? 0}</p>
        <p className="relative text-sm text-gray-500 font-medium">{title}</p>
    </div>
)

const ProfileCompletionCard = ({ hotelData, onStartCompletion }) => {
    const { percentage, missing, filled, total } = useMemo(() => {
        const missingFields = CHAMPS_COMPLETION.filter(c => {
            const v = c.key === 'latitude' ? (hotelData?.latitude && hotelData?.longitude) : hotelData?.[c.key]
            return !v
        })
        const filledCount = CHAMPS_COMPLETION.length - missingFields.length
        return {
            percentage: Math.round((filledCount / CHAMPS_COMPLETION.length) * 100),
            missing: missingFields.slice(0, 3),
            filled: filledCount, total: CHAMPS_COMPLETION.length,
        }
    }, [hotelData])

    if (percentage === 100) {
        return (
            <div className="rounded-2xl p-6 border-2 border-emerald-200" style={{ background: 'linear-gradient(135deg, #d1fae5, #dcfce7)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle size={24} className="text-emerald-600"/>
                        </div>
                        <div>
                            <h3 className="font-black text-emerald-800">Profil complet !</h3>
                            <p className="text-sm text-emerald-600 mt-0.5">Toutes les informations sont renseignées</p>
                        </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-black">100%</span>
                </div>
            </div>
        )
    }

    return (
        <div onClick={onStartCompletion}
             className="rounded-2xl p-6 border-2 border-amber-200 cursor-pointer hover:shadow-lg transition-all duration-300 group"
             style={{ background: 'linear-gradient(135deg, #fef3c7, #fed7aa)' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle size={24} className="text-amber-600"/>
                    </div>
                    <div>
                        <h3 className="font-black text-amber-800">Complétez votre profil</h3>
                        <p className="text-sm text-amber-600 mt-0.5">{filled}/{total} informations</p>
                    </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-amber-200 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-amber-700">{percentage}%</span>
                </div>
            </div>
            <div className="w-full rounded-full h-2 bg-amber-200 mb-4">
                <div className="h-2 rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${percentage}%` }}/>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-bold text-amber-700 flex items-center gap-1"><Plus size={14}/> Champs manquants</p>
                {missing.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-amber-100">
                        <span className="text-base">📋</span>
                        <p className="text-sm font-medium text-gray-800">{c.label}</p>
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">À compléter</span>
                    </div>
                ))}
            </div>
            <button className="mt-4 mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition">
                <Edit3 size={15}/> Compléter le profil
            </button>
        </div>
    )
}

const SelectableList = ({ title, items, selected, onToggle, isEditing, color }) => {
    const [newItem, setNewItem] = useState('')
    const colorCls = color === 'blue' ? { bg: `${CYAN}15`, text: NAVY, border: CYAN } : { bg: '#d1fae5', text: '#059669', border: '#059669' }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-4">{title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
                {items.map(item => {
                    const isSel = selected.includes(item)
                    return (
                        <button key={item} type="button" disabled={!isEditing} onClick={() => onToggle(item)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border-2 ${
                                    isSel ? '' : 'border-gray-100 text-gray-400'
                                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                                style={isSel ? { background: colorCls.bg, color: colorCls.text, borderColor: colorCls.border } : {}}>
                            {isSel && <Check size={11} className="inline mr-1"/>}
                            {item}
                        </button>
                    )
                })}
                {selected.filter(s => !items.includes(s)).map(item => (
                    <button key={item} type="button" disabled={!isEditing} onClick={() => onToggle(item)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition"
                            style={{ background: colorCls.bg, color: colorCls.text, borderColor: colorCls.border }}>
                        <Check size={11} className="inline mr-1"/>{item}
                    </button>
                ))}
            </div>
            {isEditing && (
                <div className="flex gap-2 mt-3">
                    <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
                           onKeyDown={e => { if (e.key === 'Enter' && newItem.trim()) { onToggle(newItem.trim()); setNewItem('') } }}
                           placeholder="Ajouter..." className="flex-1 px-3 py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#66CAD8]"/>
                    <button type="button" onClick={() => { if (newItem.trim()) { onToggle(newItem.trim()); setNewItem('') } }}
                            className="px-3 py-2 rounded-xl text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        + Ajouter
                    </button>
                </div>
            )}
            {!isEditing && selected.length === 0 && <p className="text-xs text-gray-400 italic">Aucun élément sélectionné</p>}
        </div>
    )
}

export default function HebergementInfo() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [toast, setToast] = useState(null)
    const [showAllPhotos, setShowAllPhotos] = useState(false)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const [form, setForm] = useState({
        nom: '', nomLegal: '', description: '', adresse: '', ville: '', pays: '', codePostal: '',
        telephone: '', email: '', website: '', etoiles: '', heureCheckin: '', heureCheckout: '',
        numeroFiscal: '', rc: '', patente: '', cnss: '', ice: '', iban: '',
        latitude: '', longitude: '', equipements: [], servicesInclus: [],
    })

    const photoInputRef = useRef(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const populateForm = (h) => {
        setForm({
            nom: h.nom || '', nomLegal: h.nomLegal || '', description: h.description || '',
            adresse: h.adresse || '', ville: h.ville || '', pays: h.pays || '', codePostal: h.codePostal || '',
            telephone: h.telephone || '', email: h.email || '', website: h.website || '',
            etoiles: h.etoiles || '', heureCheckin: h.heureCheckin || '', heureCheckout: h.heureCheckout || '',
            numeroFiscal: h.numeroFiscal || '', rc: h.rc || '', patente: h.patente || '', cnss: h.cnss || '',
            ice: h.ice || '', iban: h.iban || '', latitude: h.latitude || '', longitude: h.longitude || '',
            equipements: (h.equipements || '').split(',').map(e => e.trim()).filter(Boolean),
            servicesInclus: (h.servicesInclus || '').split(',').map(e => e.trim()).filter(Boolean),
        })
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = res?.data?.data
            setHebergement(h)
            if (h) populateForm(h)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })), disabled: !isEditing })

    const toggleEquip = (item) => setForm(p => ({ ...p, equipements: p.equipements.includes(item) ? p.equipements.filter(x => x !== item) : [...p.equipements, item] }))
    const toggleService = (item) => setForm(p => ({ ...p, servicesInclus: p.servicesInclus.includes(item) ? p.servicesInclus.filter(x => x !== item) : [...p.servicesInclus, item] }))

    const handleStartCompletion = () => {
        setIsEditing(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancel = () => {
        populateForm(hebergement)
        setIsEditing(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await hebergementAxios.patch(`/hebergement/hebergements/${hebergement.id}/info`, {
                nom: form.nom, nomLegal: form.nomLegal, description: form.description,
                adresse: form.adresse, ville: form.ville, pays: form.pays, codePostal: form.codePostal,
                telephone: form.telephone, email: form.email, website: form.website,
                etoiles: form.etoiles ? Number(form.etoiles) : null,
                heureCheckin: form.heureCheckin, heureCheckout: form.heureCheckout,
                numeroFiscal: form.numeroFiscal, rc: form.rc, patente: form.patente, cnss: form.cnss,
                ice: form.ice, iban: form.iban,
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                equipements: form.equipements.join(', '),
                servicesInclus: form.servicesInclus.join(', '),
            })
            setHebergement(res.data?.data)
            setIsEditing(false)
            showToast('Informations enregistrées !')
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        setUploadingPhoto(true)
        try {
            for (const file of files) {
                const formData = new FormData()
                formData.append('photo', file)
                await hebergementAxios.post(`/hebergement/hebergements/${hebergement.id}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }
            showToast(`${files.length} photo(s) ajoutée(s) !`)
            await fetchData()
        } catch (err) {
            showToast("Erreur lors de l'upload.", 'error')
        } finally {
            setUploadingPhoto(false)
            if (photoInputRef.current) photoInputRef.current.value = ''
        }
    }

    const handleDeletePhoto = async (photoId) => {
        try {
            await hebergementAxios.delete(`/hebergement/photos/${photoId}`)
            showToast('Photo supprimée.')
            setDeleteTarget(null)
            await fetchData()
        } catch (err) {
            showToast('Erreur.', 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/>
            </div>
        )
    }

    const photos = hebergement?.photos || []
    const displayedPhotos = showAllPhotos ? photos : photos.slice(0, 4)
    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium disabled:bg-gray-50 disabled:text-gray-500"

    return (
        <div className="space-y-5 max-w-6xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Opérations</p>
                        <h1 className="text-2xl font-black text-white">Informations de l'établissement</h1>
                        <p className="text-white/60 text-sm mt-1">Gérez les détails de votre établissement</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} disabled={saving}
                                        className="px-5 py-2.5 rounded-xl bg-white/15 text-white text-sm font-bold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                                    Annuler
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg disabled:opacity-50"
                                        style={{ color: NAVY }}>
                                    {saving ? <RefreshCw size={16} className="animate-spin"/> : <><Save size={16}/> Sauvegarder</>}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                    style={{ color: NAVY }}>
                                <Edit3 size={16}/> Modifier
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Colonne gauche */}
                <div className="lg:col-span-2 space-y-5">
                    {!isEditing && <ProfileCompletionCard hotelData={hebergement} onStartCompletion={handleStartCompletion}/>}

                    {/* Infos générales */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-5 pb-3 border-b border-gray-100">Informations générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Building2 size={12}/> Nom</label>
                                <input {...F('nom')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom légal</label>
                                <input {...F('nomLegal')} className={ic}/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                                <textarea rows={3} {...F('description')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><MapPin size={12}/> Adresse</label>
                                <input {...F('adresse')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Ville</label>
                                <input {...F('ville')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Pays</label>
                                <input {...F('pays')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Code postal</label>
                                <input {...F('codePostal')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Phone size={12}/> Téléphone</label>
                                <input {...F('telephone')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Mail size={12}/> Email</label>
                                <input type="email" {...F('email')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Globe size={12}/> Site web</label>
                                <input {...F('website')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Star size={12}/> Étoiles</label>
                                <select {...F('etoiles')} className={ic}>
                                    <option value="">—</option>
                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Clock size={12}/> Check-in</label>
                                <input type="time" {...F('heureCheckin')} className={ic}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Clock size={12}/> Check-out</label>
                                <input type="time" {...F('heureCheckout')} className={ic}/>
                            </div>
                        </div>
                    </div>

                    {/* Infos complémentaires — catégorisées */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-5 pb-3 border-b border-gray-100">Informations complémentaires</h3>

                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-200 p-5" style={{ background: `linear-gradient(135deg, ${CYAN}05, white)` }}>
                                <h4 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ background: CYAN }}/> Coordonnées GPS
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Navigation size={12}/> Latitude</label>
                                        <input type="number" step="0.000001" {...F('latitude')} className={ic}/>
                                        {form.latitude && form.longitude && (
                                            <a href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`} target="_blank" rel="noreferrer"
                                               className="text-xs mt-1 inline-block text-blue-600 hover:underline">📍 Voir sur Google Maps</a>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Navigation size={12}/> Longitude</label>
                                        <input type="number" step="0.000001" {...F('longitude')} className={ic}/>
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                                        💡 Pour obtenir vos coordonnées : ouvrez <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline font-bold">Google Maps</a>, clic droit sur votre établissement, et copiez les coordonnées.
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-gray-200 p-5" style={{ background: `linear-gradient(135deg, ${PURPLE}05, white)` }}>
                                <h4 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ background: PURPLE }}/> Informations légales & financières
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FileText size={12}/> Identifiant fiscal</label>
                                        <input {...F('numeroFiscal')} className={ic}/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Registre de commerce (RC)</label>
                                        <input {...F('rc')} className={ic}/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Patente</label>
                                        <input {...F('patente')} className={ic}/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">CNSS</label>
                                        <input {...F('cnss')} className={ic}/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">ICE</label>
                                        <input {...F('ice')} className={ic}/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><CreditCard size={12}/> IBAN</label>
                                        <input {...F('iban')} className={ic}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lien vers Tarifs saisonniers */}
                    <button onClick={() => navigate('/hotel/tarifs-saisonniers')}
                            className="w-full bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-[#66CAD8] transition text-left">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                            <Calendar size={22} className="text-white"/>
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-gray-900">Tarifs saisonniers</p>
                            <p className="text-xs text-gray-400">Gérez vos prix selon les saisons</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: `${CYAN}15`, color: NAVY }}>Ouvrir →</span>
                    </button>
                </div>

                {/* Colonne droite */}
                <div className="space-y-5">
                    <SelectableList title="Équipements" items={EQUIPEMENTS_PREDEFINIS} selected={form.equipements} onToggle={toggleEquip} isEditing={isEditing} color="blue"/>
                    <SelectableList title="Services inclus" items={SERVICES_PREDEFINIS} selected={form.servicesInclus} onToggle={toggleService} isEditing={isEditing} color="green"/>

                    {/* Photos */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-2">Photos</h3>
                        <p className="text-xs text-gray-400 mb-4">{photos.length} photo{photos.length > 1 ? 's' : ''}</p>

                        {isEditing && (
                            <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center mb-4 cursor-pointer hover:border-[#66CAD8] hover:bg-gray-50 transition">
                                {uploadingPhoto ? (
                                    <RefreshCw size={28} className="mx-auto mb-3 animate-spin" style={{ color: CYAN }}/>
                                ) : (
                                    <Upload size={28} className="mx-auto mb-3 text-gray-300"/>
                                )}
                                <p className="text-sm text-gray-500 font-medium">Cliquez pour ajouter des photos</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                                       className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto}/>
                            </label>
                        )}

                        {photos.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-400">Aucune photo disponible</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    {displayedPhotos.map(photo => (
                                        <div key={photo.id} className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-square">
                                            <img src={photo.url} alt={photo.nomFichier} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                                <Expand size={24} className="text-white opacity-0 group-hover:opacity-100 transition"/>
                                            </div>
                                            {isEditing && (
                                                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo.id) }}
                                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                                                    <X size={14}/>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {photos.length > 4 && (
                                    <button onClick={() => setShowAllPhotos(v => !v)}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition hover:shadow-lg"
                                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                        {showAllPhotos ? 'Voir moins' : `Voir toutes les photos (${photos.length})`}
                                        {showAllPhotos ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-gray-100">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-7 w-7 text-red-600"/>
                            </div>
                            <h2 className="text-lg font-black text-gray-900">Supprimer cette photo ?</h2>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                                Annuler
                            </button>
                            <button onClick={() => handleDeletePhoto(deleteTarget)}
                                    className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition"
                                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
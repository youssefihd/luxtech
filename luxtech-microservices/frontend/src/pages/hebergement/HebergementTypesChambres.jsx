import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Layers, Plus, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronDown, Edit3, Trash2, Bed, Users, DollarSign, TrendingUp, Image as ImageIcon
} from 'lucide-react'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const NOMS_TYPES_PREDEFINIS = [
    'Simple', 'Double', 'Lits Jumeaux', 'Triple', 'Quadruple',
    'Suite', 'Suite Junior', 'Familiale', 'Studio', 'Appartement',
    'Chambre Deluxe', 'Chambre Supérieure', 'Penthouse',
]

const EQUIPEMENTS_PREDEFINIS = [
    'WiFi gratuit', 'Climatisation', 'Chauffage', 'Télévision écran plat',
    'Minibar', 'Coffre-fort', 'Bureau', 'Balcon', 'Terrasse',
    'Vue sur mer', 'Vue sur jardin', 'Baignoire', 'Douche',
    'Sèche-cheveux', 'Peignoir', 'Machine à café', 'Réfrigérateur',
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

const DeleteConfirmModal = ({ isOpen, type, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(type.id) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !type) return null
    const hasChambres = (type.nombreChambres || 0) > 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md mx-4 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-7 w-7 text-red-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Supprimer le type de chambre</h2>
                    <p className="text-sm text-gray-500 mt-1">Type <span className="font-bold">{type.nom}</span></p>
                </div>

                {hasChambres && (
                    <div className="mb-5 p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                        <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5"/>
                        <div>
                            <p className="text-sm font-bold text-red-800">Attention — suppression en cascade</p>
                            <p className="text-xs text-red-600 mt-1">
                                Ce type a <strong>{type.nombreChambres} chambre{type.nombreChambres > 1 ? 's' : ''}</strong> associée{type.nombreChambres > 1 ? 's' : ''}.
                                La supprimer effacera aussi <strong>toutes ces chambres</strong> définitivement.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : (hasChambres ? 'Tout supprimer' : 'Supprimer')}
                    </button>
                </div>
            </div>
        </div>
    )
}

const TypeModal = ({ isOpen, type, onSubmit, onClose }) => {
    const [nomSelect, setNomSelect] = useState('')
    const [customNom, setCustomNom] = useState('')
    const [form, setForm] = useState({
        description: '', prixBase: '', capaciteAdultes: 2, capaciteEnfants: 0, ordreAffichage: 0
    })
    const [selectedEquip, setSelectedEquip] = useState([])
    const [newEquip, setNewEquip] = useState('')
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [existingPhotoUrl, setExistingPhotoUrl] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setPhotoFile(null)
            setPhotoPreview(null)
            setExistingPhotoUrl(type?.imagesUrls || null)
            setNewEquip('')

            if (type) {
                const isPredefini = NOMS_TYPES_PREDEFINIS.includes(type.nom)
                setNomSelect(isPredefini ? type.nom : '__custom__')
                setCustomNom(isPredefini ? '' : (type.nom || ''))
                setForm({
                    description: type.description || '',
                    prixBase: type.prixBase ?? '',
                    capaciteAdultes: type.capaciteAdultes ?? 2,
                    capaciteEnfants: type.capaciteEnfants ?? 0,
                    ordreAffichage: type.ordreAffichage ?? 0,
                })
                setSelectedEquip((type.amenities || '').split(',').map(a => a.trim()).filter(Boolean))
            } else {
                setNomSelect('')
                setCustomNom('')
                setForm({ description: '', prixBase: '', capaciteAdultes: 2, capaciteEnfants: 0, ordreAffichage: 0 })
                setSelectedEquip([])
            }
        }
    }, [isOpen, type])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const toggleEquip = (item) => {
        setSelectedEquip(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
    }

    const addCustomEquip = () => {
        const v = newEquip.trim()
        if (!v) return
        if (!selectedEquip.includes(v)) setSelectedEquip(prev => [...prev, v])
        setNewEquip('')
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { setError('Le fichier doit être une image'); return }
        if (file.size > 5 * 1024 * 1024) { setError("L'image ne doit pas dépasser 5MB"); return }
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
        setError('')
    }

    const handleSubmit = async () => {
        const nomFinal = nomSelect === '__custom__' ? customNom.trim() : nomSelect
        if (!nomFinal) { setError('Veuillez sélectionner ou saisir un nom de type'); return }
        if (form.prixBase === '' || Number(form.prixBase) < 0) { setError('Le prix de base doit être renseigné'); return }
        setProcessing(true)
        try {
            await onSubmit({
                nom: nomFinal,
                description: form.description || null,
                prixBase: Number(form.prixBase),
                capaciteAdultes: Number(form.capaciteAdultes) || 1,
                capaciteEnfants: Number(form.capaciteEnfants) || 0,
                amenities: selectedEquip.length > 0 ? selectedEquip.join(', ') : null,
                ordreAffichage: Number(form.ordreAffichage) || 0,
            }, photoFile)
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"
    const displayedPhoto = photoPreview || existingPhotoUrl

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Layers size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                                    {type ? 'Modifier' : 'Nouveau'}
                                </p>
                                <h2 className="text-lg font-black text-white">{type ? type.nom : 'Type de chambre'}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 font-medium"><AlertTriangle size={14}/>{error}</div>}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Photo</label>
                        {displayedPhoto ? (
                            <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 h-40">
                                <img src={displayedPhoto} alt="Aperçu" className="w-full h-full object-cover"/>
                                <label className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                                    <span className="px-3 py-2 bg-white rounded-xl text-xs font-bold">Changer la photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                                </label>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#66CAD8] hover:bg-gray-50 transition">
                                <ImageIcon size={22} className="text-gray-300"/>
                                <span className="text-xs font-semibold text-gray-400">Ajouter une photo (JPG, PNG — max 5MB)</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                            </label>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom du type *</label>
                        <select
                            value={nomSelect}
                            onChange={e => setNomSelect(e.target.value)}
                            className={ic}>
                            <option value="">Sélectionnez un type</option>
                            {NOMS_TYPES_PREDEFINIS.map(n => <option key={n} value={n}>{n}</option>)}
                            <option value="__custom__">✏️ Saisir un nom personnalisé...</option>
                        </select>
                        {nomSelect === '__custom__' && (
                            <input type="text" value={customNom} onChange={e => setCustomNom(e.target.value)}
                                   placeholder="Ex: Suite Royale, Bungalow..."
                                   className={ic + ' mt-2'} autoFocus/>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                        <textarea rows={3} {...F('description')} placeholder="Description du type de chambre..." className={ic}/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Prix de base (MAD/nuit) *</label>
                            <input type="number" min="0" step="0.01" {...F('prixBase')} placeholder="0.00" className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Ordre d'affichage</label>
                            <input type="number" min="0" {...F('ordreAffichage')} className={ic}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Capacité adultes</label>
                            <input type="number" min="1" max="20" {...F('capaciteAdultes')} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Capacité enfants</label>
                            <input type="number" min="0" max="10" {...F('capaciteEnfants')} className={ic}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Équipements</label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {[...EQUIPEMENTS_PREDEFINIS, ...selectedEquip.filter(e => !EQUIPEMENTS_PREDEFINIS.includes(e))].map(item => {
                                const sel = selectedEquip.includes(item)
                                return (
                                    <button key={item} type="button" onClick={() => toggleEquip(item)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition text-left ${
                                                sel ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                            }`}>
                                        {sel && <Check size={11} style={{ color: CYAN }}/>}
                                        <span className="truncate">{item}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Ajouter un équipement personnalisé..."
                                   value={newEquip} onChange={e => setNewEquip(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomEquip())}
                                   className="flex-1 px-3 py-2 border-2 border-dashed border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-xs transition"/>
                            <button type="button" onClick={addCustomEquip}
                                    className="px-3 py-2 rounded-xl text-white text-xs font-bold transition"
                                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                + Ajouter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> {type ? 'Enregistrer' : 'Créer'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementTypesChambres() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('ordre')
    const [showFilters, setShowFilters] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [editingType, setEditingType] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const hebergRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = hebergRes?.data?.data
            setHebergement(h)
            if (h?.id) {
                const typesRes = await hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambre-types`).catch(() => null)
                setTypes(typesRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const stats = useMemo(() => {
        const totalTypes = types.length
        const totalChambres = types.reduce((s, t) => s + (t.nombreChambres || 0), 0)
        const prixMoyen = totalTypes > 0 ? types.reduce((s, t) => s + Number(t.prixBase || 0), 0) / totalTypes : 0
        const capaciteMax = types.reduce((m, t) => Math.max(m, Number(t.capaciteAdultes || 0) + Number(t.capaciteEnfants || 0)), 0)
        return { totalTypes, totalChambres, prixMoyen, capaciteMax }
    }, [types])

    const filtered = useMemo(() => {
        let list = types.filter(t => {
            const q = search.toLowerCase()
            return !search || (t.nom || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        })
        list.sort((a, b) => {
            switch (sortBy) {
                case 'nom': return (a.nom || '').localeCompare(b.nom || '')
                case 'prix': return Number(b.prixBase || 0) - Number(a.prixBase || 0)
                case 'capacite': return (Number(b.capaciteAdultes||0)+Number(b.capaciteEnfants||0)) - (Number(a.capaciteAdultes||0)+Number(a.capaciteEnfants||0))
                default: return (a.ordreAffichage || 0) - (b.ordreAffichage || 0)
            }
        })
        return list
    }, [types, search, sortBy])

    const handleCreateOrUpdate = async (data, photoFile) => {
        try {
            let typeId = editingType?.id
            if (editingType) {
                await hebergementAxios.put(`/hebergement/chambre-types/${editingType.id}`, data)
            } else {
                const res = await hebergementAxios.post(`/hebergement/hebergements/${hebergement.id}/chambre-types`, data)
                typeId = res?.data?.data?.id
            }
            if (photoFile && typeId) {
                const formData = new FormData()
                formData.append('photo', photoFile)
                await hebergementAxios.post(`/hebergement/chambre-types/${typeId}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }
            showToast(editingType ? 'Type mis à jour !' : 'Type créé !')
            setShowModal(false)
            setEditingType(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id) => {
        try {
            await hebergementAxios.delete(`/hebergement/chambre-types/${id}`)
            showToast('Type supprimé.')
            setDeleteTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de la suppression.', 'error')
        }
    }

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="rounded-2xl shadow-md p-6 text-white relative overflow-hidden"
                 style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, ${NAVY} 100%)` }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des types de chambres</p>
                        <h1 className="text-2xl font-black text-white">Types de chambres</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} type{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <button onClick={() => { setEditingType(null); setShowModal(true) }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Nouveau type
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Types de chambres" value={stats.totalTypes}                icon={Layers}     color="#5D2E8B" bg="#f3e8ff"/>
                <KPICard title="Chambres totales"  value={stats.totalChambres}             icon={Bed}        color="#059669" bg="#d1fae5"/>
                <KPICard title="Prix moyen"        value={fmt(stats.prixMoyen)}            icon={TrendingUp} color="#d97706" bg="#fef3c7"/>
                <KPICard title="Capacité max"      value={`${stats.capaciteMax} pers.`}    icon={Users}      color="#2563eb" bg="#dbeafe"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher un type de chambre..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/>
                        Trier
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Trier par</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputCls}>
                            <option value="ordre">Ordre d'affichage</option>
                            <option value="nom">Nom (A-Z)</option>
                            <option value="prix">Prix (haut → bas)</option>
                            <option value="capacite">Capacité (haut → bas)</option>
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-400 font-medium">Chargement des types de chambres...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                         style={{ background: `linear-gradient(135deg, ${PURPLE}15, ${CYAN}15)` }}>
                        <Layers size={32} style={{ color: PURPLE }}/>
                    </div>
                    <p className="text-gray-700 font-bold text-lg mb-1">Aucun type de chambre trouvé</p>
                    <p className="text-gray-400 text-sm mb-4">Créez votre premier type pour organiser vos chambres</p>
                    <button onClick={() => { setEditingType(null); setShowModal(true) }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        <Plus size={15}/> Créer un type
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(t => {
                        const capaciteTotale = Number(t.capaciteAdultes || 0) + Number(t.capaciteEnfants || 0)
                        const amenitiesList = (t.amenities || '').split(',').map(a => a.trim()).filter(Boolean)
                        return (
                            <div key={t.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <div className="relative h-32 overflow-hidden" style={t.imagesUrls ? {} : { background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                                    {t.imagesUrls ? (
                                        <img src={t.imagesUrls} alt={t.nom} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Bed size={32} className="text-white/40"/>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
                                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-black">
                                        #{t.ordreAffichage ?? 0}
                                    </span>
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <h3 className="text-lg font-black text-white truncate">{t.nom}</h3>
                                        <p className="text-white/70 text-xs font-semibold mt-0.5">
                                            {t.nombreChambres || 0} chambre{t.nombreChambres > 1 ? 's' : ''} associée{t.nombreChambres > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {t.description && (
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed h-8">{t.description}</p>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 border border-blue-100/50">
                                            <Users size={14} className="text-blue-600 shrink-0"/>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-blue-600/70 font-bold uppercase">Capacité</p>
                                                <p className="text-xs font-black text-gray-900">{capaciteTotale} pers.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100/50">
                                            <DollarSign size={14} className="text-emerald-600 shrink-0"/>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-emerald-600/70 font-bold uppercase">Prix</p>
                                                <p className="text-xs font-black text-gray-900 truncate">{fmt(t.prixBase)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {amenitiesList.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {amenitiesList.slice(0, 3).map((a, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">{a}</span>
                                            ))}
                                            {amenitiesList.length > 3 && (
                                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-semibold">+{amenitiesList.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                        <button onClick={() => { setEditingType(t); setShowModal(true) }}
                                                className="flex-1 px-3 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition hover:shadow-md"
                                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                            <Edit3 size={12}/> Modifier
                                        </button>
                                        <button onClick={() => setDeleteTarget(t)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <TypeModal
                isOpen={showModal}
                type={editingType}
                onSubmit={handleCreateOrUpdate}
                onClose={() => { setShowModal(false); setEditingType(null) }}
            />
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                type={deleteTarget}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    )
}
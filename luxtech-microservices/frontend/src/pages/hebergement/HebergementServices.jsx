import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Sparkles, Plus, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronDown, Edit3, Trash2, Clock, Users, DollarSign, Tag, Power, Image as ImageIcon
} from 'lucide-react'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const CATEGORIES_PREDEFINIES = [
    'Spa & Bien-être', 'Restauration', 'Transport', 'Loisirs & Activités',
    'Blanchisserie', 'Room Service', 'Excursions', 'Événementiel', 'Autre',
]

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)

const fmtDuree = (min) => {
    if (!min) return null
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const rest = min % 60
    return rest > 0 ? `${h}h${String(rest).padStart(2, '0')}` : `${h}h`
}

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

const DeleteConfirmModal = ({ isOpen, service, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(service.id) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !service) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-7 w-7 text-red-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Supprimer le service</h2>
                    <p className="text-sm text-gray-500 mt-1">Service <span className="font-bold">{service.nom}</span> — cette action est irréversible.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Supprimer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const ServiceModal = ({ isOpen, service, onSubmit, onClose }) => {
    const [categorieSelect, setCategorieSelect] = useState('')
    const [customCategorie, setCustomCategorie] = useState('')
    const [form, setForm] = useState({ nom: '', description: '', prix: '', duree: '', capaciteMax: '' })
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
            setExistingPhotoUrl(service?.imageUrl || null)

            if (service) {
                const isPredefinie = CATEGORIES_PREDEFINIES.includes(service.categorie)
                setCategorieSelect(isPredefinie ? service.categorie : '__custom__')
                setCustomCategorie(isPredefinie ? '' : (service.categorie || ''))
                setForm({
                    nom: service.nom || '',
                    description: service.description || '',
                    prix: service.prix ?? '',
                    duree: service.duree ?? '',
                    capaciteMax: service.capaciteMax ?? '',
                })
            } else {
                setCategorieSelect('')
                setCustomCategorie('')
                setForm({ nom: '', description: '', prix: '', duree: '', capaciteMax: '' })
            }
        }
    }, [isOpen, service])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

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
        const categorieFinale = categorieSelect === '__custom__' ? customCategorie.trim() : categorieSelect
        if (!form.nom.trim()) { setError('Le nom est obligatoire'); return }
        if (!categorieFinale) { setError('Veuillez sélectionner ou saisir une catégorie'); return }
        if (form.prix === '' || Number(form.prix) < 0) { setError('Le prix doit être renseigné'); return }
        setProcessing(true)
        try {
            await onSubmit({
                nom: form.nom.trim(),
                description: form.description || null,
                categorie: categorieFinale,
                prix: Number(form.prix),
                duree: form.duree !== '' ? Number(form.duree) : null,
                capaciteMax: form.capaciteMax !== '' ? Number(form.capaciteMax) : null,
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
                                <Sparkles size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                                    {service ? 'Modifier' : 'Nouveau'}
                                </p>
                                <h2 className="text-lg font-black text-white">{service ? service.nom : 'Service'}</h2>
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
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom du service *</label>
                        <input {...F('nom')} placeholder="Ex: Massage relaxant 60 min" className={ic}/>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Catégorie *</label>
                        <select value={categorieSelect} onChange={e => setCategorieSelect(e.target.value)} className={ic}>
                            <option value="">Sélectionnez une catégorie</option>
                            {CATEGORIES_PREDEFINIES.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="__custom__">✏️ Saisir une catégorie personnalisée...</option>
                        </select>
                        {categorieSelect === '__custom__' && (
                            <input type="text" value={customCategorie} onChange={e => setCustomCategorie(e.target.value)}
                                   placeholder="Ex: Sport nautique"
                                   className={ic + ' mt-2'} autoFocus/>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                        <textarea rows={3} {...F('description')} placeholder="Description du service..." className={ic}/>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Prix (MAD) *</label>
                            <input type="number" min="0" step="0.01" {...F('prix')} placeholder="0.00" className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Durée (min)</label>
                            <input type="number" min="0" {...F('duree')} placeholder="—" className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Capacité max</label>
                            <input type="number" min="1" {...F('capaciteMax')} placeholder="—" className={ic}/>
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
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> {service ? 'Enregistrer' : 'Créer'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementServices() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterCategorie, setFilterCategorie] = useState('ALL')
    const [filterStatut, setFilterStatut] = useState('ALL')
    const [sortBy, setSortBy] = useState('nom')
    const [showFilters, setShowFilters] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [editingService, setEditingService] = useState(null)
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
                const servicesRes = await hebergementAxios.get(`/hebergement/hebergements/${h.id}/services`).catch(() => null)
                setServices(servicesRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const categories = useMemo(() => [...new Set(services.map(s => s.categorie).filter(Boolean))], [services])

    const stats = useMemo(() => {
        const total = services.length
        const actifs = services.filter(s => s.isActive).length
        const prixMoyen = total > 0 ? services.reduce((s, x) => s + Number(x.prix || 0), 0) / total : 0
        return { total, actifs, prixMoyen, categories: categories.length }
    }, [services, categories])

    const filtered = useMemo(() => {
        let list = services.filter(s => {
            const q = search.toLowerCase()
            const matchSearch = !search || (s.nom || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
            const matchCat = filterCategorie === 'ALL' || s.categorie === filterCategorie
            const matchStatut = filterStatut === 'ALL' || (filterStatut === 'ACTIF' ? s.isActive : !s.isActive)
            return matchSearch && matchCat && matchStatut
        })
        list.sort((a, b) => {
            switch (sortBy) {
                case 'prix_asc': return Number(a.prix || 0) - Number(b.prix || 0)
                case 'prix_desc': return Number(b.prix || 0) - Number(a.prix || 0)
                case 'duree': return Number(b.duree || 0) - Number(a.duree || 0)
                default: return (a.nom || '').localeCompare(b.nom || '')
            }
        })
        return list
    }, [services, search, filterCategorie, filterStatut, sortBy])

    const handleCreateOrUpdate = async (data, photoFile) => {
        try {
            let serviceId = editingService?.id
            if (editingService) {
                await hebergementAxios.put(`/hebergement/services/${editingService.id}`, data)
            } else {
                const res = await hebergementAxios.post(`/hebergement/hebergements/${hebergement.id}/services`, data)
                serviceId = res?.data?.data?.id
            }
            if (photoFile && serviceId) {
                const formData = new FormData()
                formData.append('photo', photoFile)
                await hebergementAxios.post(`/hebergement/services/${serviceId}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }
            showToast(editingService ? 'Service mis à jour !' : 'Service créé !')
            setShowModal(false)
            setEditingService(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleToggleStatus = async (id) => {
        try {
            await hebergementAxios.patch(`/hebergement/services/${id}/toggle-status`)
            showToast('Statut modifié.')
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    const handleDelete = async (id) => {
        try {
            await hebergementAxios.delete(`/hebergement/services/${id}`)
            showToast('Service supprimé.')
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
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des services</p>
                        <h1 className="text-2xl font-black text-white">Services</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} service{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <button onClick={() => { setEditingService(null); setShowModal(true) }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Nouveau service
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total services" value={stats.total}               icon={Sparkles} color="#5D2E8B" bg="#f3e8ff"/>
                <KPICard title="Actifs"         value={stats.actifs}              icon={Power}    color="#059669" bg="#d1fae5"/>
                <KPICard title="Prix moyen"     value={fmt(stats.prixMoyen)}      icon={DollarSign} color="#d97706" bg="#fef3c7"/>
                <KPICard title="Catégories"     value={stats.categories}          icon={Tag}      color="#2563eb" bg="#dbeafe"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher un service..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterCategorie !== 'ALL' || filterStatut !== 'ALL'
                                    ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/>
                        Filtres
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || filterCategorie !== 'ALL' || filterStatut !== 'ALL') && (
                        <button onClick={() => { setSearch(''); setFilterCategorie('ALL'); setFilterStatut('ALL') }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Catégorie</label>
                            <select value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)} className={inputCls + ' w-full'}>
                                <option value="ALL">Toutes les catégories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Statut</label>
                            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous</option>
                                <option value="ACTIF">Actifs</option>
                                <option value="INACTIF">Inactifs</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Trier par</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputCls + ' w-full'}>
                                <option value="nom">Nom (A-Z)</option>
                                <option value="prix_asc">Prix (bas → haut)</option>
                                <option value="prix_desc">Prix (haut → bas)</option>
                                <option value="duree">Durée (haut → bas)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-400 font-medium">Chargement des services...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                         style={{ background: `linear-gradient(135deg, ${PURPLE}15, ${CYAN}15)` }}>
                        <Sparkles size={32} style={{ color: PURPLE }}/>
                    </div>
                    <p className="text-gray-700 font-bold text-lg mb-1">Aucun service trouvé</p>
                    <p className="text-gray-400 text-sm mb-4">Créez votre premier service (spa, transfert, excursion...)</p>
                    <button onClick={() => { setEditingService(null); setShowModal(true) }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        <Plus size={15}/> Créer un service
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(s => {
                        const dureeLabel = fmtDuree(s.duree)
                        return (
                            <div key={s.id} className={`group bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                                s.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'
                            }`}>
                                <div className="relative h-32 overflow-hidden" style={s.imageUrl ? {} : { background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                                    {s.imageUrl ? (
                                        <img src={s.imageUrl} alt={s.nom} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={32} className="text-white/40"/>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
                                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-sm text-white text-[10px] font-black ${
                                        s.isActive ? 'bg-emerald-500/80' : 'bg-gray-500/80'
                                    }`}>
                                        {s.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-black">
                                        {s.categorie}
                                    </span>
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <h3 className="text-lg font-black text-white truncate">{s.nom}</h3>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {s.description && (
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed h-8">{s.description}</p>
                                    )}

                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100/50">
                                            <DollarSign size={13} className="text-emerald-600 shrink-0"/>
                                            <p className="text-xs font-black text-gray-900 truncate">{fmt(s.prix)}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/60 border border-blue-100/50">
                                            <Clock size={13} className="text-blue-600 shrink-0"/>
                                            <p className="text-xs font-bold text-gray-700 truncate">{dureeLabel || '—'}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-orange-50/60 border border-orange-100/50">
                                            <Users size={13} className="text-orange-600 shrink-0"/>
                                            <p className="text-xs font-bold text-gray-700 truncate">{s.capaciteMax ?? '—'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                        <button onClick={() => handleToggleStatus(s.id)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
                                                    s.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-600 hover:text-white'
                                                }`}
                                                title={s.isActive ? 'Désactiver' : 'Activer'}>
                                            <Power size={14}/>
                                        </button>
                                        <button onClick={() => { setEditingService(s); setShowModal(true) }}
                                                className="flex-1 px-3 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition hover:shadow-md"
                                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                            <Edit3 size={12}/> Modifier
                                        </button>
                                        <button onClick={() => setDeleteTarget(s)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shrink-0">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <ServiceModal
                isOpen={showModal}
                service={editingService}
                onSubmit={handleCreateOrUpdate}
                onClose={() => { setShowModal(false); setEditingService(null) }}
            />
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                service={deleteTarget}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    )
}
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Calendar, Plus, Search, X, Check, RefreshCw, AlertTriangle,
    Edit2, Trash2, DollarSign, Percent, Tag
} from 'lucide-react'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

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

const DeleteConfirmModal = ({ isOpen, season, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(season) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !season) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-7 w-7 text-red-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Supprimer la saison</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Saison <span className="font-bold">{season.nom}</span> — supprimera l'ajustement pour {season.entries.length} type{season.entries.length > 1 ? 's' : ''} de chambre.
                    </p>
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

const SeasonModal = ({ isOpen, season, chambreTypes, onSubmit, onClose }) => {
    const [form, setForm] = useState({ nom: '', dateDebut: '', dateFin: '', typeAjustement: 'FIXE' })
    const [valeurs, setValeurs] = useState({})
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            if (season) {
                setForm({
                    nom: season.nom,
                    dateDebut: season.dateDebut,
                    dateFin: season.dateFin,
                    typeAjustement: season.typeAjustement,
                })
                const v = {}
                season.entries.forEach(e => { v[e.chambreTypeId] = e.valeurAjustement })
                setValeurs(v)
            } else {
                setForm({ nom: '', dateDebut: '', dateFin: '', typeAjustement: 'FIXE' })
                setValeurs({})
            }
        }
    }, [isOpen, season])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const handleValeurChange = (typeId, value) => {
        setValeurs(prev => ({ ...prev, [typeId]: value === '' ? undefined : Number(value) }))
    }

    const handleSubmit = async () => {
        if (!form.nom.trim()) { setError('Le nom de la saison est obligatoire'); return }
        if (!form.dateDebut || !form.dateFin) { setError('Les dates début et fin sont obligatoires'); return }
        if (new Date(form.dateFin) <= new Date(form.dateDebut)) { setError('La date de fin doit être après la date de début'); return }
        const entries = Object.entries(valeurs).filter(([, v]) => v !== undefined && v !== null && !Number.isNaN(v))
        if (entries.length === 0) { setError('Renseignez au moins un ajustement pour un type de chambre'); return }

        setProcessing(true)
        try {
            await onSubmit({
                nom: form.nom.trim(),
                dateDebut: form.dateDebut,
                dateFin: form.dateFin,
                typeAjustement: form.typeAjustement,
                entries: entries.map(([chambreTypeId, valeurAjustement]) => ({ chambreTypeId: Number(chambreTypeId), valeurAjustement })),
            }, season)
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Calendar size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                                    {season ? 'Modifier' : 'Nouvelle'}
                                </p>
                                <h2 className="text-lg font-black text-white">Saison tarifaire</h2>
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
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom de la saison *</label>
                        <input {...F('nom')} placeholder="Ex: Été, Haute saison, Vacances scolaires..." className={ic}/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Date début *</label>
                            <input type="date" {...F('dateDebut')} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Date fin *</label>
                            <input type="date" {...F('dateFin')} className={ic}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Type d'ajustement</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setForm(p => ({ ...p, typeAjustement: 'FIXE' }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                        form.typeAjustement === 'FIXE' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                    }`}>
                                <DollarSign size={14}/> Montant fixe
                            </button>
                            <button type="button" onClick={() => setForm(p => ({ ...p, typeAjustement: 'POURCENTAGE' }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                        form.typeAjustement === 'POURCENTAGE' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                    }`}>
                                <Percent size={14}/> Pourcentage
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Ajustement par type de chambre</label>
                        {chambreTypes.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Aucun type de chambre défini</p>
                        ) : (
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {chambreTypes.map(t => (
                                    <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100">
                                        <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{t.nom}</span>
                                        <input type="number" step="0.01" value={valeurs[t.id] ?? ''}
                                               onChange={e => handleValeurChange(t.id, e.target.value)}
                                               placeholder="0"
                                               className="w-24 px-3 py-1.5 border-2 border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#66CAD8]"/>
                                        <span className="text-xs text-gray-400 font-semibold w-10">
                                            {form.typeAjustement === 'POURCENTAGE' ? '%' : 'MAD'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[11px] text-gray-400 mt-2">Laissez vide les types non concernés par cette saison.</p>
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
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> {season ? 'Enregistrer' : 'Créer'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementTarifsSaisonniers() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [chambreTypes, setChambreTypes] = useState([])
    const [tarifs, setTarifs] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingSeason, setEditingSeason] = useState(null)
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
                const [typesRes, tarifsRes] = await Promise.all([
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambre-types`).catch(() => null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/tarifs-saisonniers`).catch(() => null),
                ])
                setChambreTypes(typesRes?.data?.data || [])
                setTarifs(tarifsRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    // Regroupe les lignes backend (une par type) en "saisons" pour l'affichage — même logique visuelle que la référence
    const seasons = useMemo(() => {
        const groups = {}
        tarifs.forEach(t => {
            if (!t.chambreTypeId) return // ignore les tarifs ciblant une chambre précise (hors périmètre de ce regroupement)
            const key = `${t.nom}__${t.dateDebut}__${t.dateFin}__${t.typeAjustement}`
            if (!groups[key]) {
                groups[key] = { key, nom: t.nom, dateDebut: t.dateDebut, dateFin: t.dateFin, typeAjustement: t.typeAjustement, entries: [] }
            }
            groups[key].entries.push(t)
        })
        return Object.values(groups).sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))
    }, [tarifs])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return seasons.filter(s => !search || s.nom.toLowerCase().includes(q))
    }, [seasons, search])

    const stats = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const actives = seasons.filter(s => {
            const d = new Date(s.dateDebut), f = new Date(s.dateFin)
            return today >= d && today <= f
        }).length
        const avenir = seasons.filter(s => new Date(s.dateDebut) > today).length
        return { total: seasons.length, actives, avenir }
    }, [seasons])

    const handleCreateOrUpdate = async (data, existingSeason) => {
        try {
            if (existingSeason) {
                // Supprime les anciennes lignes du groupe, puis recrée — simple et fiable
                await Promise.all(existingSeason.entries.map(e => hebergementAxios.delete(`/hebergement/tarifs-saisonniers/${e.id}`)))
            }
            await Promise.all(data.entries.map(entry =>
                hebergementAxios.post(`/hebergement/hebergements/${hebergement.id}/tarifs-saisonniers`, {
                    nom: data.nom,
                    chambreTypeId: entry.chambreTypeId,
                    dateDebut: data.dateDebut,
                    dateFin: data.dateFin,
                    typeAjustement: data.typeAjustement,
                    valeurAjustement: entry.valeurAjustement,
                })
            ))
            showToast(existingSeason ? 'Saison mise à jour !' : 'Saison créée !')
            setShowModal(false)
            setEditingSeason(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (season) => {
        try {
            await Promise.all(season.entries.map(e => hebergementAxios.delete(`/hebergement/tarifs-saisonniers/${e.id}`)))
            showToast('Saison supprimée.')
            setDeleteTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de la suppression.', 'error')
        }
    }

    const isActive = (s) => {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const d = new Date(s.dateDebut), f = new Date(s.dateFin)
        return today >= d && today <= f
    }

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
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des prix</p>
                        <h1 className="text-2xl font-black text-white">Tarifs saisonniers</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} saison{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <button onClick={() => { setEditingSeason(null); setShowModal(true) }}
                                disabled={chambreTypes.length === 0}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg disabled:opacity-50"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Ajouter une saison
                        </button>
                    </div>
                </div>
            </div>

            {chambreTypes.length === 0 && !loading && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0"/>
                    <p className="text-sm text-amber-800 font-medium">
                        Créez d'abord un type de chambre avant d'ajouter des tarifs saisonniers.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <KPICard title="Saisons totales" value={stats.total}   icon={Calendar} color="#5D2E8B" bg="#f3e8ff"/>
                <KPICard title="Actives"         value={stats.actives} icon={Check}    color="#059669" bg="#d1fae5"/>
                <KPICard title="À venir"         value={stats.avenir}  icon={Tag}      color="#2563eb" bg="#dbeafe"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Rechercher une saison..."
                           value={search} onChange={e => setSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-400 font-medium">Chargement des tarifs saisonniers...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                         style={{ background: `linear-gradient(135deg, ${PURPLE}15, ${CYAN}15)` }}>
                        <Calendar size={32} style={{ color: PURPLE }}/>
                    </div>
                    <p className="text-gray-700 font-bold text-lg mb-1">Aucune saison définie</p>
                    <p className="text-gray-400 text-sm mb-4">Créez votre première saison tarifaire (été, haute saison...)</p>
                    <button onClick={() => { setEditingSeason(null); setShowModal(true) }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        <Plus size={15}/> Créer une saison
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(s => {
                        const active = isActive(s)
                        return (
                            <div key={s.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                                             style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                                            <Calendar size={16}/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-gray-900">{s.nom}</h3>
                                                {active && (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(s.dateDebut)} → {fmtDate(s.dateFin)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setEditingSeason(s); setShowModal(true) }}
                                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Modifier">
                                            <Edit2 size={15}/>
                                        </button>
                                        <button onClick={() => setDeleteTarget(s)}
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition" title="Supprimer">
                                            <Trash2 size={15}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                                        {s.typeAjustement === 'POURCENTAGE' ? <Percent size={11}/> : <DollarSign size={11}/>}
                                        {s.typeAjustement === 'POURCENTAGE' ? 'Pourcentage' : 'Montant fixe'}
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {s.entries.map(e => (
                                            <div key={e.id} className="flex justify-between text-sm px-2">
                                                <span className="text-gray-600 truncate">{e.chambreTypeNom}</span>
                                                <span className="font-black text-gray-900 shrink-0 ml-2">
                                                    {e.valeurAjustement > 0 ? '+' : ''}{e.valeurAjustement}{s.typeAjustement === 'POURCENTAGE' ? '%' : ' MAD'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <SeasonModal
                isOpen={showModal}
                season={editingSeason}
                chambreTypes={chambreTypes}
                onSubmit={handleCreateOrUpdate}
                onClose={() => { setShowModal(false); setEditingSeason(null) }}
            />
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                season={deleteTarget}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    )
}
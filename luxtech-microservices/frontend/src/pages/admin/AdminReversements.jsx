import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Landmark, Search, RefreshCw, AlertTriangle, Check, X, Plus,
    Building2, Calendar, TrendingUp, Filter, ChevronDown, RotateCcw
} from 'lucide-react'
import { hebergementAxios, paymentAxios, bookingAxios } from '../../api/axios'
import axios from '../../api/axios'

const NAVY = '#1D2252', CYAN = '#66CAD8', PURPLE = '#5D2E8B'

const STATUS_CONFIG = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
    EFFECTUE: { label: 'Effectué', cls: 'bg-emerald-50 text-emerald-700' },
    ECHEC: { label: 'Échec', cls: 'bg-red-50 text-red-600' },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
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

const CreateReversementModal = ({ isOpen, hebergements, onSubmit, onClose }) => {
    const [hotelId, setHotelId] = useState('')
    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [calculating, setCalculating] = useState(false)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setHotelId(''); setDateDebut(''); setDateFin(''); setPreview(null); setError('')
        }
    }, [isOpen])

    const handleCalculer = async () => {
        if (!hotelId || !dateDebut || !dateFin) { setError('Choisissez un établissement et une période'); return }
        setError('')
        setCalculating(true)
        try {
            const hebergement = hebergements.find(h => String(h.id) === String(hotelId))
            const res = await bookingAxios.get(`/booking/reservations/hotel/${hotelId}`)
            const all = res.data?.data || []
            const inPeriod = all.filter(r => {
                const created = new Date(r.createdAt).toISOString().slice(0, 10)
                return created >= dateDebut && created <= dateFin && r.status !== 'ANNULEE' && Number(r.montantPaye) > 0
            })
            const montantBrut = inPeriod.reduce((s, r) => s + Number(r.montantPaye || 0), 0)
            const taux = Number(hebergement?.commissionTaux || 0)
            const montantCommission = montantBrut * (taux / 100)
            const montantNet = montantBrut - montantCommission
            setPreview({ montantBrut, montantCommission, montantNet, nbReservations: inPeriod.length, taux })
        } catch (err) {
            setError('Erreur lors du calcul.')
        } finally {
            setCalculating(false)
        }
    }

    const handleSubmit = async () => {
        if (!preview) return
        setProcessing(true)
        try {
            await onSubmit({
                hotelId: Number(hotelId),
                montantBrut: preview.montantBrut,
                montantCommission: preview.montantCommission,
                montantNet: preview.montantNet,
                periodeDebut: dateDebut,
                periodeFin: dateFin,
                nbReservations: preview.nbReservations,
            })
        } catch (err) {
            setError(err.message || 'Erreur.')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null
    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Landmark size={18}/></div>
                            <h2 className="text-lg font-black text-white">Nouveau reversement</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18}/></button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2"><AlertTriangle size={14}/>{error}</div>}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Établissement</label>
                        <select value={hotelId} onChange={e => { setHotelId(e.target.value); setPreview(null) }} className={ic}>
                            <option value="">Sélectionner...</option>
                            {hebergements.map(h => <option key={h.id} value={h.id}>{h.nom} ({h.commissionTaux || 0}%)</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Du</label>
                            <input type="date" value={dateDebut} onChange={e => { setDateDebut(e.target.value); setPreview(null) }} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Au</label>
                            <input type="date" value={dateFin} min={dateDebut} onChange={e => { setDateFin(e.target.value); setPreview(null) }} className={ic}/>
                        </div>
                    </div>
                    <button onClick={handleCalculer} disabled={calculating}
                            className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {calculating ? <RefreshCw size={15} className="animate-spin"/> : 'Calculer le montant'}
                    </button>

                    {preview && (
                        <div className="rounded-2xl p-4 space-y-2" style={{ background: `${CYAN}10`, border: `1.5px solid ${CYAN}30` }}>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Réservations trouvées</span><span className="font-bold">{preview.nbReservations}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Montant brut encaissé</span><span className="font-bold">{fmt(preview.montantBrut)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Commission ({preview.taux}%)</span><span className="font-bold text-red-500">-{fmt(preview.montantCommission)}</span></div>
                            <div className="flex justify-between text-base pt-2 border-t border-gray-200"><span className="font-bold text-gray-900">Net à reverser</span><span className="font-black" style={{ color: NAVY }}>{fmt(preview.montantNet)}</span></div>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">Annuler</button>
                    <button onClick={handleSubmit} disabled={processing || !preview}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Créer le reversement</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

const EffectuerModal = ({ target, onConfirm, onClose }) => {
    const [reference, setReference] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => { if (target) setReference('') }, [target])

    const handleSubmit = async () => {
        setProcessing(true)
        try { await onConfirm(reference) }
        finally { setProcessing(false) }
    }

    if (!target) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Check className="h-7 w-7 text-emerald-600"/></div>
                    <h2 className="text-lg font-black text-gray-900">Confirmer le virement</h2>
                    <p className="text-sm text-gray-500 mt-1">{fmt(target.montantNet)}</p>
                </div>
                <input placeholder="Référence du virement (optionnel)" value={reference} onChange={e => setReference(e.target.value)}
                       className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 mb-4"/>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">Annuler</button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminReversements() {
    const [reversements, setReversements] = useState([])
    const [hebergements, setHebergements] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [showCreate, setShowCreate] = useState(false)
    const [effectuerTarget, setEffectuerTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const [revRes, hebergRes] = await Promise.all([
                paymentAxios.get('/payment/reversements').catch(() => null),
                hebergementAxios.get('/hebergement/hebergements').catch(() => null),
            ])
            setReversements(revRes?.data?.data || [])
            setHebergements(hebergRes?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const hotelMap = useMemo(() => Object.fromEntries(hebergements.map(h => [h.id, h.nom])), [hebergements])

    const enriched = useMemo(() => reversements.map(r => ({ ...r, hotelNom: hotelMap[r.hotelId] || `#${r.hotelId}` })), [reversements, hotelMap])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return enriched.filter(r => {
            const matchSearch = !search || r.hotelNom.toLowerCase().includes(q)
            const matchStatus = filterStatus === 'ALL' || r.statut === filterStatus
            return matchSearch && matchStatus
        })
    }, [enriched, search, filterStatus])

    const stats = useMemo(() => ({
        total: reversements.length,
        enAttente: reversements.filter(r => r.statut === 'EN_ATTENTE').length,
        montantEnAttente: reversements.filter(r => r.statut === 'EN_ATTENTE').reduce((s, r) => s + Number(r.montantNet || 0), 0),
        montantEffectue: reversements.filter(r => r.statut === 'EFFECTUE').reduce((s, r) => s + Number(r.montantNet || 0), 0),
    }), [reversements])

    const handleCreate = async (data) => {
        try {
            await paymentAxios.post('/payment/reversements', data)
            showToast('Reversement créé !')
            setShowCreate(false)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur.')
        }
    }

    const handleEffectuer = async (referenceVirement) => {
        try {
            await paymentAxios.post(`/payment/reversements/${effectuerTarget.id}/effectuer`, { referenceVirement })
            showToast('Reversement marqué comme effectué !')
            setEffectuerTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast('Erreur.', 'error')
        }
    }

    const handleEchec = async (id) => {
        try {
            await paymentAxios.post(`/payment/reversements/${id}/echec`)
            showToast('Marqué en échec.')
            await fetchData(true)
        } catch (err) {
            showToast('Erreur.', 'error')
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-24"><RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/></div>
    }

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

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

            <div className="rounded-2xl shadow-md p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Réservations et Paiements</p>
                        <h1 className="text-2xl font-black text-white">Reversements</h1>
                        <p className="text-white/60 text-sm mt-1">{filtered.length} reversement{filtered.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> Actualiser
                        </button>
                        <button onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Nouveau
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total reversements" value={stats.total} icon={Landmark} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="En attente" value={stats.enAttente} icon={Calendar} color="#d97706" bg="#fef3c7"/>
                <KPICard title="Montant en attente" value={fmt(stats.montantEnAttente)} icon={TrendingUp} color="#d97706" bg="#fef3c7"/>
                <KPICard title="Montant reversé" value={fmt(stats.montantEffectue)} icon={Check} color="#059669" bg="#d1fae5"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Établissement..." value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterStatus !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600'
                            }`}>
                        <Filter size={15}/> Filtres <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
                            <option value="ALL">Tous les statuts</option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}><Landmark size={32} style={{ color: CYAN }}/></div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucun reversement</p>
                        <p className="text-gray-400 text-sm">Créez-en un pour un établissement et une période donnée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Établissement', 'Période', 'Brut', 'Commission', 'Net', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map(r => {
                                const cfg = STATUS_CONFIG[r.statut] || { label: r.statut, cls: 'bg-gray-100 text-gray-600' }
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50/80 transition">
                                        <td className="px-5 py-4"><span className="flex items-center gap-1.5 text-sm font-bold text-gray-900"><Building2 size={12} className="text-gray-400"/> {r.hotelNom}</span></td>
                                        <td className="px-5 py-4"><p className="text-sm text-gray-700">{fmtDate(r.periodeDebut)} → {fmtDate(r.periodeFin)}</p></td>
                                        <td className="px-5 py-4"><span className="text-sm text-gray-700">{fmt(r.montantBrut)}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm text-red-500">-{fmt(r.montantCommission)}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm font-black" style={{ color: NAVY }}>{fmt(r.montantNet)}</span></td>
                                        <td className="px-5 py-4"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span></td>
                                        <td className="px-5 py-4">
                                            {r.statut === 'EN_ATTENTE' && (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setEffectuerTarget(r)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition" title="Marquer effectué"><Check size={14}/></button>
                                                    <button onClick={() => handleEchec(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition" title="Marquer en échec"><RotateCcw size={14}/></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateReversementModal isOpen={showCreate} hebergements={hebergements} onSubmit={handleCreate} onClose={() => setShowCreate(false)}/>
            <EffectuerModal target={effectuerTarget} onConfirm={handleEffectuer} onClose={() => setEffectuerTarget(null)}/>
        </div>
    )
}
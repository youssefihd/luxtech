import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Percent, Search, RefreshCw, AlertTriangle, Check, X, Edit3,
    Building2, TrendingUp, CreditCard, Filter, ChevronDown
} from 'lucide-react'
import { hebergementAxios, paymentAxios } from '../../api/axios'

const NAVY = '#1D2252', CYAN = '#66CAD8', PURPLE = '#5D2E8B'

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

const EditCommissionModal = ({ hebergement, onConfirm, onClose }) => {
    const [taux, setTaux] = useState(hebergement?.commissionTaux || 10)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { if (hebergement) setTaux(hebergement.commissionTaux || 10) }, [hebergement])

    const handleSubmit = async () => {
        const val = Number(taux)
        if (isNaN(val) || val < 0 || val > 100) { setError('Le taux doit être entre 0 et 100'); return }
        setProcessing(true)
        try { await onConfirm(val) }
        catch (err) { setError(err.message || 'Erreur') }
        finally { setProcessing(false) }
    }

    if (!hebergement) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
                <div className="p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Commission</p>
                            <h2 className="text-lg font-black text-white">{hebergement.nom}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18}/></button>
                    </div>
                </div>
                <div className="p-6">
                    {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2"><AlertTriangle size={14}/>{error}</div>}
                    <label className="block text-xs font-bold text-gray-500 mb-2">Taux de commission (%)</label>
                    <div className="relative">
                        <input type="number" min="0" max="100" step="0.5" value={taux} onChange={e => setTaux(e.target.value)}
                               className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:border-[#66CAD8] transition"/>
                        <Percent size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Prélevé sur chaque réservation de cet établissement.</p>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100">
                    <button onClick={onClose} disabled={processing} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">Annuler</button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={15} className="animate-spin"/> : <><Check size={15}/> Enregistrer</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminCommissions() {
    const [hebergements, setHebergements] = useState([])
    const [abonnementsActifs, setAbonnementsActifs] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterMode, setFilterMode] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const [hebergRes, aboRes] = await Promise.all([
                hebergementAxios.get('/hebergement/hebergements').catch(() => null),
                paymentAxios.get('/payment/abonnements/actifs').catch(() => null),
            ])
            setHebergements(hebergRes?.data?.data || [])
            setAbonnementsActifs(aboRes?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const hotelIdsAbonnes = useMemo(() => new Set(abonnementsActifs.map(a => a.hotelId)), [abonnementsActifs])

    const enriched = useMemo(() => hebergements.map(h => ({
        ...h,
        mode: hotelIdsAbonnes.has(h.id) ? 'ABONNEMENT' : 'COMMISSION',
    })), [hebergements, hotelIdsAbonnes])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return enriched.filter(h => {
            const matchSearch = !search || (h.nom || '').toLowerCase().includes(q) || (h.ville || '').toLowerCase().includes(q)
            const matchMode = filterMode === 'ALL' || h.mode === filterMode
            return matchSearch && matchMode
        })
    }, [enriched, search, filterMode])

    const stats = useMemo(() => {
        const commission = enriched.filter(h => h.mode === 'COMMISSION')
        return {
            total: enriched.length,
            commission: commission.length,
            abonnement: enriched.length - commission.length,
            tauxMoyen: commission.length > 0 ? commission.reduce((s, h) => s + Number(h.commissionTaux || 0), 0) / commission.length : 0,
        }
    }, [enriched])

    const handleUpdateCommission = async (taux) => {
        try {
            await hebergementAxios.patch(`/hebergement/hebergements/${editTarget.id}/commission`, { commissionTaux: taux })
            showToast('Commission mise à jour !')
            setEditTarget(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur.')
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-24"><RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/></div>
    }

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
                        <h1 className="text-2xl font-black text-white">Commissions</h1>
                        <p className="text-white/60 text-sm mt-1">{filtered.length} établissement{filtered.length > 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50 shrink-0">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> Actualiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total établissements" value={stats.total} icon={Building2} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Mode Commission" value={stats.commission} icon={Percent} color="#d97706" bg="#fef3c7"/>
                <KPICard title="Mode Abonnement" value={stats.abonnement} icon={CreditCard} color="#059669" bg="#d1fae5"/>
                <KPICard title="Taux moyen" value={`${stats.tauxMoyen.toFixed(1)}%`} icon={TrendingUp} color={PURPLE} bg="#f3e8ff"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Nom, ville..." value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterMode !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600'
                            }`}>
                        <Filter size={15}/> Filtres <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                            {[
                                { key: 'ALL', label: 'Tous' },
                                { key: 'COMMISSION', label: 'Commission' },
                                { key: 'ABONNEMENT', label: 'Abonnement' },
                            ].map(opt => (
                                <button key={opt.key} onClick={() => setFilterMode(opt.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                            filterMode === opt.key ? 'text-white' : 'bg-gray-100 text-gray-500'
                                        }`}
                                        style={filterMode === opt.key ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}><Percent size={32} style={{ color: CYAN }}/></div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucun établissement trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Établissement', 'Ville', 'Mode', 'Taux commission', 'Action'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map(h => (
                                <tr key={h.id} className="hover:bg-gray-50/80 transition">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-gray-400"/>
                                            <span className="text-sm font-bold text-gray-900">{h.nom}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><span className="text-sm text-gray-600">{h.ville || '—'}</span></td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            h.mode === 'ABONNEMENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {h.mode === 'ABONNEMENT' ? <CreditCard size={11}/> : <Percent size={11}/>}
                                            {h.mode === 'ABONNEMENT' ? 'Abonnement' : 'Commission'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {h.mode === 'COMMISSION' ? (
                                            <span className="text-sm font-black text-gray-900">{Number(h.commissionTaux || 0).toFixed(1)}%</span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Non applicable</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {h.mode === 'COMMISSION' ? (
                                            <button onClick={() => setEditTarget(h)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:shadow"
                                                    style={{ background: `${CYAN}15`, color: NAVY }}>
                                                <Edit3 size={12}/> Modifier
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-300">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <EditCommissionModal hebergement={editTarget} onConfirm={handleUpdateCommission} onClose={() => setEditTarget(null)}/>
        </div>
    )
}
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Zap, Search, RefreshCw, AlertTriangle, ExternalLink, Copy,
    Building2, TrendingUp, Calendar, Filter, ChevronDown, Check, X
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'

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

export default function AdminBookingEngine() {
    const [hebergements, setHebergements] = useState([])
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterActif, setFilterActif] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const [hebergRes, resaRes] = await Promise.all([
                hebergementAxios.get('/hebergement/hebergements').catch(() => null),
                bookingAxios.get('/booking/reservations/all').catch(() => null),
            ])
            setHebergements(hebergRes?.data?.data || [])
            setReservations(resaRes?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const bookingEngineReservations = useMemo(() =>
            reservations.filter(r => r.source === 'BOOKING_ENGINE')
        , [reservations])

    const statsByHotel = useMemo(() => {
        const map = {}
        bookingEngineReservations.forEach(r => {
            if (!map[r.hotelId]) map[r.hotelId] = { nb: 0, revenus: 0 }
            map[r.hotelId].nb += 1
            map[r.hotelId].revenus += Number(r.montantPaye || 0)
        })
        return map
    }, [bookingEngineReservations])

    const enriched = useMemo(() => hebergements.map(h => ({
        ...h,
        nbReservationsBE: statsByHotel[h.id]?.nb || 0,
        revenusBE: statsByHotel[h.id]?.revenus || 0,
    })), [hebergements, statsByHotel])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return enriched.filter(h => {
            const matchSearch = !search || (h.nom || '').toLowerCase().includes(q) || (h.ville || '').toLowerCase().includes(q)
            const matchActif = filterActif === 'ALL'
                || (filterActif === 'ACTIF' && h.bookingEngineActif)
                || (filterActif === 'INACTIF' && !h.bookingEngineActif)
            return matchSearch && matchActif
        }).sort((a, b) => b.nbReservationsBE - a.nbReservationsBE)
    }, [enriched, search, filterActif])

    const stats = useMemo(() => ({
        total: hebergements.length,
        actifs: hebergements.filter(h => h.bookingEngineActif).length,
        totalReservations: bookingEngineReservations.length,
        revenusTotal: bookingEngineReservations.reduce((s, r) => s + Number(r.montantPaye || 0), 0),
    }), [hebergements, bookingEngineReservations])

    const handleCopyLink = (slug) => {
        const url = `${window.location.origin}/reserver/${slug}`
        navigator.clipboard.writeText(url)
        showToast('Lien copié !')
    }

    if (loading) {
        return <div className="flex items-center justify-center py-24"><RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/></div>
    }

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            {toast && (
                <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border bg-emerald-500 border-emerald-400">
                    <Check size={15}/> {toast}
                </div>
            )}

            <div className="rounded-2xl shadow-md p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Distribution</p>
                        <h1 className="text-2xl font-black text-white">Booking Engine</h1>
                        <p className="text-white/60 text-sm mt-1">Vue globale sur tous les établissements</p>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50 shrink-0">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> Actualiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total établissements" value={stats.total} icon={Building2} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Booking Engine actif" value={stats.actifs} icon={Zap} color="#059669" bg="#d1fae5"/>
                <KPICard title="Réservations générées" value={stats.totalReservations} icon={Calendar} color="#d97706" bg="#fef3c7"/>
                <KPICard title="Revenus générés" value={fmt(stats.revenusTotal)} icon={TrendingUp} color={PURPLE} bg="#f3e8ff"/>
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
                                showFilters || filterActif !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600'
                            }`}>
                        <Filter size={15}/> Filtres <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                            {[{ key: 'ALL', label: 'Tous' }, { key: 'ACTIF', label: 'Actifs' }, { key: 'INACTIF', label: 'Inactifs' }].map(opt => (
                                <button key={opt.key} onClick={() => setFilterActif(opt.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterActif === opt.key ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                                        style={filterActif === opt.key ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
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
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}><Zap size={32} style={{ color: CYAN }}/></div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucun établissement trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Établissement', 'Statut', 'Réservations', 'Revenus générés', 'Lien public'].map(h => (
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
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{h.nom}</p>
                                                <p className="text-xs text-gray-400">{h.ville}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            h.bookingEngineActif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {h.bookingEngineActif ? <Zap size={11}/> : <X size={11}/>}
                                            {h.bookingEngineActif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4"><span className="text-sm font-black text-gray-900">{h.nbReservationsBE}</span></td>
                                    <td className="px-5 py-4"><span className="text-sm font-black text-emerald-600">{fmt(h.revenusBE)}</span></td>
                                    <td className="px-5 py-4">
                                        {h.slug ? (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleCopyLink(h.slug)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" title="Copier le lien"><Copy size={14}/></button>
                                                <a href={`/reserver/${h.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" title="Ouvrir"><ExternalLink size={14}/></a>
                                            </div>
                                        ) : <span className="text-xs text-gray-300">—</span>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
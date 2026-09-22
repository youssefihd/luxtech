import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Globe, RefreshCw, TrendingUp, Building2, Calendar, PieChart,
    Zap, Users, Store
} from 'lucide-react'
import { bookingAxios, hebergementAxios } from '../../api/axios'

const NAVY = '#1D2252', CYAN = '#66CAD8', PURPLE = '#5D2E8B'
const CHANNEL_COLORS = ['#2563eb', '#059669', '#d97706', '#5D2E8B', '#dc2626', '#0891b2']
const CHANNEL_ICONS = { DIRECT: Users, BOOKING_ENGINE: Zap, AGENCE: Store }

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const formatLabel = (s) => s ? s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : 'Inconnu'

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

export default function AdminDistribution() {
    const [reservations, setReservations] = useState([])
    const [hebergements, setHebergements] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const [resaRes, hebergRes] = await Promise.all([
                bookingAxios.get('/booking/reservations/all').catch(() => null),
                hebergementAxios.get('/hebergement/hebergements').catch(() => null),
            ])
            setReservations(resaRes?.data?.data || [])
            setHebergements(hebergRes?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const hotelMap = useMemo(() => Object.fromEntries(hebergements.map(h => [h.id, h.nom])), [hebergements])

    const active = useMemo(() => reservations.filter(r => r.status !== 'ANNULEE'), [reservations])

    const channelStats = useMemo(() => {
        const map = {}
        active.forEach(r => {
            const key = r.source || 'INCONNU'
            if (!map[key]) map[key] = { nb: 0, revenus: 0 }
            map[key].nb += 1
            map[key].revenus += Number(r.montantPaye || 0)
        })
        return Object.entries(map)
            .map(([source, data]) => ({ source, ...data }))
            .sort((a, b) => b.nb - a.nb)
    }, [active])

    const totalReservations = active.length
    const totalRevenus = active.reduce((s, r) => s + Number(r.montantPaye || 0), 0)

    const hotelChannelBreakdown = useMemo(() => {
        const map = {}
        active.forEach(r => {
            if (!map[r.hotelId]) map[r.hotelId] = {}
            const key = r.source || 'INCONNU'
            map[r.hotelId][key] = (map[r.hotelId][key] || 0) + 1
        })
        return Object.entries(map).map(([hotelId, channels]) => ({
            hotelId: Number(hotelId),
            hotelNom: hotelMap[hotelId] || `#${hotelId}`,
            channels,
            total: Object.values(channels).reduce((s, v) => s + v, 0),
        })).sort((a, b) => b.total - a.total)
    }, [active, hotelMap])

    if (loading) {
        return <div className="flex items-center justify-center py-24"><RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/></div>
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            <div className="rounded-2xl shadow-md p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Distribution</p>
                        <h1 className="text-2xl font-black text-white">Canaux de vente</h1>
                        <p className="text-white/60 text-sm mt-1">Répartition des réservations par origine</p>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50 shrink-0">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> Actualiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Réservations totales" value={totalReservations} icon={Calendar} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Revenus totaux" value={fmt(totalRevenus)} icon={TrendingUp} color="#059669" bg="#d1fae5"/>
                <KPICard title="Canaux actifs" value={channelStats.length} icon={PieChart} color={PURPLE} bg="#f3e8ff"/>
                <KPICard title="Établissements" value={hebergements.length} icon={Building2} color="#d97706" bg="#fef3c7"/>
            </div>

            {/* Répartition par canal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-black text-gray-900 mb-5">Répartition par canal</h2>
                <div className="space-y-4">
                    {channelStats.map((c, i) => {
                        const Icon = CHANNEL_ICONS[c.source] || Globe
                        const pct = totalReservations > 0 ? (c.nb / totalReservations) * 100 : 0
                        const color = CHANNEL_COLORS[i % CHANNEL_COLORS.length]
                        return (
                            <div key={c.source}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                                            <Icon size={14} style={{ color }}/>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{formatLabel(c.source)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-gray-900">{c.nb}</span>
                                        <span className="text-xs text-gray-400 ml-2">{fmt(c.revenus)}</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}/>
                                </div>
                            </div>
                        )
                    })}
                    {channelStats.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>}
                </div>
            </div>

            {/* Répartition par établissement */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Détail par établissement</h2>
                </div>
                {hotelChannelBreakdown.length === 0 ? (
                    <div className="p-12 text-center"><p className="text-gray-400 text-sm">Aucune donnée</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Établissement</th>
                                {channelStats.map(c => (
                                    <th key={c.source} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">{formatLabel(c.source)}</th>
                                ))}
                                <th className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {hotelChannelBreakdown.map(row => (
                                <tr key={row.hotelId} className="hover:bg-gray-50/80 transition">
                                    <td className="px-5 py-4"><span className="flex items-center gap-1.5 text-sm font-bold text-gray-900"><Building2 size={12} className="text-gray-400"/> {row.hotelNom}</span></td>
                                    {channelStats.map(c => (
                                        <td key={c.source} className="px-5 py-4"><span className="text-sm text-gray-700">{row.channels[c.source] || 0}</span></td>
                                    ))}
                                    <td className="px-5 py-4"><span className="text-sm font-black" style={{ color: NAVY }}>{row.total}</span></td>
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
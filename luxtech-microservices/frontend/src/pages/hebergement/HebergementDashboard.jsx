import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    Users, DollarSign, Calendar, BedDouble, TrendingUp,
    BarChart3, Clock, Star, ArrowUpRight, ArrowDownRight,
    Hotel, CreditCard, Bell, Settings, MessageSquare, FileText,
    RefreshCw, MapPin, Phone, User, LogIn, LogOut,
    Wallet, Sparkles, AlertTriangle, Building2
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const PERIOD_OPTIONS = [
    { value: 'semaine', label: 'Semaine' },
    { value: 'mois',    label: 'Mois' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'annee',   label: 'Année' },
]

const STATUS_CONFIG = {
    CONFIRMEE: { label: 'Confirmée', bg: '#E8F7FA', color: CYAN },
    EN_ATTENTE: { label: 'En attente', bg: '#FEF9E7', color: '#d97706' },
    ANNULEE: { label: 'Annulée', bg: '#FEE2E2', color: '#dc2626' },
    CHECKIN: { label: 'Check-in', bg: '#D1FAE5', color: '#059669' },
    CHECKOUT: { label: 'Check-out', bg: '#f9fafb', color: '#6b7280' },
    NO_SHOW: { label: 'No-show', bg: '#EDE8F2', color: PURPLE },
}

const formatCurrencyFn = (amount) =>
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(amount || 0)

// ── Horloge temps réel ────────────────────────────────────
const LiveClock = () => {
    const [time, setTime] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])
    return (
        <div className="text-right hidden sm:block">
            <p className="text-lg font-bold text-white">
                {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-white/60">
                {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
    )
}

// ── KPI Card principale (grande) ──────────────────────────
const KPICardLarge = ({ title, value, change, trend, icon: Icon, formatValue = v => v, iconColor, iconBg, onClick, subtitle }) => {
    const isPositive = trend === 'up'
    return (
        <div onClick={onClick}
             className={`relative group rounded-2xl p-6 bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                 style={{ background: `linear-gradient(135deg, ${iconColor}08 0%, transparent 60%)` }}/>
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl" style={{ background: iconBg }}>
                    <Icon className="h-6 w-6" style={{ color: iconColor }}/>
                </div>
                {change !== undefined && change !== 0 && (
                    <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3"/> : <ArrowDownRight className="h-3 w-3"/>}
                        {isPositive ? '+' : ''}{change}%
                    </div>
                )}
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none mb-1">{formatValue(value)}</p>
            <p className="text-sm font-semibold text-gray-600 mt-1">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{ background: `linear-gradient(90deg, ${iconColor}, ${iconColor}60)` }}/>
        </div>
    )
}

// ── KPI Card secondaire (petite) ──────────────────────────
const KPICardSmall = ({ title, value, change, trend, icon: Icon, formatValue = v => v, iconColor, iconBg, onClick }) => {
    const isPositive = trend === 'up'
    return (
        <div onClick={onClick}
             className={`relative group rounded-xl p-4 bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: iconBg }}>
                    <Icon className="h-4 w-4" style={{ color: iconColor }}/>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{title}</p>
                    <p className="text-lg font-black text-gray-900 leading-tight">{formatValue(value)}</p>
                </div>
                {change !== undefined && change !== 0 && (
                    <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-500'
                    }`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3"/> : <ArrowDownRight className="h-3 w-3"/>}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Loading Skeleton ──────────────────────────────────────
const KPISkeleton = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100"/>
                        <div className="h-6 w-16 rounded-full bg-gray-100"/>
                    </div>
                    <div className="h-8 w-24 rounded-lg bg-gray-100 mb-2"/>
                    <div className="h-4 w-32 rounded-lg bg-gray-100"/>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100"/>
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-20 rounded-full bg-gray-100"/>
                            <div className="h-5 w-16 rounded-lg bg-gray-100"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const c = STATUS_CONFIG[status] || { label: status, bg: '#f9fafb', color: '#6b7280' }
    return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: c.bg, color: c.color }}>{c.label}</span>
    )
}

// ── Chart Card ────────────────────────────────────────────
const ChartCard = ({ title, children, action, className = '' }) => (
    <div className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h3>
            {action}
        </div>
        {children}
    </div>
)

// ── SVG Composed Chart ────────────────────────────────────
const ComposedChartSVG = ({ data, height = 180 }) => {
    if (!data || data.length === 0) return (
        <div className="flex items-center justify-center h-40 text-sm text-gray-300">Aucune donnée</div>
    )
    const maxRev = Math.max(...data.map(d => d.revenus || 0), 1)
    const w = 100 / data.length
    const pts = data.map((d, i) => {
        const x = i * w + w / 2
        const y = height - 20 - ((d.taux || 0) / 100) * (height - 40)
        return `${x},${y}`
    }).join(' ')
    return (
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CYAN} stopOpacity="0.8"/>
                    <stop offset="100%" stopColor={CYAN} stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PURPLE} stopOpacity="0.2"/>
                    <stop offset="100%" stopColor={PURPLE} stopOpacity="0"/>
                </linearGradient>
            </defs>
            {/* Lignes de grille */}
            {[0.25, 0.5, 0.75].map((p, i) => (
                <line key={i} x1="0" y1={height - 20 - p * (height - 40)} x2="100%" y2={height - 20 - p * (height - 40)}
                      stroke="#f0f0f0" strokeWidth="0.5"/>
            ))}
            {/* Barres revenus */}
            {data.map((d, i) => {
                const barH = ((d.revenus || 0) / maxRev) * (height - 40)
                const x = i * w + w * 0.2
                return <rect key={i} x={`${x}%`} y={height - barH - 20} width={`${w * 0.6}%`} height={barH} rx="3" fill="url(#barGrad2)"/>
            })}
            {/* Zone aire */}
            <path d={`M ${data.map((d, i) => `${i * w + w / 2},${height - 20 - ((d.taux || 0) / 100) * (height - 40)}`).join(' L ')} L ${(data.length - 1) * w + w / 2},${height - 20} L ${w / 2},${height - 20} Z`}
                  fill="url(#areaGrad)"/>
            {/* Ligne taux */}
            <polyline points={pts} fill="none" stroke={PURPLE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            {data.map((d, i) => {
                const x = i * w + w / 2
                const y = height - 20 - ((d.taux || 0) / 100) * (height - 40)
                return <circle key={i} cx={`${x}%`} cy={y} r="1.8" fill="white" stroke={PURPLE} strokeWidth="1"/>
            })}
            {data.map((d, i) => (
                <text key={i} x={`${i * w + w / 2}%`} y={height - 3} textAnchor="middle" fontSize="3.5" fill="#d1d5db">{d.label}</text>
            ))}
        </svg>
    )
}

// ── SVG Donut ─────────────────────────────────────────────
const DonutSVG = ({ data }) => {
    const total = data.reduce((s, d) => s + d.value, 0)
    if (total === 0) return <div className="flex items-center justify-center h-36 text-sm text-gray-300">Aucune donnée</div>
    let cumAngle = -Math.PI / 2
    const cx = 65, cy = 65, r = 52, ri = 36
    return (
        <svg width="130" height="130" viewBox="0 0 130 130" className="mx-auto">
            {data.map((d, i) => {
                if (d.value === 0) return null
                const angle = (d.value / total) * 2 * Math.PI
                const x1 = cx + r * Math.cos(cumAngle), y1 = cy + r * Math.sin(cumAngle)
                cumAngle += angle
                const x2 = cx + r * Math.cos(cumAngle), y2 = cy + r * Math.sin(cumAngle)
                const xi1 = cx + ri * Math.cos(cumAngle - angle), yi1 = cy + ri * Math.sin(cumAngle - angle)
                const xi2 = cx + ri * Math.cos(cumAngle), yi2 = cy + ri * Math.sin(cumAngle)
                const large = angle > Math.PI ? 1 : 0
                return (
                    <path key={i}
                          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`}
                          fill={d.color} stroke="white" strokeWidth="2"/>
                )
            })}
            <circle cx={cx} cy={cy} r={ri - 1} fill="white"/>
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={NAVY}>{total}</text>
            <text x={cx} y={cx + 10} textAnchor="middle" fontSize="5.5" fill="#9CA3AF">réservations</text>
        </svg>
    )
}

// ── Barre occupation ──────────────────────────────────────
const OccupancyBar = ({ value, total, occupied }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Occupation en temps réel</p>
                <p className="text-xs text-gray-400 mt-0.5">{occupied} occupées · {total - occupied} disponibles · {total} total</p>
            </div>
            <div className="text-right">
                <span className="text-3xl font-black" style={{ color: value > 70 ? '#059669' : value > 40 ? '#d97706' : CYAN }}>{value}%</span>
            </div>
        </div>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
                 style={{ width: `${value}%`, background: value > 70 ? 'linear-gradient(90deg, #059669, #34d399)' : value > 40 ? 'linear-gradient(90deg, #d97706, #fbbf24)' : `linear-gradient(90deg, ${CYAN}, ${NAVY})` }}/>
        </div>
        <div className="flex items-center gap-3 mt-3">
            {[
                { label: 'Excellente', range: '> 70%', color: '#059669' },
                { label: 'Correcte',   range: '40-70%', color: '#d97706' },
                { label: 'Faible',     range: '< 40%', color: CYAN },
            ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }}/>
                    <span className="text-[10px] text-gray-400">{s.label} ({s.range})</span>
                </div>
            ))}
        </div>
    </div>
)

// ── Summary Card ──────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">{label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }}/>
            </div>
        </div>
    </div>
)

// ── Reminder Row ──────────────────────────────────────────
const ReminderRow = ({ item, type }) => (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b last:border-b-0 border-gray-50">
        <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{item.client || 'Client'}</p>
            <p className="text-xs text-gray-400 truncate">#{item.reference} · Ch. {item.room || '-'}</p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${
            type === 'arrival' ? 'bg-emerald-50 text-emerald-700' :
                type === 'departure' ? 'bg-indigo-50 text-indigo-700' :
                    'bg-amber-50 text-amber-700'
        }`}>
            {type === 'arrival' ? 'CHECK-IN' : type === 'departure' ? 'CHECK-OUT' : 'A TRAITER'}
        </span>
    </div>
)

// ══════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ══════════════════════════════════════════════════════════
export default function HebergementDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement]   = useState(null)
    const [reservations, setReservations] = useState([])
    const [chambres, setChambres]         = useState([])
    const [loading, setLoading]           = useState(true)
    const [refreshing, setRefreshing]     = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState('mois')

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const hebergRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = hebergRes?.data?.data
            setHebergement(h)
            if (h?.id) {
                const [resaRes, chambreTypesRes] = await Promise.all([
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(() => null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambre-types`).catch(() => null),
                ])
                setReservations(resaRes?.data?.data || [])
                setChambres(chambreTypesRes?.data?.data || [])
            }
        } catch (err) {
            console.error('Dashboard error:', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const kpi = useMemo(() => {
        const confirmed = reservations.filter(r => ['CONFIRMEE', 'CHECKIN', 'CHECKOUT'].includes(r.statut || r.status))
        const pending = reservations.filter(r => ['EN_ATTENTE'].includes(r.statut || r.status))
        const cancelled = reservations.filter(r => ['ANNULEE'].includes(r.statut || r.status))
        const totalChambres = chambres.reduce((s, c) => s + (c.nombreChambres || 1), 0)
        const chambresOccupees = Math.min(confirmed.length, totalChambres)
        const tauxOccupation = totalChambres > 0 ? Math.round((chambresOccupees / totalChambres) * 100) : 0
        const revenus = confirmed.reduce((s, r) => s + (r.montantTotal || r.prixTotal || 0), 0)
        const tauxAnnulation = reservations.length > 0 ? Math.round((cancelled.length / reservations.length) * 100) : 0
        const adr = confirmed.length > 0 ? Math.round(revenus / confirmed.length) : 0
        const revpar = totalChambres > 0 ? Math.round(revenus / totalChambres) : 0
        return {
            tauxOccupation, revenus, totalReservations: reservations.length,
            availableRooms: totalChambres - chambresOccupees, totalChambres, chambresOccupees,
            adr, revpar, tauxAnnulation,
            satisfaction: hebergement?.etoiles || 0,
            arrivals:  confirmed.filter(r => r.dateArrivee && new Date(r.dateArrivee).toDateString() === new Date().toDateString()).length,
            departures: reservations.filter(r => r.dateDepart && new Date(r.dateDepart).toDateString() === new Date().toDateString()).length,
            pendingCount: pending.length,
        }
    }, [reservations, chambres, hebergement])

    const last7Days = useMemo(() => {
        const J = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i))
            const val = reservations.filter(r => new Date(r.createdAt || 0).toDateString() === d.toDateString()).length
            return { label: J[d.getDay()], value: val, taux: val * 14, revenus: val * 900 }
        })
    }, [reservations])

    const channelData = useMemo(() => [
        { label: 'Direct',  value: Math.round(reservations.length * 0.4), color: CYAN },
        { label: 'Booking', value: Math.round(reservations.length * 0.3), color: NAVY },
        { label: 'Agence',  value: Math.round(reservations.length * 0.2), color: PURPLE },
        { label: 'Autres',  value: Math.round(reservations.length * 0.1), color: '#f59e0b' },
    ], [reservations])

    const recentResas = useMemo(() =>
            [...reservations].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5)
        , [reservations])

    const quickAccess = [
        { id: 'info',         label: "Infos",        icon: Hotel,        path: '/hotel/info' },
        { id: 'rooms',        label: 'Chambres',     icon: BedDouble,    path: '/hotel/chambres' },
        { id: 'reservations', label: 'Réservations', icon: Calendar,     path: '/hotel/reservations' },
        { id: 'paiements',    label: 'Paiements',    icon: CreditCard,   path: '/hotel/paiements' },
        { id: 'factures',     label: 'Factures',     icon: FileText,     path: '/hotel/factures' },
        { id: 'messages',     label: 'Messages',     icon: MessageSquare,path: '/hotel/messages' },
        { id: 'notifs',       label: 'Notifs',       icon: Bell,         path: '/hotel/notifications' },
        { id: 'settings',     label: 'Paramètres',   icon: Settings,     path: '/hotel/info' },
    ]

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            {/* ── Header ── */}
            <div className="rounded-2xl shadow-lg p-6 text-white overflow-hidden relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 60%, ${CYAN} 100%)` }}>
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full opacity-5 bg-white translate-y-1/2"/>
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
                            <Building2 className="h-7 w-7 text-white"/>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Tableau de Bord</p>
                            <h1 className="text-xl font-black text-white mt-0.5">
                                {hebergement?.nom || (user?.nomEtablissement?.replace(/hotel/gi, 'Hébergement').replace(/Hotel/gi, 'Hébergement')) || 'Mon Établissement'}
                            </h1>
                            <p className="text-white/60 text-xs flex items-center gap-1.5 mt-1">
                                <MapPin className="h-3 w-3"/>
                                {hebergement?.ville || user?.ville || 'Maroc'}
                                {hebergement?.etoiles && <span className="ml-1">{'★'.repeat(hebergement.etoiles)}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <LiveClock/>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/10">
                            {PERIOD_OPTIONS.map(o => (
                                <button key={o.value} onClick={() => setSelectedPeriod(o.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            selectedPeriod === o.value ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}/>
                            Actualiser
                        </button>
                    </div>
                </div>
                {user?.status === 'PENDING_APPROVAL' && (
                    <div className="relative mt-4 flex items-center gap-3 p-3 rounded-xl bg-amber-400/20 border border-amber-400/30">
                        <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0"/>
                        <p className="text-sm text-amber-200 font-medium">Votre dossier est en cours d'examen par notre équipe.</p>
                    </div>
                )}
            </div>

            {/* ── KPIs ── */}
            {loading ? <KPISkeleton/> : (
                <>
                    {/* Ligne 1 : 4 KPIs principaux (grandes cartes) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICardLarge title="Taux d'occupation" value={kpi.tauxOccupation} change={5} trend="up"
                                      icon={Users} formatValue={v => `${v}%`} iconColor="#2563eb" iconBg="#dbeafe"
                                      subtitle="Ce mois" onClick={() => navigate('/hotel/calendrier')}/>
                        <KPICardLarge title="Revenus" value={kpi.revenus} change={12} trend="up"
                                      icon={DollarSign} formatValue={formatCurrencyFn} iconColor="#059669" iconBg="#d1fae5"
                                      subtitle="Réservations confirmées" onClick={() => navigate('/hotel/paiements')}/>
                        <KPICardLarge title="Réservations" value={kpi.totalReservations} change={8} trend="up"
                                      icon={Calendar} formatValue={v => v.toLocaleString()} iconColor={PURPLE} iconBg="#ede9fe"
                                      subtitle={`${kpi.pendingCount} en attente`} onClick={() => navigate('/hotel/reservations')}/>
                        <KPICardLarge title="Chambres dispo." value={kpi.availableRooms} change={0} trend="down"
                                      icon={BedDouble} formatValue={v => `${v}/${kpi.totalChambres}`} iconColor="#ea580c" iconBg="#ffedd5"
                                      subtitle="Disponibles aujourd'hui" onClick={() => navigate('/hotel/chambres')}/>
                    </div>

                    {/* Ligne 2 : 4 KPIs secondaires (meme taille) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICardLarge title="Tarif moyen (ADR)" value={kpi.adr} change={3} trend="up"
                                      icon={TrendingUp} formatValue={formatCurrencyFn} iconColor="#4f46e5" iconBg="#e0e7ff"
                                      subtitle="Average Daily Rate" onClick={() => navigate('/hotel/paiements')}/>
                        <KPICardLarge title="RevPAR" value={kpi.revpar} change={7} trend="up"
                                      icon={BarChart3} formatValue={formatCurrencyFn} iconColor="#0d9488" iconBg="#ccfbf1"
                                      subtitle="Revenue per Available Room" onClick={() => navigate('/hotel/factures')}/>
                        <KPICardLarge title="Taux annulation" value={kpi.tauxAnnulation} change={-2} trend="down"
                                      icon={Clock} formatValue={v => `${v}%`} iconColor="#dc2626" iconBg="#fee2e2"
                                      subtitle="Sur total reservations" onClick={() => navigate('/hotel/reservations')}/>
                        <KPICardLarge title="Satisfaction" value={kpi.satisfaction} change={0} trend="up"
                                      icon={Star} formatValue={v => `${v}/5`} iconColor="#d97706" iconBg="#fef3c7"
                                      subtitle="Note moyenne clients"/>
                    </div>
                </>
            )}

            {/* ── Barre occupation ── */}
            {!loading && (
                <OccupancyBar value={kpi.tauxOccupation} total={kpi.totalChambres} occupied={kpi.chambresOccupees}/>
            )}

            {/* ── Graphiques ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ChartCard title="Évolution Occupation & Revenus — 7 jours"
                               action={<div className="flex items-center gap-4 text-xs">
                                   <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm" style={{ background: CYAN }}/><span className="text-gray-400">Revenus</span></div>
                                   <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 rounded-full" style={{ background: PURPLE }}/><span className="text-gray-400">Taux</span></div>
                               </div>}>
                        <ComposedChartSVG data={last7Days} height={180}/>
                    </ChartCard>
                </div>
                <ChartCard title="Canaux de Réservation">
                    <DonutSVG data={channelData}/>
                    <div className="space-y-2 mt-4">
                        {channelData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }}/>
                                    <span className="text-xs text-gray-500">{d.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 rounded-full w-16 bg-gray-100 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${reservations.length > 0 ? (d.value / reservations.length) * 100 : 0}%`, background: d.color }}/>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 w-4 text-right">{d.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* ── Performance chambres ── */}
            {chambres.length > 0 && (
                <ChartCard title="Performance par Type de Chambre">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {chambres.slice(0, 6).map((c, i) => {
                            const pct = Math.round(35 + Math.random() * 60)
                            const color = pct > 70 ? '#059669' : pct > 40 ? '#d97706' : '#dc2626'
                            return (
                                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center hover:shadow-sm transition">
                                    <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                        {(c.nom || c.type || 'C')[0]}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700 truncate mb-2">{c.nom || c.type || `Type ${i+1}`}</p>
                                    <div className="relative h-16 flex items-end justify-center">
                                        <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden" style={{ height: `${pct}%` }}>
                                            <div className="w-full h-full rounded-t-lg" style={{ background: `linear-gradient(180deg, ${color}cc, ${color})` }}/>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black mt-1" style={{ color }}>{pct}%</p>
                                    {c.prixBase && <p className="text-[10px] text-gray-400">{c.prixBase} MAD</p>}
                                </div>
                            )
                        })}
                    </div>
                </ChartCard>
            )}

            {/* ── Rappels Réceptionniste ── */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Rappels Réceptionniste</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Arrivées, départs et alertes du jour</p>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition border border-gray-100">
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}/>
                        Actualiser
                    </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                    <SummaryCard icon={LogIn}    label="Arrivées"    value={kpi.arrivals}     color="#059669" bg="#d1fae5"/>
                    <SummaryCard icon={LogOut}   label="Départs"     value={kpi.departures}   color="#4f46e5" bg="#e0e7ff"/>
                    <SummaryCard icon={Wallet}   label="Paiements"   value={0}                color="#d97706" bg="#fef3c7"/>
                    <SummaryCard icon={Sparkles} label="A nettoyer"  value={0}                color={CYAN}    bg="#E8F7FA"/>
                    <SummaryCard icon={Bell}     label="En attente"  value={kpi.pendingCount} color={PURPLE}  bg="#ede9fe"/>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                        { title: "Arrivées aujourd'hui", items: recentResas.filter(r => ['CONFIRMEE'].includes(r.statut || r.status)), type: 'arrival' },
                        { title: "Départs aujourd'hui", items: recentResas.filter(r => ['CHECKIN'].includes(r.statut || r.status)), type: 'departure' },
                        { title: "Paiement incomplet",   items: [], type: 'payment' },
                    ].map((section, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                            <h4 className="font-bold text-sm text-gray-700 mb-3">{section.title}</h4>
                            {section.items.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Aucun élément prévu.</p>
                            ) : section.items.slice(0, 4).map((r, j) => (
                                <ReminderRow key={j} item={{ client: r.clientNom || r.nomClient, reference: r.id, room: r.chambre }} type={section.type}/>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Réservations récentes + Notifications ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard title="Réservations Récentes"
                           action={<Link to="/hotel/reservations" className="text-xs font-semibold hover:underline" style={{ color: CYAN }}>Voir tout →</Link>}>
                    {recentResas.length === 0 ? (
                        <div className="text-center py-10 text-gray-300">
                            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40"/>
                            <p className="text-sm">Aucune réservation récente</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentResas.map((r, i) => (
                                <div key={i} onClick={() => navigate(`/hotel/reservations?id=${r.id}`)}
                                     className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-black"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                        {(r.clientNom || r.nomClient || 'C')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-700 transition">{r.clientNom || r.nomClient || '—'}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> Ch. {r.chambre || '—'}</span>
                                            {r.dateArrivee && <span>{new Date(r.dateArrivee).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <StatusBadge status={r.statut || r.status}/>
                                        {(r.montantTotal || r.prixTotal) && (
                                            <p className="text-xs font-bold text-emerald-600 mt-1">{formatCurrencyFn(r.montantTotal || r.prixTotal)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ChartCard>

                <ChartCard title="Alertes & Notifications"
                           action={<Link to="/hotel/notifications" className="text-xs font-semibold hover:underline" style={{ color: CYAN }}>Voir tout →</Link>}>
                    <div className="space-y-2">
                        {[
                            { label: "Check-ins aujourd'hui",  value: kpi.arrivals,       icon: LogIn,     color: '#059669', bg: '#d1fae5' },
                            { label: 'En attente validation',  value: kpi.pendingCount,   icon: Clock,     color: '#d97706', bg: '#fef3c7' },
                            { label: 'Check-outs prévus',      value: kpi.departures,     icon: LogOut,    color: '#4f46e5', bg: '#e0e7ff' },
                            { label: 'Chambres disponibles',   value: kpi.availableRooms, icon: BedDouble, color: CYAN,      bg: '#E8F7FA' },
                        ].map((item, i) => {
                            const Icon = item.icon
                            return (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm"
                                     style={{ background: item.bg, borderColor: item.color + '25' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.color + '15' }}>
                                            <Icon className="h-4 w-4" style={{ color: item.color }}/>
                                        </div>
                                        <span className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</span>
                                    </div>
                                    <span className="text-2xl font-black" style={{ color: item.color }}>{item.value}</span>
                                </div>
                            )
                        })}
                    </div>
                </ChartCard>
            </div>

            {/* ── Accès Rapide ── */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Accès Rapide</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {quickAccess.map(item => {
                        const Icon = item.icon
                        return (
                            <Link key={item.id} to={item.path}
                                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200 group-hover:scale-110"
                                     style={{ borderColor: `${CYAN}30` }}>
                                    <Icon className="h-5 w-5" style={{ color: CYAN }}/>
                                </div>
                                <span className="text-xs font-medium text-center leading-tight text-gray-600 group-hover:text-gray-900">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}
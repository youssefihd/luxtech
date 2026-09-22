import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Bell, Check, CheckCheck, RefreshCw, AlertTriangle, MessageSquare,
    Calendar, CreditCard, Info, Filter, ChevronDown, X, Clock
} from 'lucide-react'
import { notificationAxios } from '../../api/axios'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const TYPE_CONFIG = {
    NOUVEAU_MESSAGE:   { label: 'Message',     icon: MessageSquare, cls: 'bg-blue-100 text-blue-600' },
    RESERVATION:       { label: 'Réservation', icon: Calendar,      cls: 'bg-cyan-100 text-cyan-600' },
    SERVICE:           { label: 'Service',     icon: Bell,          cls: 'bg-purple-100 text-purple-600' },
    PAIEMENT_RECU:     { label: 'Paiement',    icon: CreditCard,    cls: 'bg-emerald-100 text-emerald-600' },
    INFO:              { label: 'Info',        icon: Info,          cls: 'bg-gray-100 text-gray-600' },
}

const fmtRelative = (d) => {
    if (!d) return ''
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "À l'instant"
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days} j`
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtFull = (d) => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const KPICard = ({ title, value, icon: Icon, color, bg, active, onClick }) => (
    <div onClick={onClick}
         className={`relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
             active ? 'border-transparent shadow-lg' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:-translate-y-0.5 hover:shadow-md'
         }`}
         style={active ? { background: `linear-gradient(135deg, white, ${color}08)`, borderColor: color + '40', boxShadow: `0 8px 24px ${color}20` } : {}}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: color }}/>
        <div className="relative p-2.5 rounded-xl w-fit mb-3" style={{ background: bg }}>
            <Icon className="h-5 w-5" style={{ color }}/>
        </div>
        <p className="relative text-3xl font-black text-gray-900 mb-0.5">{value ?? 0}</p>
        <p className="relative text-sm text-gray-500 font-medium">{title}</p>
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: color }}/>}
    </div>
)

// ── Modal de détail d'une notification ────────────────────
const NotificationDetailModal = ({ notification, onClose }) => {
    if (!notification) return null
    const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.INFO
    const Icon = cfg.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
                <div className="p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <Icon size={19} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">{cfg.label}</p>
                                <h2 className="text-lg font-black text-white leading-tight">{notification.titre}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition shrink-0">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{notification.message}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-400">
                        <Clock size={12}/>
                        {fmtFull(notification.createdAt)}
                    </div>
                </div>
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementNotifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [filterStatut, setFilterStatut] = useState('ALL')
    const [filterType, setFilterType] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedNotif, setSelectedNotif] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const res = await notificationAxios.get('/notifications').catch(() => null)
            setNotifications(res?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        const interval = setInterval(() => fetchData(true), 30000)
        return () => clearInterval(interval)
    }, [fetchData])

    const stats = useMemo(() => ({
        total: notifications.length,
        nonLues: notifications.filter(n => !n.isLu).length,
    }), [notifications])

    const filtered = useMemo(() => {
        return notifications.filter(n => {
            const matchStatut = filterStatut === 'ALL' ||
                (filterStatut === 'NON_LU' && !n.isLu) ||
                (filterStatut === 'LU' && n.isLu)
            const matchType = filterType === 'ALL' || n.type === filterType
            return matchStatut && matchType
        })
    }, [notifications, filterStatut, filterType])

    const handleOpenNotification = async (n) => {
        setSelectedNotif(n)
        if (!n.isLu) {
            try {
                await notificationAxios.post(`/notifications/${n.id}/read`)
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isLu: true } : x))
            } catch (err) {
                showToast('Erreur.', 'error')
            }
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationAxios.post('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, isLu: true })))
            showToast('Toutes les notifications ont été marquées comme lues.')
        } catch (err) {
            showToast('Erreur.', 'error')
        }
    }

    const availableTypes = useMemo(() => {
        const types = new Set(notifications.map(n => n.type).filter(Boolean))
        return Array.from(types)
    }, [notifications])

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

    return (
        <div className="space-y-5 max-w-4xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Opérations</p>
                        <h1 className="text-2xl font-black text-white">Notifications</h1>
                        <p className="text-white/60 text-sm mt-1">{filtered.length} notification{filtered.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        {stats.nonLues > 0 && (
                            <button onClick={handleMarkAllRead}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                    style={{ color: NAVY }}>
                                <CheckCheck size={16}/> Tout marquer lu
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <KPICard title="Total" value={stats.total} icon={Bell} color="#2563eb" bg="#dbeafe" active={filterStatut === 'ALL'} onClick={() => setFilterStatut('ALL')}/>
                <KPICard title="Non lues" value={stats.nonLues} icon={AlertTriangle} color="#dc2626" bg="#fee2e2" active={filterStatut === 'NON_LU'} onClick={() => setFilterStatut('NON_LU')}/>
            </div>

            {availableTypes.length > 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterType !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600'
                            }`}>
                        <Filter size={15}/> Filtrer par type
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {showFilters && (
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={inputCls + ' w-full mt-3'}>
                            <option value="ALL">Tous les types</option>
                            {availableTypes.map(t => <option key={t} value={t}>{TYPE_CONFIG[t]?.label || t}</option>)}
                        </select>
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des notifications...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <Bell size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune notification</p>
                        <p className="text-gray-400 text-sm">Vous êtes à jour !</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map(n => {
                            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO
                            const Icon = cfg.icon
                            return (
                                <div key={n.id} onClick={() => handleOpenNotification(n)}
                                     className={`flex items-start gap-3 p-4 cursor-pointer transition ${
                                         !n.isLu ? 'bg-[#66CAD8]/5 hover:bg-[#66CAD8]/10' : 'hover:bg-gray-50'
                                     }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.cls}`}>
                                        <Icon size={17}/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm ${!n.isLu ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>{n.titre}</p>
                                            <span className="text-[10px] text-gray-400 shrink-0">{fmtRelative(n.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                                    </div>
                                    {!n.isLu && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: CYAN }}/>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <NotificationDetailModal notification={selectedNotif} onClose={() => setSelectedNotif(null)}/>
        </div>
    )
}
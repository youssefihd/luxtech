import { useState, useEffect, useCallback } from 'react'
import {
    Activity, User, Calendar, Filter, Search, Eye, RefreshCw,
    AlertTriangle, X, Plus, Pencil, Trash2, LogIn, LogOut,
    Download, Upload, ChevronDown
} from 'lucide-react'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const ACTION_CONFIG = {
    CREATE: { label: 'Création',     icon: Plus,     cls: 'bg-emerald-100 text-emerald-700' },
    UPDATE: { label: 'Modification', icon: Pencil,   cls: 'bg-blue-100 text-blue-700' },
    DELETE: { label: 'Suppression',  icon: Trash2,   cls: 'bg-red-100 text-red-600' },
    LOGIN:  { label: 'Connexion',    icon: LogIn,    cls: 'bg-cyan-100 text-cyan-700' },
    LOGOUT: { label: 'Déconnexion',  icon: LogOut,   cls: 'bg-gray-100 text-gray-600' },
    VIEW:   { label: 'Consultation', icon: Eye,      cls: 'bg-purple-100 text-purple-700' },
    EXPORT: { label: 'Export',       icon: Download, cls: 'bg-amber-100 text-amber-700' },
    IMPORT: { label: 'Import',       icon: Upload,   cls: 'bg-indigo-100 text-indigo-700' },
}

const fmtDateTime = (d) => {
    if (!d) return { date: '—', time: '' }
    const dt = new Date(d)
    return {
        date: dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
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

const LogDetailModal = ({ log, onClose }) => {
    if (!log) return null
    const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: Activity, cls: 'bg-gray-100 text-gray-600' }
    const Icon = cfg.icon
    const dt = fmtDateTime(log.createdAt)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 max-h-[85vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <Icon size={19} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Détail de l'activité</p>
                                <h2 className="text-lg font-black text-white">{cfg.label}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition shrink-0">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex items-center gap-3">
                        <User size={18} className="text-gray-400 shrink-0"/>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{log.userNom || 'Système'}</p>
                            <p className="text-xs text-gray-400">Utilisateur</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Activity size={18} className="text-gray-400 shrink-0"/>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{log.entite}</p>
                            <p className="text-xs text-gray-400">Type d'entité concernée</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-400 shrink-0"/>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{dt.date} à {dt.time}</p>
                            <p className="text-xs text-gray-400">Date et heure</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
                        <p className="text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded-xl p-3">{log.description}</p>
                    </div>
                    {log.details && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Détails techniques</p>
                            <pre className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">{log.details}</pre>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementActivityLogs() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterAction, setFilterAction] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)

    const fetchHebergement = useCallback(async () => {
        const res = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
        return res?.data?.data || null
    }, [userId])

    const fetchLogs = useCallback(async (hotelId, isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const params = {}
            if (search) params.q = search
            if (filterAction) params.action = filterAction
            if (dateFrom) params.dateFrom = dateFrom
            if (dateTo) params.dateTo = dateTo
            const res = await hebergementAxios.get(`/hebergement/hebergements/${hotelId}/activity-logs`, { params }).catch(() => null)
            setLogs(res?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [search, filterAction, dateFrom, dateTo])

    useEffect(() => {
        fetchHebergement().then(h => {
            setHebergement(h)
            if (h?.id) fetchLogs(h.id)
            else setLoading(false)
        })
    }, [fetchHebergement])

    // Redéclenche la recherche filtrée côté serveur, avec un léger debounce sur la recherche texte
    useEffect(() => {
        if (!hebergement?.id) return
        const timeout = setTimeout(() => fetchLogs(hebergement.id, true), search ? 400 : 0)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, filterAction, dateFrom, dateTo, hebergement?.id])

    const stats = {
        total: logs.length,
        aujourdhui: logs.filter(l => {
            const d = new Date(l.createdAt)
            const now = new Date()
            return d.toDateString() === now.toDateString()
        }).length,
    }

    const clearFilters = () => {
        setSearch(''); setFilterAction(''); setDateFrom(''); setDateTo('')
    }

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

    return (
        <div className="space-y-5 max-w-5xl mx-auto">

            <div className="rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Opérations</p>
                        <h1 className="text-2xl font-black text-white">Logs d'activité</h1>
                        <p className="text-white/60 text-sm mt-1">Traçabilité des actions dans votre établissement</p>
                    </div>
                    <button onClick={() => fetchLogs(hebergement.id, true)} disabled={refreshing || !hebergement}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50 shrink-0">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                        Actualiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <KPICard title="Total (filtré)" value={stats.total}       icon={Activity} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Aujourd'hui"    value={stats.aujourdhui}  icon={Calendar} color="#059669" bg="#d1fae5"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Utilisateur, description..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterAction || dateFrom || dateTo ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/> Filtres
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || filterAction || dateFrom || dateTo) && (
                        <button onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Action</label>
                            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className={inputCls + ' w-full'}>
                                <option value="">Toutes les actions</option>
                                {Object.entries(ACTION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Date début</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls + ' w-full'}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Date fin</label>
                            <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} className={inputCls + ' w-full'}/>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Activités récentes</h2>
                </div>

                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <Activity size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune activité</p>
                        <p className="text-gray-400 text-sm">Les actions effectuées apparaîtront ici automatiquement</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map(log => {
                            const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: Activity, cls: 'bg-gray-100 text-gray-600' }
                            const Icon = cfg.icon
                            const dt = fmtDateTime(log.createdAt)
                            return (
                                <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.cls}`}>
                                        <Icon size={17}/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{log.userNom || 'Système'}</p>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                                                <Calendar size={11}/> {dt.date} à {dt.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                                        {log.details && (
                                            <button onClick={() => setSelectedLog(log)}
                                                    className="mt-2 text-xs font-bold text-[#1D2252] hover:underline flex items-center gap-1">
                                                <Eye size={12}/> Voir les détails
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)}/>
        </div>
    )
}
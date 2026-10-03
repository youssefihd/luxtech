import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users, Building2, Handshake, TrendingUp, TrendingDown,
    Clock, CheckCircle, XCircle, ArrowRight, AlertTriangle,
    Activity, Calendar, RefreshCw, ChevronRight,
    Zap, X, FileText, Camera, Eye
} from 'lucide-react'
import axios from '../../api/axios'
import { hebergementAxios } from '../../api/axios'
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

const TYPE_LABELS = {
    hotel: 'Hotel', auberge: 'Auberge', camping: 'Camping',
    ferme: 'Ferme', gite: 'Gite', maison: "Maison d'hotes",
    pension: 'Pension', relais: 'Relais', residence: 'Residence hoteliere', riad: 'Riad',
}

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const Sparkline = ({ data, color }) => {
    const max = Math.max(...data), min = Math.min(...data)
    const range = max - min || 1
    const w = 80, h = 32
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

const KpiCard = ({ icon: Icon, label, value, change, changeLabel, color, spark, onClick }) => {
    const positive = change >= 0
    return (
        <button onClick={onClick}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group w-full">
            <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                     style={{ background: color }}>
                    <Icon size={20}/>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                     style={{ background: positive ? '#E8F7FA' : '#EDE8F2', color: positive ? CYAN : PURPLE }}>
                    {positive ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                    {Math.abs(change)}%
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{value ?? 0}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                    {changeLabel && <p className="text-xs text-gray-400 mt-0.5">{changeLabel}</p>}
                </div>
                {spark && <Sparkline data={spark} color={CYAN}/>}
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ color: CYAN }}>
                Voir le detail <ChevronRight size={12}/>
            </div>
        </button>
    )
}

const StatusBadge = ({ status }) => {
    const map = {
        APPROVED:         { label: 'Approuve',    bg: '#E8F7FA', color: CYAN },
        PENDING_APPROVAL: { label: 'En attente',  bg: '#FEF9E7', color: '#d97706' },
        REJECTED:         { label: 'Rejete',      bg: '#EDE8F2', color: PURPLE },
        SUSPENDED:        { label: 'Suspendu',    bg: '#f9fafb', color: '#6b7280' },
    }
    const s = map[status] || map.PENDING_APPROVAL
    return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    )
}

// ── Modal Detail Utilisateur ──────────────────────────────
const UserDetailModal = ({ user, onClose, onApprove, onReject, actionLoading }) => {
    const [hebergementData, setHebergementData] = useState(null)
    const [hebergementLoading, setHebergementLoading] = useState(false)
    const isHebergement = user?.role === 'HEBERGEMENT_ADMIN' || user?.role === 'HEBERGEMENT_STAFF' || user?.role === 'CLIENT'
    const id = user?.id_utilisateur || user?.id

    useEffect(() => {
        if (!user || !isHebergement) return
        setHebergementLoading(true)
        hebergementAxios.get(`/hebergement/hebergements/by-user/${id}`)
            .then(res => setHebergementData(res.data?.data))
            .catch(() => setHebergementData(null))
            .finally(() => setHebergementLoading(false))
    }, [user])

    if (!user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                             style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                            {user.prenom?.[0]}{user.nom?.[0]}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{user.prenom} {user.nom}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500"/>
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Infos personnelles */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Users size={16} style={{ color: CYAN }}/> Informations personnelles
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Nom complet', value: `${user.prenom} ${user.nom}` },
                                { label: 'Email', value: user.email },
                                { label: 'Telephone', value: user.telephone || '—' },
                                { label: 'Role', value: user.role?.replace(/_/g, ' ') },
                                { label: 'Statut', value: <StatusBadge status={user.status}/> },
                                { label: 'Date inscription', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—' },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                    <div className="text-sm font-medium text-gray-800">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Infos etablissement */}
                    {(user.nomEtablissement || user.ville || user.adresse) && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 size={16} style={{ color: CYAN }}/> Informations hebergement
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Nom de l'etablissement", value: user.nomEtablissement || '—' },
                                    { label: "Type d'hebergement", value: TYPE_LABELS[user.typeHebergement] || user.typeHebergement || '—' },
                                    { label: 'Ville', value: user.ville || '—' },
                                    { label: 'Adresse', value: user.adresse || '—' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photos & Documents depuis hebergement-service */}
                    {isHebergement && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Camera size={16} style={{ color: CYAN }}/> Photos & Documents
                                {hebergementLoading && <RefreshCw size={13} className="animate-spin text-gray-400"/>}
                            </h3>

                            {hebergementLoading ? (
                                <div className="bg-gray-50 rounded-xl p-6 text-center">
                                    <RefreshCw size={20} className="animate-spin mx-auto text-gray-300 mb-2"/>
                                    <p className="text-xs text-gray-400">Chargement du dossier...</p>
                                </div>
                            ) : !hebergementData ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5"/>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">Dossier non encore soumis</p>
                                        <p className="text-xs text-amber-700 mt-0.5">Le partenaire n'a pas encore complete son dossier.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {hebergementData.photos?.length > 0 ? (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Camera size={12}/> Photos ({hebergementData.photos.length})
                                            </p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {hebergementData.photos.slice(0, 8).map((photo, i) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                                                        <img src={photo.url} alt={`Photo ${i+1}`}
                                                             className="w-full h-full object-cover"
                                                             onError={e => { e.target.style.display='none' }}/>
                                                        {i === 0 && (
                                                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                                                                Principale
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : <p className="text-xs text-gray-400 italic">Aucune photo soumise.</p>}

                                    {hebergementData.documents?.length > 0 ? (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <FileText size={12}/> Documents ({hebergementData.documents.length})
                                            </p>
                                            <div className="space-y-2">
                                                {hebergementData.documents.map((doc, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText size={14} style={{ color: CYAN }}/>
                                                            <p className="text-sm text-gray-700">{doc.typeDocument || doc.nomFichier}</p>
                                                        </div>
                                                        {doc.url && (
                                                            <a href={doc.url} target="_blank" rel="noreferrer"
                                                               className="text-xs font-medium hover:underline"
                                                               style={{ color: CYAN }}>Voir</a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : <p className="text-xs text-gray-400 italic">Aucun document soumis.</p>}

                                    {hebergementData.iban && (
                                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                                            <p className="text-xs text-gray-400 mb-0.5">IBAN</p>
                                            <p className="text-sm font-mono font-medium text-gray-800">{hebergementData.iban}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
                    <button onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 transition text-sm">
                        Fermer
                    </button>
                    {user.status === 'PENDING_APPROVAL' && (
                        <>
                            <button onClick={() => onReject(user)}
                                    disabled={actionLoading === id + 'reject'}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition hover:shadow-lg disabled:opacity-60 text-sm"
                                    style={{ background: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)` }}>
                                {actionLoading === id + 'reject' ? <RefreshCw size={14} className="animate-spin"/> : <XCircle size={14}/>}
                                Rejeter
                            </button>
                            <button onClick={() => onApprove(user)}
                                    disabled={actionLoading === id + 'approve'}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition hover:shadow-lg disabled:opacity-60 text-sm"
                                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                {actionLoading === id + 'approve' ? <RefreshCw size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
                                Approuver
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── DASHBOARD PRINCIPAL ───────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate()
    const [pendingUsers, setPendingUsers] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [stats, setStats] = useState({ hebergements: 0, agences: 0, total: 0, pending: 0, byType: {} })
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [toast, setToast] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => { fetchData() }, [])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const [pendingRes, allRes] = await Promise.all([
                axios.get('/auth/admin/users/pending'),
                axios.get('/auth/admin/users'),
            ])
            const all = allRes.data?.data || []
            const pending = pendingRes.data?.data || []
            setAllUsers(all)
            setPendingUsers(pending)

            const approved = all.filter(u => u.status === 'APPROVED')
            const hebergements = approved.filter(u => u.role === 'HEBERGEMENT_ADMIN')
            const agences = approved.filter(u => u.role === 'AGENCY_ADMIN')

            const byType = {}
            hebergements.forEach(u => {
                const t = u.typeHebergement || 'hotel'
                byType[t] = (byType[t] || 0) + 1
            })
            if (agences.length > 0) byType['_agence'] = agences.length

            setStats({
                hebergements: hebergements.length,
                agences: agences.length,
                total: all.length,
                pending: pending.length,
                byType,
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (user, action) => {
        const id = user.id_utilisateur || user.id
        setActionLoading(id + action)
        try {
            await axios.put(`/auth/admin/users/${id}/${action}`)
            setSelectedUser(null)
            await fetchData()
            showToast(`Utilisateur ${action === 'approve' ? 'approuve' : 'rejete'} avec succes.`)
        } catch {
            showToast('Une erreur est survenue.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredPending = activeFilter
        ? pendingUsers.filter(u => {
            if (activeFilter === '_agence') return u.role === 'AGENCY_ADMIN'
            return (u.typeHebergement || 'hotel') === activeFilter
        })
        : pendingUsers

    const recentUsers = [...allUsers]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onApprove={(u) => handleAction(u, 'approve')}
                    onReject={(u) => handleAction(u, 'reject')}
                    actionLoading={actionLoading}
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#66CAD8] transition">
                    <RefreshCw size={15}/> Actualiser
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Clock} label="En attente" value={stats.pending}
                         change={0} changeLabel="Demandes a traiter"
                         color={`linear-gradient(135deg, ${CYAN}, ${NAVY})`}
                         spark={[2,4,3,5,2,4,stats.pending]}
                         onClick={() => navigate('/admin/users')} />
                <KpiCard icon={Building2} label="Hebergements" value={stats.hebergements}
                         change={12} changeLabel="Etablissements actifs"
                         color={`linear-gradient(135deg, ${NAVY}, ${PURPLE})`}
                         spark={[1,3,2,4,3,5,stats.hebergements]}
                         onClick={() => navigate('/admin/hotels')} />
                <KpiCard icon={Handshake} label="Agences" value={stats.agences}
                         change={8} changeLabel="Agences partenaires"
                         color={`linear-gradient(135deg, ${PURPLE}, ${CYAN})`}
                         spark={[1,2,1,3,2,3,stats.agences]}
                         onClick={() => navigate('/admin/agences')} />
                <KpiCard icon={Users} label="Utilisateurs" value={stats.total}
                         change={5} changeLabel="Tous roles confondus"
                         color={`linear-gradient(135deg, ${CYAN}, ${PURPLE})`}
                         spark={[3,5,4,6,5,7,stats.total]}
                         onClick={() => navigate('/admin/users')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                <Clock size={16}/>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm">Demandes en attente</h2>
                                <p className="text-xs text-gray-500">
                                    {activeFilter
                                        ? `${filteredPending.length} resultat(s) — ${activeFilter === '_agence' ? 'Agences' : TYPE_LABELS[activeFilter] || activeFilter}`
                                        : `${pendingUsers.length} a valider`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeFilter && (
                                <button onClick={() => setActiveFilter(null)}
                                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition">
                                    Effacer
                                </button>
                            )}
                            <button onClick={() => navigate('/admin/users')}
                                    className="flex items-center gap-1 text-xs font-medium hover:underline"
                                    style={{ color: CYAN }}>
                                Voir tout <ArrowRight size={12}/>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center">
                            <RefreshCw size={24} className="animate-spin mx-auto text-gray-300"/>
                        </div>
                    ) : filteredPending.length === 0 ? (
                        <div className="p-10 text-center">
                            <CheckCircle size={36} className="mx-auto mb-3 text-green-300"/>
                            <p className="text-gray-500 font-medium text-sm">Aucune demande en attente</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredPending.slice(0, 5).map(user => {
                                const id = user.id_utilisateur || user.id
                                return (
                                    <div key={id}
                                         className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer"
                                         onClick={() => setSelectedUser(user)}>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                             style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                            {user.prenom?.[0]}{user.nom?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{user.prenom} {user.nom}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                                                    {user.role?.replace(/_/g, ' ')}
                                                </span>
                                                {user.typeHebergement && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
                                                        {TYPE_LABELS[user.typeHebergement] || user.typeHebergement}
                                                    </span>
                                                )}
                                                {user.nomEtablissement && (
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.nomEtablissement}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={e => { e.stopPropagation(); setSelectedUser(user) }}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#66CAD8] hover:text-[#1D2252] transition">
                                                <Eye size={11}/> Details
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); handleAction(user, 'approve') }}
                                                    disabled={actionLoading === id + 'approve'}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:scale-105 disabled:opacity-50"
                                                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                                <CheckCircle size={11}/> Approuver
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); handleAction(user, 'reject') }}
                                                    disabled={actionLoading === id + 'reject'}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:scale-105 disabled:opacity-50"
                                                    style={{ background: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)` }}>
                                                <XCircle size={11}/> Rejeter
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                                 style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                                <Activity size={16}/>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm">Repartition</h2>
                                <p className="text-xs text-gray-500">Hebergements & Agences actifs</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 overflow-y-auto max-h-80">
                        {Object.keys(stats.byType).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Aucun partenaire actif</p>
                        ) : (
                            Object.entries(stats.byType)
                                .sort((a, b) => b[1] - a[1])
                                .map(([type, count]) => {
                                    const totalPartners = stats.hebergements + stats.agences
                                    const pct = totalPartners > 0 ? Math.round((count / totalPartners) * 100) : 0
                                    const isActive = activeFilter === type
                                    const isAgence = type === '_agence'
                                    return (
                                        <button key={type} onClick={() => setActiveFilter(isActive ? null : type)}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                                                    isActive ? 'border-[#66CAD8] bg-[#66CAD8]/5' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                                }`}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                                    {isAgence && <Handshake size={11} style={{ color: PURPLE }}/>}
                                                    {isAgence ? 'Agences de voyage' : (TYPE_LABELS[type] || type)}
                                                </span>
                                                <span className="text-xs font-bold text-gray-900">{count}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500"
                                                     style={{ width: `${pct}%`, background: isAgence ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})` : `linear-gradient(90deg, ${CYAN}, ${PURPLE})` }}/>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">{pct}% du total partenaires</p>
                                        </button>
                                    )
                                })
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                <Calendar size={16}/>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm">Dernieres inscriptions</h2>
                                <p className="text-xs text-gray-500">Tous statuts — {allUsers.length} utilisateurs au total</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/admin/users')}
                                className="flex items-center gap-1 text-xs font-medium hover:underline"
                                style={{ color: CYAN }}>
                            Voir tout <ArrowRight size={12}/>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {recentUsers.map(user => (
                                <tr key={user.id_utilisateur || user.id}
                                    className="hover:bg-gray-50 transition cursor-pointer"
                                    onClick={() => setSelectedUser(user)}>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                {user.prenom?.[0]}{user.nom?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{user.prenom} {user.nom}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 hidden sm:table-cell">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-gray-600">{user.role?.replace(/_/g, ' ')}</span>
                                            {user.typeHebergement && (
                                                <span className="text-[10px]" style={{ color: PURPLE }}>{TYPE_LABELS[user.typeHebergement]}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3"><StatusBadge status={user.status}/></td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <span className="text-xs text-gray-400">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="font-bold text-gray-900 text-sm px-1">Acces rapides</h2>
                    {[
                        { label: 'Gerer les utilisateurs',   desc: `${stats.pending} en attente`,     icon: Users,      path: '/admin/users',           color: `linear-gradient(135deg, ${CYAN}, ${NAVY})` },
                        { label: 'Gerer les hebergements',   desc: `${stats.hebergements} actifs`,    icon: Building2,  path: '/admin/hotels',          color: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` },
                        { label: 'Gerer les agences',        desc: `${stats.agences} actives`,        icon: Handshake,  path: '/admin/agences',         color: `linear-gradient(135deg, ${PURPLE}, ${CYAN})` },
                        { label: 'Voir les reservations',    desc: 'Toutes les reservations',         icon: Calendar,   path: '/admin/reservations',    color: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` },
                        { label: 'Rapports & Analytique',    desc: 'Statistiques globales',           icon: TrendingUp, path: '/admin/rapports',        color: `linear-gradient(135deg, ${NAVY}, ${CYAN})` },
                        { label: 'Channel Manager',          desc: 'Synchronisation canaux',          icon: Zap,        path: '/admin/channel-manager', color: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` },
                    ].map((a, i) => {
                        const Icon = a.icon
                        return (
                            <button key={i} onClick={() => navigate(a.path)}
                                    className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all text-left group">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                                     style={{ background: a.color }}>
                                    <Icon size={16}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                                    <p className="text-xs text-gray-400">{a.desc}</p>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition shrink-0"/>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-bold text-gray-900">Activite de la plateforme</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Inscriptions, repartition partenaires — 6 derniers mois</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                        {[
                            { color: CYAN,   label: 'Inscriptions' },
                            { color: NAVY,   label: 'Hebergements' },
                            { color: PURPLE, label: 'Agences' },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm" style={{ background: color }}/>
                                <span className="text-gray-500">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={[
                        { mois: 'Jan', inscriptions: 4,  hebergements: 2, agences: 1, approuves: 3, rejetes: 1 },
                        { mois: 'Fev', inscriptions: 7,  hebergements: 4, agences: 2, approuves: 5, rejetes: 2 },
                        { mois: 'Mar', inscriptions: 5,  hebergements: 3, agences: 1, approuves: 4, rejetes: 1 },
                        { mois: 'Avr', inscriptions: 10, hebergements: 6, agences: 3, approuves: 8, rejetes: 2 },
                        { mois: 'Mai', inscriptions: 8,  hebergements: 5, agences: 2, approuves: 6, rejetes: 2 },
                        { mois: 'Jun', inscriptions: stats.total, hebergements: stats.hebergements, agences: stats.agences,
                            approuves: Math.max(0, stats.total - stats.pending), rejetes: Math.round(stats.total * 0.1) },
                    ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                                 labelStyle={{ fontWeight: 'bold', color: NAVY }}/>
                        <Bar dataKey="inscriptions" name="Inscriptions" fill={CYAN} radius={[4,4,0,0]} opacity={0.85}/>
                        <Bar dataKey="hebergements" name="Hebergements" fill={NAVY} radius={[4,4,0,0]} opacity={0.85}/>
                        <Bar dataKey="agences" name="Agences" fill={PURPLE} radius={[4,4,0,0]} opacity={0.85}/>
                        <Line type="monotone" dataKey="approuves" name="Approuves" stroke={CYAN} strokeWidth={2.5} dot={{ fill: CYAN, r: 4 }}/>
                        <Line type="monotone" dataKey="rejetes" name="Rejetes" stroke={PURPLE} strokeWidth={2.5} dot={{ fill: PURPLE, r: 4 }} strokeDasharray="4 4"/>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
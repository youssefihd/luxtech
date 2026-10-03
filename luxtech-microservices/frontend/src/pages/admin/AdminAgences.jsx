import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
    Search, Filter, Eye, CheckCircle, XCircle, RefreshCw,
    Handshake, MapPin, Phone, Globe, Compass,
    FileText, X, ChevronDown, AlertTriangle, Users
} from 'lucide-react'
import { agencyAdminApi } from '../../api/agencyAdminApi'

const TYPE_CONFIG = {
    receptives:  { label: 'Agences réceptives',  icon: Compass, desc: 'Accueillent les touristes étrangers au Maroc' },
    emettrices:  { label: 'Agences émettrices',  icon: Globe,   desc: 'Envoient des touristes vers d\'autres destinations' },
}

const STATUS_MAP = {
    APPROVED:         { label: 'Approuvée',   bg: '#E8F7FA', color: '#66CAD8' },
    PENDING_APPROVAL: { label: 'En attente',  bg: '#FEF9E7', color: '#d97706' },
    REJECTED:         { label: 'Rejetée',     bg: '#EDE8F2', color: '#5D2E8B' },
    SUSPENDED:        { label: 'Suspendue',   bg: '#f9fafb', color: '#6b7280' },
}

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP.PENDING_APPROVAL
    return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    )
}

const DetailModal = ({ user, onClose, onAction, actionLoading }) => {
    if (!user) return null
    const id = user.id_utilisateur || user.id

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                             style={{ background: 'linear-gradient(135deg, #5D2E8B, #66CAD8)' }}>
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

                <div className="p-6 space-y-5">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <Users size={15} style={{ color: '#5D2E8B' }}/> Informations personnelles
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Nom complet', value: `${user.prenom} ${user.nom}` },
                                { label: 'Email', value: user.email },
                                { label: 'Téléphone', value: user.telephone || '—' },
                                { label: 'Statut', value: <StatusBadge status={user.status}/> },
                                { label: 'Date inscription', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—' },
                                { label: 'Compte actif', value: user.isActive ? 'Oui' : 'Non' },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                    <div className="text-sm font-medium text-gray-800">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(user.nomEtablissement || user.ville) && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                                <Handshake size={15} style={{ color: '#5D2E8B' }}/> Informations agence
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Nom de l'agence", value: user.nomEtablissement || '—' },
                                    { label: 'Ville', value: user.ville || '—' },
                                    { label: 'Adresse', value: user.adresse || '—' },
                                    { label: 'Licence', value: user.licenceVoyage || '—' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
                    <button onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 transition">
                        Fermer
                    </button>
                    {user.status === 'PENDING_APPROVAL' && (
                        <>
                            <button onClick={() => onAction(user, 'reject')} disabled={actionLoading === id + 'reject'}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #5D2E8B, #4a1d7a)' }}>
                                {actionLoading === id + 'reject' ? <RefreshCw size={14} className="animate-spin"/> : <XCircle size={14}/>} Rejeter
                            </button>
                            <button onClick={() => onAction(user, 'approve')} disabled={actionLoading === id + 'approve'}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252)' }}>
                                {actionLoading === id + 'approve' ? <RefreshCw size={14} className="animate-spin"/> : <CheckCircle size={14}/>} Approuver
                            </button>
                        </>
                    )}
                    {user.status === 'APPROVED' && (
                        <button onClick={() => onAction(user, 'suspend')} disabled={actionLoading === id + 'suspend'}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}>
                            <XCircle size={14}/> Suspendre
                        </button>
                    )}
                    {user.status === 'SUSPENDED' && (
                        <button onClick={() => onAction(user, 'approve')} disabled={actionLoading === id + 'approve'}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252)' }}>
                            <CheckCircle size={14}/> Réactiver
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function AdminAgences() {
    const { type } = useParams()
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.receptives
    const TypeIcon = config.icon

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedUser, setSelectedUser] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = useCallback((msg, t = 'success') => {
        setToast({ msg, type: t })
        setTimeout(() => setToast(null), 3000)
    }, [])

    const fetchUsers = useCallback(async (searchTerm = '', signal) => {
        setLoading(true)
        try {
            const res = await agencyAdminApi.search(searchTerm, signal)
            const all = res.data?.data || []
            setUsers(all)
        } catch (err) {
            if (!signal?.aborted) {
                console.error(err)
                showToast('Impossible de charger les agences.', 'error')
            }
        } finally {
            if (!signal?.aborted) setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        const controller = new AbortController()
        const timer = window.setTimeout(() => fetchUsers(search, controller.signal), search ? 300 : 0)
        return () => {
            window.clearTimeout(timer)
            controller.abort()
        }
    }, [type, search, fetchUsers])

    const handleAction = async (user, action) => {
        const id = user.id_utilisateur || user.id
        setActionLoading(id + action)
        try {
            await agencyAdminApi[action](id)
            setSelectedUser(null)
            await fetchUsers(search)
            showToast('Action effectuée avec succès !')
        } catch {
            showToast('Une erreur est survenue.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const filtered = users.filter(u => {
        const q = search.toLowerCase()
        const matchSearch = !search ||
            `${u.prenom} ${u.nom}`.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.nomEtablissement?.toLowerCase().includes(q) ||
            u.ville?.toLowerCase().includes(q)
        const matchStatus = statusFilter === 'ALL' || u.status === statusFilter
        return matchSearch && matchStatus
    })

    const stats = {
        total: users.length,
        approved: users.filter(u => u.status === 'APPROVED').length,
        pending: users.filter(u => u.status === 'PENDING_APPROVAL').length,
        suspended: users.filter(u => u.status === 'SUSPENDED').length,
    }

    return (
        <div className="space-y-6">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            {selectedUser && (
                <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)}
                             onAction={handleAction} actionLoading={actionLoading}/>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                         style={{ background: 'linear-gradient(135deg, #5D2E8B, #66CAD8)' }}>
                        <TypeIcon size={22}/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{config.label}</h1>
                        <p className="text-gray-500 text-sm">{config.desc}</p>
                    </div>
                </div>
                <button onClick={fetchUsers}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#66CAD8] transition">
                    <RefreshCw size={15}/> Actualiser
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: '#5D2E8B' },
                    { label: 'Actives', value: stats.approved, color: '#66CAD8' },
                    { label: 'En attente', value: stats.pending, color: '#d97706' },
                    { label: 'Suspendues', value: stats.suspended, color: '#6b7280' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                        <div className="h-1 rounded-full mt-3" style={{ background: s.color, width: `${stats.total > 0 ? (s.value/stats.total)*100 : 0}%`, minWidth: s.value > 0 ? '8px' : '0' }}/>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par nom, email, agence, ville..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                    </div>
                    <div className="relative">
                        <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm bg-white appearance-none">
                            <option value="ALL">Tous les statuts</option>
                            <option value="APPROVED">Approuvées</option>
                            <option value="PENDING_APPROVAL">En attente</option>
                            <option value="REJECTED">Rejetées</option>
                            <option value="SUSPENDED">Suspendues</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Liste des {config.label}</h2>
                    <span className="text-sm text-gray-500">{filtered.length} résultat(s)</span>
                </div>

                {loading ? (
                    <div className="p-10 text-center">
                        <RefreshCw size={24} className="animate-spin mx-auto text-gray-300 mb-3"/>
                        <p className="text-gray-500 text-sm">Chargement...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center">
                        <TypeIcon size={36} className="mx-auto mb-3 text-gray-300"/>
                        <p className="text-gray-500 font-medium">Aucune agence trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Responsable</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Agence</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Localisation</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map(user => {
                                const id = user.id_utilisateur || user.id
                                return (
                                    <tr key={id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                     style={{ background: 'linear-gradient(135deg, #5D2E8B, #66CAD8)' }}>
                                                    {user.prenom?.[0]}{user.nom?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{user.prenom} {user.nom}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <p className="text-sm font-medium text-gray-800">{user.nomEtablissement || '—'}</p>
                                            {user.telephone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={10}/>{user.telephone}</p>}
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-700 flex items-center gap-1">
                                                <MapPin size={12} style={{ color: '#5D2E8B' }}/>{user.ville || '—'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4"><StatusBadge status={user.status}/></td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <p className="text-xs text-gray-400">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setSelectedUser(user)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#66CAD8] hover:text-[#1D2252] transition">
                                                    <Eye size={12}/> Voir
                                                </button>
                                                {user.status === 'PENDING_APPROVAL' && (
                                                    <button onClick={() => handleAction(user, 'approve')}
                                                            disabled={actionLoading === id + 'approve'}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:scale-105 disabled:opacity-50"
                                                            style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252)' }}>
                                                        <CheckCircle size={11}/> Approuver
                                                    </button>
                                                )}
                                                {user.status === 'APPROVED' && (
                                                    <button onClick={() => handleAction(user, 'suspend')}
                                                            disabled={actionLoading === id + 'suspend'}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:scale-105 disabled:opacity-50"
                                                            style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}>
                                                        <XCircle size={11}/> Suspendre
                                                    </button>
                                                )}
                                                {user.status === 'SUSPENDED' && (
                                                    <button onClick={() => handleAction(user, 'approve')}
                                                            disabled={actionLoading === id + 'approve'}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:scale-105 disabled:opacity-50"
                                                            style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252)' }}>
                                                        <CheckCircle size={11}/> Réactiver
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

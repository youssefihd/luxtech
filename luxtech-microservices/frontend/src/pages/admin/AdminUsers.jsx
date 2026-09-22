import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, AlertTriangle, Users, RefreshCw } from 'lucide-react'
import axios from '../../api/axios'

const STATUS_COLORS = {
    APPROVED:         { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Approuve' },
    PENDING_APPROVAL: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'En attente' },
    REJECTED:         { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rejete' },
    SUSPENDED:        { bg: 'bg-gray-50',   text: 'text-gray-600',   label: 'Suspendu' },
}

const ROLE_LABELS = {
    SUPER_ADMIN:        'Super Admin',
    HEBERGEMENT_ADMIN:  'Hebergement',
    HEBERGEMENT_STAFF:  'Staff Hebergement',
    AGENCY_ADMIN:       'Agence',
    AGENCY_STAFF:       'Staff Agence',
    CLIENT:             'Client',
}

const TYPE_HEBERGEMENT_LABELS = {
    hotel:     'Hotel',
    auberge:   'Auberge',
    camping:   'Camping',
    ferme:     'Ferme',
    gite:      'Gite',
    maison:    "Maison d'hotes",
    pension:   'Pension',
    relais:    'Relais',
    residence: 'Residence hoteliere',
    riad:      'Riad',
}

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterRole, setFilterRole] = useState('ALL')
    const [actionLoading, setActionLoading] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => { fetchUsers() }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/auth/admin/users')
            setUsers(res.data?.data || [])
        } catch {
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleAction = async (id, action) => {
        setActionLoading(id + action)
        try {
            await axios.put(`/auth/admin/users/${id}/${action}`)
            await fetchUsers()
            const labels = { approve: 'approuve', reject: 'rejete', suspend: 'suspendu' }
            showToast(`Utilisateur ${labels[action] || action} avec succes.`)
        } catch {
            showToast('Une erreur est survenue.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const filtered = users.filter(u => {
        const matchSearch = !search ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.nom?.toLowerCase().includes(search.toLowerCase()) ||
            u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
            u.nomEtablissement?.toLowerCase().includes(search.toLowerCase()) ||
            u.ville?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'ALL' || u.status === filterStatus
        const matchRole = filterRole === 'ALL' || u.role === filterRole
        return matchSearch && matchStatus && matchRole
    })

    const getId = (u) => u.id_utilisateur || u.id

    return (
        <div className="space-y-6">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <XCircle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                    <p className="text-gray-500 text-sm mt-1">{users.length} utilisateur(s) au total</p>
                </div>
                <button onClick={fetchUsers}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:border-[#66CAD8] transition">
                    <RefreshCw size={15}/> Actualiser
                </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Rechercher par nom, email, etablissement, ville..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66CAD8]" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66CAD8] bg-white">
                        <option value="ALL">Tous les statuts</option>
                        <option value="PENDING_APPROVAL">En attente</option>
                        <option value="APPROVED">Approuves</option>
                        <option value="REJECTED">Rejetes</option>
                        <option value="SUSPENDED">Suspendus</option>
                    </select>
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66CAD8] bg-white">
                        <option value="ALL">Tous les roles</option>
                        <option value="HEBERGEMENT_ADMIN">Hebergement</option>
                        <option value="HEBERGEMENT_STAFF">Staff Hebergement</option>
                        <option value="AGENCY_ADMIN">Agence</option>
                        <option value="AGENCY_STAFF">Staff Agence</option>
                        <option value="CLIENT">Client</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Chargement...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucun utilisateur trouve</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Etablissement</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role / Type</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map(user => {
                                const status = STATUS_COLORS[user.status] || STATUS_COLORS.PENDING_APPROVAL
                                const uid = getId(user)
                                return (
                                    <tr key={uid} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                                     style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                                    {user.prenom?.[0]}{user.nom?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{user.prenom} {user.nom}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                    {user.telephone && <p className="text-xs text-gray-400">{user.telephone}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.nomEtablissement ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{user.nomEtablissement}</p>
                                                    {user.ville && <p className="text-xs text-gray-400">{user.ville}</p>}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                                                    {ROLE_LABELS[user.role] || user.role}
                                                </span>
                                                {user.typeHebergement && (
                                                    <span className="text-xs text-[#5D2E8B] bg-purple-50 px-2 py-0.5 rounded-lg w-fit">
                                                        {TYPE_HEBERGEMENT_LABELS[user.typeHebergement] || user.typeHebergement}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button disabled={actionLoading === uid + 'approve'}
                                                                onClick={() => handleAction(uid, 'approve')}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:scale-105 transition disabled:opacity-60"
                                                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                                            <CheckCircle size={13} /> Approuver
                                                        </button>
                                                        <button disabled={actionLoading === uid + 'reject'}
                                                                onClick={() => handleAction(uid, 'reject')}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:scale-105 transition disabled:opacity-60"
                                                                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                                            <XCircle size={13} /> Rejeter
                                                        </button>
                                                    </>
                                                )}
                                                {user.status === 'APPROVED' && user.role !== 'SUPER_ADMIN' && (
                                                    <button disabled={actionLoading === uid + 'suspend'}
                                                            onClick={() => handleAction(uid, 'suspend')}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:scale-105 transition disabled:opacity-60"
                                                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                                        <AlertTriangle size={13} /> Suspendre
                                                    </button>
                                                )}
                                                {(user.status === 'REJECTED' || user.status === 'SUSPENDED') && (
                                                    <button disabled={actionLoading === uid + 'approve'}
                                                            onClick={() => handleAction(uid, 'approve')}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:scale-105 transition disabled:opacity-60"
                                                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                                        <CheckCircle size={13} /> Reactiver
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
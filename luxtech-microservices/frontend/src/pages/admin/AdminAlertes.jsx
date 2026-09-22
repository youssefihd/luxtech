import { useState, useEffect } from 'react'
import {
    AlertTriangle, Clock, XCircle, ShieldOff, CheckCircle,
    RefreshCw, Eye, Building2, MapPin, X, Users
} from 'lucide-react'
import axios from '../../api/axios'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const TYPE_LABELS = {
    hotel: 'Hôtel', auberge: 'Auberge', camping: 'Camping',
    ferme: 'Ferme', gite: 'Gîte', maison: "Maison d'hôtes",
    pension: 'Pension', relais: 'Relais', residence: 'Résidence', riad: 'Riad',
}

const daysSince = (date) => date
    ? Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    : 0

// ── Modal détail ──────────────────────────────────────────
const DetailModal = ({ user, onClose, onAction, actionLoading }) => {
    if (!user) return null
    const id = user.id_utilisateur || user.id
    const days = daysSince(user.createdAt)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
                <div className="p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Rôle', value: user.role?.replace(/_/g, ' ') },
                            { label: 'Statut', value: user.status?.replace(/_/g, ' ') },
                            { label: 'Établissement', value: user.nomEtablissement || '—' },
                            { label: 'Type', value: TYPE_LABELS[user.typeHebergement] || user.typeHebergement || '—' },
                            { label: 'Ville', value: user.ville || '—' },
                            { label: 'Inscrit depuis', value: `${days} jour(s)` },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                <p className="text-sm font-medium text-gray-800">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 transition">
                        Fermer
                    </button>
                    {user.status === 'PENDING_APPROVAL' && (
                        <>
                            <button onClick={() => onAction(user, 'reject')} disabled={actionLoading === id + 'reject'}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
                                    style={{ background: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)` }}>
                                {actionLoading === id + 'reject' ? <RefreshCw size={14} className="animate-spin"/> : <XCircle size={14}/>} Rejeter
                            </button>
                            <button onClick={() => onAction(user, 'approve')} disabled={actionLoading === id + 'approve'}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
                                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                {actionLoading === id + 'approve' ? <RefreshCw size={14} className="animate-spin"/> : <CheckCircle size={14}/>} Approuver
                            </button>
                        </>
                    )}
                    {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                        <button onClick={() => onAction(user, 'approve')} disabled={actionLoading === id + 'approve'}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            {actionLoading === id + 'approve' ? <RefreshCw size={14} className="animate-spin"/> : <CheckCircle size={14}/>} Réactiver
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Ligne utilisateur ─────────────────────────────────────
const UserRow = ({ user, onView, onAction, actionLoading, showDays = false }) => {
    const id = user.id_utilisateur || user.id
    const days = daysSince(user.createdAt)
    const urgent = days >= 7

    return (
        <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                {user.prenom?.[0]}{user.nom?.[0]}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{user.prenom} {user.nom}</p>
                    {showDays && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            urgent ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            {days} jour(s)
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {user.nomEtablissement && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 size={10}/> {user.nomEtablissement}
                        </span>
                    )}
                    {user.ville && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={10}/> {user.ville}
                        </span>
                    )}
                    {user.typeHebergement && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: '#EDE8F2', color: PURPLE }}>
                            {TYPE_LABELS[user.typeHebergement] || user.typeHebergement}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onView(user)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#66CAD8] hover:text-[#1D2252] transition">
                    <Eye size={11}/> Voir
                </button>
                {user.status === 'PENDING_APPROVAL' && (
                    <>
                        <button onClick={() => onAction(user, 'reject')} disabled={actionLoading === id + 'reject'}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)` }}>
                            {actionLoading === id + 'reject' ? <RefreshCw size={11} className="animate-spin"/> : <XCircle size={11}/>} Rejeter
                        </button>
                        <button onClick={() => onAction(user, 'approve')} disabled={actionLoading === id + 'approve'}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            {actionLoading === id + 'approve' ? <RefreshCw size={11} className="animate-spin"/> : <CheckCircle size={11}/>} Approuver
                        </button>
                    </>
                )}
                {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                    <button onClick={() => onAction(user, 'approve')} disabled={actionLoading === id + 'approve'}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {actionLoading === id + 'approve' ? <RefreshCw size={11} className="animate-spin"/> : <CheckCircle size={11}/>} Réactiver
                    </button>
                )}
            </div>
        </div>
    )
}

// ── Section ───────────────────────────────────────────────
const Section = ({ title, icon: Icon, color, users, emptyMsg, onView, onAction, actionLoading, showDays }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                 style={{ background: color }}>
                <Icon size={16}/>
            </div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: color }}>
                {users.length}
            </span>
        </div>
        {users.length === 0 ? (
            <div className="p-10 text-center">
                <CheckCircle size={32} className="mx-auto mb-3 text-green-300"/>
                <p className="text-gray-500 text-sm">{emptyMsg}</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-50">
                {users.map(u => (
                    <UserRow key={u.id_utilisateur || u.id} user={u}
                             onView={onView} onAction={onAction}
                             actionLoading={actionLoading} showDays={showDays}/>
                ))}
            </div>
        )}
    </div>
)

// ── PAGE PRINCIPALE ───────────────────────────────────────
export default function AdminAlertes() {
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [selectedUser, setSelectedUser] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => { fetchData() }, [])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/auth/admin/users')
            setAllUsers(res.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleAction = async (user, action) => {
        const id = user.id_utilisateur || user.id
        setActionLoading(id + action)
        try {
            await axios.put(`/auth/admin/users/${id}/${action}`)
            setSelectedUser(null)
            await fetchData()
            showToast('Action effectuée avec succès !')
        } catch { showToast('Une erreur est survenue.', 'error') }
        finally { setActionLoading(null) }
    }

    const pending   = allUsers.filter(u => u.status === 'PENDING_APPROVAL' && daysSince(u.createdAt) >= 3)
        .sort((a, b) => daysSince(b.createdAt) - daysSince(a.createdAt))
    const suspended = allUsers.filter(u => u.status === 'SUSPENDED')
    const rejected  = allUsers.filter(u => u.status === 'REJECTED')

    const totalAlerts = pending.length + suspended.length + rejected.length
    const critiques   = pending.filter(u => daysSince(u.createdAt) >= 7).length

    const tabs = [
        { key: 'pending',   label: 'En attente',  count: pending.length,   icon: Clock,     color: `linear-gradient(135deg, #d97706, #b45309)` },
        { key: 'suspended', label: 'Suspendus',   count: suspended.length, icon: ShieldOff, color: `linear-gradient(135deg, #6b7280, #4b5563)` },
        { key: 'rejected',  label: 'Rejetés',     count: rejected.length,  icon: XCircle,   color: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)` },
    ]

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            {/* Modal */}
            {selectedUser && (
                <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)}
                             onAction={handleAction} actionLoading={actionLoading}/>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alertes & Litiges</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Surveillance des situations nécessitant une action</p>
                </div>
                <button onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#66CAD8] transition">
                    <RefreshCw size={15}/> Actualiser
                </button>
            </div>

            {/* Bannière critique */}
            {critiques > 0 && (
                <div className="rounded-2xl p-4 flex items-center gap-4 text-white"
                     style={{ background: `linear-gradient(135deg, #dc2626, #b91c1c)` }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20}/>
                    </div>
                    <div>
                        <p className="font-bold">{critiques} demande(s) en attente depuis plus de 7 jours</p>
                        <p className="text-sm text-red-200 mt-0.5">Ces partenaires attendent une réponse urgente. Veuillez traiter leurs dossiers.</p>
                    </div>
                    <button onClick={() => setActiveTab('pending')}
                            className="ml-auto px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition shrink-0">
                        Voir maintenant
                    </button>
                </div>
            )}

            {/* Stats résumé */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total alertes',    value: totalAlerts,        color: `linear-gradient(135deg, ${NAVY}, ${PURPLE})`,  icon: AlertTriangle },
                    { label: 'Actions critiques', value: critiques,          color: 'linear-gradient(135deg, #dc2626, #b91c1c)',    icon: Clock },
                    { label: 'Comptes bloqués',  value: suspended.length + rejected.length, color: `linear-gradient(135deg, #6b7280, #4b5563)`, icon: ShieldOff },
                ].map((s, i) => {
                    const Icon = s.icon
                    return (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                                 style={{ background: s.color }}>
                                <Icon size={20}/>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-sm text-gray-500">{s.label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Onglets */}
            <div className="flex gap-2 border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const active = activeTab === tab.key
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                                    active ? 'border-[#66CAD8] text-[#1D2252]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}>
                            <Icon size={15}/>
                            {tab.label}
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                active ? 'text-white' : 'bg-gray-100 text-gray-600'
                            }`} style={active ? { background: tab.color } : {}}>
                                {tab.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Contenu onglets */}
            {loading ? (
                <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                    <RefreshCw size={24} className="animate-spin mx-auto text-gray-300 mb-3"/>
                    <p className="text-gray-500 text-sm">Chargement...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'pending' && (
                        <Section title="Demandes en attente depuis +3 jours"
                                 icon={Clock} color="linear-gradient(135deg, #d97706, #b45309)"
                                 users={pending} showDays
                                 emptyMsg="Aucune demande en attente prolongée"
                                 onView={setSelectedUser} onAction={handleAction} actionLoading={actionLoading}/>
                    )}
                    {activeTab === 'suspended' && (
                        <Section title="Comptes suspendus"
                                 icon={ShieldOff} color="linear-gradient(135deg, #6b7280, #4b5563)"
                                 users={suspended}
                                 emptyMsg="Aucun compte suspendu"
                                 onView={setSelectedUser} onAction={handleAction} actionLoading={actionLoading}/>
                    )}
                    {activeTab === 'rejected' && (
                        <Section title="Comptes rejetés"
                                 icon={XCircle} color={`linear-gradient(135deg, ${PURPLE}, #4a1d7a)`}
                                 users={rejected}
                                 emptyMsg="Aucun compte rejeté"
                                 onView={setSelectedUser} onAction={handleAction} actionLoading={actionLoading}/>
                    )}
                </>
            )}
        </div>
    )
}
import { useState, useEffect } from 'react'
import {
    ShieldCheck, Users, Clock, Settings, RefreshCw,
    CheckCircle, XCircle, AlertTriangle, Search,
    ChevronDown, Filter, Eye, EyeOff, Save, Lock,
    Unlock, Shield, Activity, Globe, Smartphone
} from 'lucide-react'
import axios from '../../api/axios'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const ROLE_CONFIG = {
    SUPER_ADMIN:        { label: 'Super Admin',        bg: '#EDE8F2', color: PURPLE },
    HEBERGEMENT_ADMIN:  { label: 'Admin Hebergement',  bg: '#E8F7FA', color: CYAN },
    HEBERGEMENT_STAFF:  { label: 'Staff Hebergement',  bg: '#E8F7FA', color: '#0891b2' },
    AGENCY_ADMIN:       { label: 'Admin Agence',       bg: '#FEF9E7', color: '#d97706' },
    AGENCY_STAFF:       { label: 'Staff Agence',       bg: '#FEF9E7', color: '#b45309' },
    CLIENT:             { label: 'Client',             bg: '#f9fafb', color: '#6b7280' },
}

const STATUS_CONFIG = {
    APPROVED:         { label: 'Actif',      bg: '#E8F7FA', color: CYAN },
    PENDING_APPROVAL: { label: 'En attente', bg: '#FEF9E7', color: '#d97706' },
    REJECTED:         { label: 'Rejete',     bg: '#EDE8F2', color: PURPLE },
    SUSPENDED:        { label: 'Suspendu',   bg: '#f9fafb', color: '#6b7280' },
}

const RoleBadge = ({ role }) => {
    const c = ROLE_CONFIG[role] || ROLE_CONFIG.CLIENT
    return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: c.bg, color: c.color }}>{c.label}</span>
    )
}

const StatusBadge = ({ status }) => {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING_APPROVAL
    return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: c.bg, color: c.color }}>{c.label}</span>
    )
}

const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
            className="relative w-11 h-6 rounded-full transition-all duration-300"
            style={{ background: checked ? `linear-gradient(135deg, ${CYAN}, ${NAVY})` : '#e5e7eb' }}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
            checked ? 'left-6' : 'left-1'
        }`}/>
    </button>
)

const generateHistory = (users) => {
    const actions = ['Connexion reussie', 'Tentative echouee', 'Deconnexion', 'Changement mot de passe', 'Connexion reussie', 'Connexion reussie']
    const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.0.100', '10.10.1.50']
    const statuses = ['success', 'failed', 'success', 'success', 'success', 'success']
    const history = []
    users.slice(0, 8).forEach((u, i) => {
        history.push({
            id: i + 1,
            userId: u.id_utilisateur || u.id,
            nom: `${u.prenom} ${u.nom}`,
            email: u.email,
            role: u.role,
            action: actions[i % actions.length],
            ip: ips[i % ips.length],
            status: statuses[i % statuses.length],
            date: new Date(Date.now() - i * 3600000 * (i + 1)),
        })
    })
    return history.sort((a, b) => b.date - a.date)
}

export default function AdminSecurite() {
    const [activeTab, setActiveTab] = useState('acces')
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [actionLoading, setActionLoading] = useState(null)
    const [toast, setToast] = useState(null)
    const [saving, setSaving] = useState(false)

    const [politique, setPolitique] = useState({
        dureeSession: '24',
        maxTentatives: '5',
        dureeVerrouillage: '30',
        forceMotDePasse: 'forte',
        doubleAuth: false,
        journalisation: true,
        ipWhitelist: false,
        alerteConnexionSuspecte: true,
        expirationMotDePasse: '90',
        historiqueMdp: '5',
    })

    useEffect(() => { fetchUsers() }, [])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/auth/admin/users')
            setAllUsers(res.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleToggleActive = async (user) => {
        const id = user.id_utilisateur || user.id
        const action = user.isActive ? 'suspend' : 'approve'
        setActionLoading(id)
        try {
            await axios.put(`/auth/admin/users/${id}/${action}`)
            await fetchUsers()
            showToast('Statut mis a jour !')
        } catch { showToast('Erreur lors de la mise a jour.', 'error') }
        finally { setActionLoading(null) }
    }

    const handleSavePolitique = async () => {
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))
        setSaving(false)
        showToast('Politique de securite sauvegardee !')
    }

    const filtered = allUsers.filter(u => {
        const q = search.toLowerCase()
        const matchSearch = !search ||
            `${u.prenom} ${u.nom}`.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter
        return matchSearch && matchRole
    })

    const history = generateHistory(allUsers)

    const tabs = [
        { key: 'acces',      label: 'Acces et Roles',      icon: Users },
        { key: 'historique', label: 'Historique',           icon: Activity },
        { key: 'politique',  label: 'Politique securite',   icon: Shield },
    ]

    const statsSecurite = {
        actifs:    allUsers.filter(u => u.isActive).length,
        inactifs:  allUsers.filter(u => !u.isActive).length,
        suspendus: allUsers.filter(u => u.status === 'SUSPENDED').length,
        admins:    allUsers.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'HEBERGEMENT_ADMIN' || u.role === 'AGENCY_ADMIN').length,
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Securite et Acces</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Gerez les droits d'acces et la politique de securite</p>
                </div>
                <button onClick={fetchUsers}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#66CAD8] transition">
                    <RefreshCw size={15}/> Actualiser
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Comptes actifs',   value: statsSecurite.actifs,    icon: CheckCircle, color: `linear-gradient(135deg, ${CYAN}, ${NAVY})` },
                    { label: 'Comptes inactifs', value: statsSecurite.inactifs,  icon: XCircle,     color: 'linear-gradient(135deg, #6b7280, #4b5563)' },
                    { label: 'Suspendus',        value: statsSecurite.suspendus, icon: Lock,        color: `linear-gradient(135deg, ${PURPLE}, #4a1d7a)` },
                    { label: 'Administrateurs',  value: statsSecurite.admins,    icon: ShieldCheck, color: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` },
                ].map((s, i) => {
                    const Icon = s.icon
                    return (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                                 style={{ background: s.color }}>
                                <Icon size={18}/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex gap-1 border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const active = activeTab === tab.key
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                                    active ? 'border-[#66CAD8] text-[#1D2252]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}>
                            <Icon size={15}/> {tab.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'acces' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Rechercher par nom ou email..."
                                       value={search} onChange={e => setSearch(e.target.value)}
                                       className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                            <div className="relative">
                                <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                                        className="pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm bg-white appearance-none">
                                    <option value="ALL">Tous les roles</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                    <option value="HEBERGEMENT_ADMIN">Admin Hebergement</option>
                                    <option value="HEBERGEMENT_STAFF">Staff Hebergement</option>
                                    <option value="AGENCY_ADMIN">Admin Agence</option>
                                    <option value="AGENCY_STAFF">Staff Agence</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Gestion des acces</h2>
                            <span className="text-sm text-gray-500">{filtered.length} utilisateur(s)</span>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center">
                                <RefreshCw size={24} className="animate-spin mx-auto text-gray-300 mb-3"/>
                                <p className="text-gray-500 text-sm">Chargement...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Statut</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acces actif</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Inscrit le</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {filtered.map(user => {
                                        const id = user.id_utilisateur || user.id
                                        return (
                                            <tr key={id} className="hover:bg-gray-50 transition">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                             style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                            {user.prenom?.[0]}{user.nom?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{user.prenom} {user.nom}</p>
                                                            <p className="text-xs text-gray-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 hidden sm:table-cell">
                                                    <RoleBadge role={user.role}/>
                                                </td>
                                                <td className="px-5 py-3.5 hidden md:table-cell">
                                                    <StatusBadge status={user.status}/>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {actionLoading === id ? (
                                                            <RefreshCw size={16} className="animate-spin text-gray-400"/>
                                                        ) : (
                                                            <Toggle checked={Boolean(user.isActive)}
                                                                    onChange={() => user.role !== 'SUPER_ADMIN' && handleToggleActive(user)}/>
                                                        )}
                                                        {user.role === 'SUPER_ADMIN' && (
                                                            <span className="text-xs text-gray-400">Protege</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 hidden lg:table-cell">
                                                    <p className="text-xs text-gray-400">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
                                                    </p>
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
            )}

            {activeTab === 'historique' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Historique des connexions</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Donnees simulees</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {history.map(h => (
                            <div key={h.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    h.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                    {h.status === 'success'
                                        ? <CheckCircle size={16} className="text-green-500"/>
                                        : <XCircle size={16} className="text-red-500"/>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="font-semibold text-gray-900 text-sm">{h.nom}</p>
                                        <RoleBadge role={h.role}/>
                                    </div>
                                    <p className="text-xs text-gray-400">{h.email}</p>
                                </div>
                                <div className="text-center hidden md:block">
                                    <p className="text-sm font-medium text-gray-700">{h.action}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 justify-center">
                                        <Globe size={10}/> {h.ip}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-gray-500">{h.date.toLocaleDateString('fr-FR')}</p>
                                    <p className="text-xs text-gray-400">{h.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'politique' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock size={16} style={{ color: CYAN }}/> Sessions et Connexions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duree de session (heures)</label>
                                <input type="number" value={politique.dureeSession}
                                       onChange={e => setPolitique(p => ({ ...p, dureeSession: e.target.value }))}
                                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tentatives max avant blocage</label>
                                <input type="number" value={politique.maxTentatives}
                                       onChange={e => setPolitique(p => ({ ...p, maxTentatives: e.target.value }))}
                                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duree verrouillage (minutes)</label>
                                <input type="number" value={politique.dureeVerrouillage}
                                       onChange={e => setPolitique(p => ({ ...p, dureeVerrouillage: e.target.value }))}
                                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock size={16} style={{ color: CYAN }}/> Politique des mots de passe
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Force minimale</label>
                                <select value={politique.forceMotDePasse}
                                        onChange={e => setPolitique(p => ({ ...p, forceMotDePasse: e.target.value }))}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm bg-white">
                                    <option value="faible">Faible (6 caracteres)</option>
                                    <option value="moyenne">Moyenne (8 car. + chiffres)</option>
                                    <option value="forte">Forte (10 car. + speciaux)</option>
                                    <option value="tres_forte">Tres forte (12 car. + tout)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (jours)</label>
                                <input type="number" value={politique.expirationMotDePasse}
                                       onChange={e => setPolitique(p => ({ ...p, expirationMotDePasse: e.target.value }))}
                                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Historique (derniers MDP)</label>
                                <input type="number" value={politique.historiqueMdp}
                                       onChange={e => setPolitique(p => ({ ...p, historiqueMdp: e.target.value }))}
                                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldCheck size={16} style={{ color: CYAN }}/> Options avancees
                        </h3>
                        <div className="space-y-4">
                            {[
                                { key: 'doubleAuth',              label: 'Double authentification (2FA)',   desc: 'Exiger une verification en deux etapes pour tous les admins' },
                                { key: 'journalisation',          label: 'Journalisation des activites',   desc: 'Enregistrer toutes les actions des utilisateurs' },
                                { key: 'ipWhitelist',             label: 'Liste blanche IP',               desc: "Restreindre l'acces admin a des adresses IP specifiques" },
                                { key: 'alerteConnexionSuspecte', label: 'Alertes connexions suspectes',   desc: 'Notifier en cas de connexion depuis un nouveau lieu ou appareil' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <Toggle checked={politique[item.key]}
                                            onChange={v => setPolitique(p => ({ ...p, [item.key]: v }))}/>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleSavePolitique} disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            {saving ? <RefreshCw size={15} className="animate-spin"/> : <Save size={15}/>}
                            Sauvegarder la politique
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
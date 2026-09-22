import { useState, useEffect, useCallback } from 'react'
import {
    Users, Plus, Edit3, Trash2, X, Check, RefreshCw, AlertTriangle,
    Mail, Phone, Briefcase, Eye, Search
} from 'lucide-react'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const POSTES = [
    'Réceptionniste', 'Comptable', 'Femme de ménage', 'Manager', 'Autre',
]

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

const EmployeeForm = ({ isOpen, employee, onSubmit, onClose }) => {
    const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', poste: POSTES[0], password: '' })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setForm({
                nom: employee?.nom || '', prenom: employee?.prenom || '',
                email: employee?.email || '', telephone: employee?.telephone || '',
                poste: employee?.poste || POSTES[0], password: '',
            })
        }
    }, [isOpen, employee])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const handleSubmit = async () => {
        if (!form.nom.trim() || !form.prenom.trim()) { setError('Le nom et le prénom sont obligatoires'); return }
        if (!employee && !form.email.trim()) { setError("L'email est obligatoire"); return }
        if (!employee && (!form.password || form.password.length < 8)) { setError('Le mot de passe doit comporter au moins 8 caractères'); return }
        setProcessing(true)
        try {
            await onSubmit(form)
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null
    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Users size={18} className="text-white"/>
                            </div>
                            <h2 className="text-lg font-black text-white">{employee ? "Modifier l'employé" : 'Ajouter un employé'}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 font-medium"><AlertTriangle size={14}/>{error}</div>}

                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Prénom *</label><input {...F('prenom')} placeholder="Prénom" className={ic}/></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Nom *</label><input {...F('nom')} placeholder="Nom" className={ic}/></div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Email {!employee && '*'}</label>
                        <input type="email" {...F('email')} placeholder="email@exemple.com" disabled={!!employee} className={ic + (employee ? ' opacity-60 cursor-not-allowed' : '')}/>
                        {employee && <p className="text-[11px] text-gray-400 mt-1">L'email ne peut pas être modifié</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Téléphone</label>
                        <input {...F('telephone')} placeholder="+212 6XX XXXXXX" className={ic}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Poste</label>
                        <select {...F('poste')} className={ic}>
                            {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">
                            Mot de passe {!employee && '*'}
                        </label>
                        <input type="password" {...F('password')} placeholder={employee ? 'Laisser vide pour ne pas changer' : 'Min. 8 caractères'} className={ic}/>
                    </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Enregistrer</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

const EmployeeDetailModal = ({ employee, onClose }) => {
    if (!employee) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
                <div className="p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-lg">
                                {employee.prenom?.[0]}{employee.nom?.[0]}
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">{employee.prenom} {employee.nom}</h2>
                                <p className="text-white/60 text-xs">{employee.poste || 'Employé'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18} className="text-white"/></button>
                    </div>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail size={16} className="text-gray-400"/>
                        <div><p className="text-sm font-bold text-gray-900">{employee.email}</p><p className="text-xs text-gray-400">Email</p></div>
                    </div>
                    {employee.telephone && (
                        <div className="flex items-center gap-3">
                            <Phone size={16} className="text-gray-400"/>
                            <div><p className="text-sm font-bold text-gray-900">{employee.telephone}</p><p className="text-xs text-gray-400">Téléphone</p></div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Briefcase size={16} className="text-gray-400"/>
                        <div><p className="text-sm font-bold text-gray-900">{employee.poste || '—'}</p><p className="text-xs text-gray-400">Poste</p></div>
                    </div>
                </div>
                <div className="p-5 border-t border-gray-100">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">Fermer</button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementEmployees() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            // Récupère l'hébergement via hebergement-service pour avoir son ID
            const hebergementAxios = (await import('../../api/axios')).hebergementAxios
            const hRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = hRes?.data?.data
            setHebergement(h)
            if (h?.id) {
                const res = await axios.get(`/auth/hebergements/${h.id}/employees`).catch(() => null)
                setEmployees(res?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const filtered = employees.filter(e => {
        const q = search.toLowerCase()
        return !search || `${e.prenom} ${e.nom}`.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.poste || '').toLowerCase().includes(q)
    })

    const handleCreate = async (data) => {
        try {
            await axios.post(`/auth/hebergements/${hebergement.id}/employees`, {
                nom: data.nom, prenom: data.prenom, email: data.email,
                telephone: data.telephone || null, password: data.password, poste: data.poste,
            })
            showToast('Employé ajouté avec succès !')
            setShowForm(false)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || "Erreur lors de la création")
        }
    }

    const handleUpdate = async (data) => {
        try {
            await axios.put(`/auth/employees/${editingEmployee.id}`, {
                nom: data.nom, prenom: data.prenom, telephone: data.telephone || null,
                poste: data.poste, password: data.password || null,
            })
            showToast('Employé mis à jour !')
            setEditingEmployee(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || "Erreur lors de la mise à jour")
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`/auth/employees/${deleteTarget.id}`)
            showToast('Employé supprimé.')
            setDeleteTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-24"><RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/></div>
    }

    return (
        <div className="space-y-5 max-w-5xl mx-auto">

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
                        <h1 className="text-2xl font-black text-white">Employés</h1>
                        <p className="text-white/60 text-sm mt-1">Gérez les employés de votre établissement</p>
                    </div>
                    <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg shrink-0"
                            style={{ color: NAVY }}>
                        <Plus size={16}/> Ajouter un employé
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard title="Total employés" value={employees.length} icon={Users} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Postes distincts" value={new Set(employees.map(e => e.poste).filter(Boolean)).size} icon={Briefcase} color={PURPLE} bg="#f3e8ff"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Rechercher par nom, email, poste..."
                           value={search} onChange={e => setSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <Users size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucun employé</p>
                        <p className="text-gray-400 text-sm">Ajoutez votre premier employé pour commencer</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map(emp => (
                            <div key={emp.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0"
                                     style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                    {emp.prenom?.[0]}{emp.nom?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900">{emp.prenom} {emp.nom}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={11}/> {emp.email}</p>
                                </div>
                                {emp.poste && (
                                    <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold shrink-0" style={{ background: `${CYAN}15`, color: NAVY }}>
                                        {emp.poste}
                                    </span>
                                )}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => setSelectedEmployee(emp)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" title="Voir détails"><Eye size={15}/></button>
                                    <button onClick={() => setEditingEmployee(emp)} className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Modifier"><Edit3 size={15}/></button>
                                    <button onClick={() => setDeleteTarget(emp)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" title="Supprimer"><Trash2 size={15}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EmployeeForm isOpen={showForm} employee={null} onSubmit={handleCreate} onClose={() => setShowForm(false)}/>
            <EmployeeForm isOpen={!!editingEmployee} employee={editingEmployee} onSubmit={handleUpdate} onClose={() => setEditingEmployee(null)}/>
            <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)}/>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-gray-100">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-600"/></div>
                            <h2 className="text-lg font-black text-gray-900">Supprimer {deleteTarget.prenom} {deleteTarget.nom} ?</h2>
                            <p className="text-sm text-gray-500 mt-1">Cette action est irréversible.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">Annuler</button>
                            <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
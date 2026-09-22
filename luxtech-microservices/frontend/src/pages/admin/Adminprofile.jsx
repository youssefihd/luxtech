import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from '../../api/axios'
import {
    User, Mail, Phone, Lock, Eye, EyeOff, Check, AlertCircle,
    RefreshCw, Shield, Calendar, Activity, Edit2, Save, X
} from 'lucide-react'

export default function AdminProfile() {
    const { user, setUser } = useAuth()

    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    // Formulaire infos
    const [form, setForm] = useState({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        telephone: user?.telephone || '',
    })

    // Formulaire mot de passe
    const [passForm, setPassForm] = useState({
        ancienMdp: '',
        nouveauMdp: '',
        confirmMdp: '',
    })
    const [showPass, setShowPass] = useState({ ancien: false, nouveau: false, confirm: false })
    const [passLoading, setPassLoading] = useState(false)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const strengthScore = (pwd) => {
        let s = 0
        if (pwd.length >= 8) s++
        if (/[A-Z]/.test(pwd)) s++
        if (/[0-9]/.test(pwd)) s++
        if (/[^A-Za-z0-9]/.test(pwd)) s++
        return s
    }
    const s = strengthScore(passForm.nouveauMdp)
    const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
    const strengthLabels = ['Trop court', 'Faible', 'Moyen', 'Bon', 'Excellent']

    const handleSaveInfo = async () => {
        if (!form.prenom || !form.nom) {
            showToast('Prénom et nom sont obligatoires.', 'error')
            return
        }
        setLoading(true)
        try {
            const res = await axios.put('/auth/me', form, {
                headers: { 'X-User-Id': String(user?.id || user?.id_utilisateur) }
            })
            if (res.data?.data) {
                const updated = { ...user, ...res.data.data }
                setUser?.(updated)
                localStorage.setItem('user', JSON.stringify(updated))
            }
            setEditMode(false)
            showToast('Profil mis à jour avec succès !')
        } catch {
            showToast('Erreur lors de la mise à jour.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePass = async () => {
        if (!passForm.ancienMdp || !passForm.nouveauMdp || !passForm.confirmMdp) {
            showToast('Tous les champs mot de passe sont requis.', 'error')
            return
        }
        if (passForm.nouveauMdp !== passForm.confirmMdp) {
            showToast('Les mots de passe ne correspondent pas.', 'error')
            return
        }
        if (passForm.nouveauMdp.length < 8) {
            showToast('Le mot de passe doit contenir au moins 8 caractères.', 'error')
            return
        }
        setPassLoading(true)
        try {
            await axios.put('/auth/me', { password: passForm.nouveauMdp }, {
                headers: { 'X-User-Id': String(user?.id || user?.id_utilisateur) }
            })
            setPassForm({ ancienMdp: '', nouveauMdp: '', confirmMdp: '' })
            showToast('Mot de passe modifié avec succès !')
        } catch {
            showToast('Erreur lors du changement de mot de passe.', 'error')
        } finally {
            setPassLoading(false)
        }
    }

    const cancelEdit = () => {
        setForm({ prenom: user?.prenom || '', nom: user?.nom || '', telephone: user?.telephone || '' })
        setEditMode(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertCircle size={16}/> : <Check size={16}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles et votre sécurité</p>
            </div>

            {/* Carte profil principale */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Bannière */}
                <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B, #66CAD8)' }}/>

                <div className="px-6 pb-6">
                    {/* Avatar + infos */}
                    <div className="flex items-end justify-between -mt-10 mb-6">
                        <div className="flex items-end gap-4">
                            <div className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                                 style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                {user?.prenom?.[0]}{user?.nom?.[0]}
                            </div>
                            <div className="mb-1">
                                <h2 className="text-xl font-bold text-gray-900">{user?.prenom} {user?.nom}</h2>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                                      style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                    {user?.role?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                        {!editMode ? (
                            <button onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-[#66CAD8] transition">
                                <Edit2 size={15}/> Modifier
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={cancelEdit}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition">
                                    <X size={15}/> Annuler
                                </button>
                                <button onClick={handleSaveInfo} disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:shadow-lg disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                    {loading ? <RefreshCw size={15} className="animate-spin"/> : <Save size={15}/>}
                                    Enregistrer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Grille infos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prénom</label>
                            {editMode ? (
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input type="text" value={form.prenom}
                                           onChange={e => setForm(p => ({...p, prenom: e.target.value}))}
                                           className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                    <User size={16} className="text-gray-400"/>
                                    <span className="text-sm text-gray-800 font-medium">{user?.prenom || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nom</label>
                            {editMode ? (
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input type="text" value={form.nom}
                                           onChange={e => setForm(p => ({...p, nom: e.target.value}))}
                                           className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                    <User size={16} className="text-gray-400"/>
                                    <span className="text-sm text-gray-800 font-medium">{user?.nom || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                <Mail size={16} className="text-gray-400"/>
                                <span className="text-sm text-gray-800 font-medium">{user?.email || '—'}</span>
                                <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Vérifié</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                            {editMode ? (
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input type="tel" value={form.telephone}
                                           onChange={e => setForm(p => ({...p, telephone: e.target.value}))}
                                           placeholder="+212 6 00 00 00 00"
                                           className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                    <Phone size={16} className="text-gray-400"/>
                                    <span className="text-sm text-gray-800 font-medium">{user?.telephone || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Rôle</label>
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                <Shield size={16} className="text-gray-400"/>
                                <span className="text-sm text-gray-800 font-medium">{user?.role?.replace(/_/g, ' ') || '—'}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Membre depuis</label>
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                <Calendar size={16} className="text-gray-400"/>
                                <span className="text-sm text-gray-800 font-medium">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques activité */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={18} style={{ color: '#66CAD8' }}/> Activité du compte
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Statut du compte', value: user?.status === 'APPROVED' ? 'Actif' : user?.status || '—', color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Compte actif', value: user?.isActive ? 'Oui' : 'Non', color: user?.isActive ? 'text-green-600' : 'text-red-600', bg: user?.isActive ? 'bg-green-50' : 'bg-red-50' },
                        { label: 'Email vérifié', value: user?.emailVerifiedAt ? 'Oui' : 'Non', color: user?.emailVerifiedAt ? 'text-green-600' : 'text-amber-600', bg: user?.emailVerifiedAt ? 'bg-green-50' : 'bg-amber-50' },
                        { label: 'Niveau d\'accès', value: 'Super Admin', color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} rounded-xl p-4 text-center`}>
                            <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Changer mot de passe */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Lock size={18} style={{ color: '#66CAD8' }}/> Changer le mot de passe
                </h3>
                <p className="text-sm text-gray-500 mb-5">Pour votre sécurité, utilisez un mot de passe fort d'au moins 8 caractères.</p>

                <div className="space-y-4 max-w-md">
                    {/* Ancien mdp */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type={showPass.ancien ? 'text' : 'password'}
                                   value={passForm.ancienMdp}
                                   onChange={e => setPassForm(p => ({...p, ancienMdp: e.target.value}))}
                                   placeholder="Votre mot de passe actuel"
                                   className="w-full pl-9 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            <button type="button" onClick={() => setShowPass(p => ({...p, ancien: !p.ancien}))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPass.ancien ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>

                    {/* Nouveau mdp */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type={showPass.nouveau ? 'text' : 'password'}
                                   value={passForm.nouveauMdp}
                                   onChange={e => setPassForm(p => ({...p, nouveauMdp: e.target.value}))}
                                   placeholder="Nouveau mot de passe"
                                   className="w-full pl-9 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            <button type="button" onClick={() => setShowPass(p => ({...p, nouveau: !p.nouveau}))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPass.nouveau ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                        {passForm.nouveauMdp && (
                            <div className="mt-2">
                                <div className="flex gap-1 mb-1">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= s ? strengthColors[s-1] : 'bg-gray-200'}`}/>
                                    ))}
                                </div>
                                <p className={`text-xs ${s <= 1 ? 'text-red-500' : s <= 2 ? 'text-orange-500' : s <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    Force : {strengthLabels[s]}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirmer mdp */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type={showPass.confirm ? 'text' : 'password'}
                                   value={passForm.confirmMdp}
                                   onChange={e => setPassForm(p => ({...p, confirmMdp: e.target.value}))}
                                   placeholder="Confirmez le nouveau mot de passe"
                                   className={`w-full pl-9 pr-10 py-3 border-2 rounded-xl focus:outline-none text-sm transition ${
                                       passForm.confirmMdp && passForm.nouveauMdp !== passForm.confirmMdp
                                           ? 'border-red-300 focus:border-red-400'
                                           : 'border-gray-200 focus:border-[#66CAD8]'
                                   }`}/>
                            <button type="button" onClick={() => setShowPass(p => ({...p, confirm: !p.confirm}))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPass.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                        {passForm.confirmMdp && passForm.nouveauMdp !== passForm.confirmMdp && (
                            <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    <button onClick={handleChangePass} disabled={passLoading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition hover:shadow-lg disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                        {passLoading ? <RefreshCw size={16} className="animate-spin"/> : <Lock size={16}/>}
                        Changer le mot de passe
                    </button>
                </div>
            </div>

        </div>
    )
}
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Save, Handshake } from 'lucide-react'
import axios from '../../api/axios'

export default function AgencyProfile() {
    const { user } = useAuth()
    const [agence, setAgence] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        if (user?.agencyId) {
            axios.get(`/api/agence/agences/${user.agencyId}`)
                .then(r => setAgence(r.data?.data || r.data))
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [user])

    const handleSave = async () => {
        if (!agence) return
        setSaving(true)
        try {
            await axios.put(`/api/agence/agences/${agence.id}`, agence)
            setToast({ msg: 'Profil mis à jour avec succès !', type: 'success' })
        } catch {
            setToast({ msg: 'Erreur lors de la sauvegarde.', type: 'error' })
        } finally {
            setSaving(false)
            setTimeout(() => setToast(null), 3000)
        }
    }

    const field = (label, key, type = 'text') => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type}
                   value={agence?.[key] || ''}
                   onChange={e => setAgence({ ...agence, [key]: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66CAD8]" />
        </div>
    )

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

    return (
        <div className="space-y-6">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profil de l'agence</h1>
                    <p className="text-gray-500 text-sm mt-1">Gérez les informations de votre agence</p>
                </div>
                <button onClick={handleSave} disabled={saving || !agence}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition hover:scale-105 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                    <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </div>

            {!agence ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <Handshake size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">Aucune agence associée à votre compte</p>
                    <p className="text-gray-400 text-sm">Contactez l'administrateur pour configurer votre agence.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {field("Nom de l'agence", 'nom')}
                        {field('Email', 'email', 'email')}
                        {field('Téléphone', 'telephone')}
                        {field('Site web', 'siteWeb', 'url')}
                        {field('Ville', 'ville')}
                        {field('Pays', 'pays')}
                        {field('Adresse complète', 'adresse')}
                        {field('Licence de voyage', 'licenceVoyage')}
                        {field('IBAN', 'iban')}
                    </div>
                    <div className="mt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows={4} value={agence?.description || ''}
                                  onChange={e => setAgence({ ...agence, description: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66CAD8] resize-none" />
                    </div>
                </div>
            )}
        </div>
    )
}
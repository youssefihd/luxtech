import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Users, Pencil, Trash2, X, UserRound, Mail, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { agencyAxios } from '../../api/axios'

const EMPTY_FORM = {
    nom: '', prenom: '', email: '', telephone: '', nationalite: '',
    dateNaissance: '', adresse: '', preferences: '',
}

export default function AgencyClients() {
    const { user } = useAuth()
    const agencyId = user?.agencyId
    const [clients, setClients] = useState([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [notice, setNotice] = useState('')
    const [formError, setFormError] = useState('')
    const [editing, setEditing] = useState(null)
    const [formOpen, setFormOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)

    const loadClients = useCallback(async () => {
        if (!agencyId) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const response = await agencyAxios.get(`/agence/${agencyId}/clients`)
            setClients(response.data?.data || [])
        } catch {
            setNotice('Impossible de charger les clients. Vérifiez votre connexion puis réessayez.')
        } finally {
            setLoading(false)
        }
    }, [agencyId])

    useEffect(() => { loadClients() }, [loadClients])

    const filteredClients = useMemo(() => {
        const needle = query.trim().toLocaleLowerCase('fr')
        if (!needle) return clients
        return clients.filter(client =>
            [client.nom, client.prenom, client.email, client.telephone, client.nationalite]
                .some(value => value?.toLocaleLowerCase('fr').includes(needle))
        )
    }, [clients, query])

    const startCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setFormOpen(true)
        setNotice('')
        setFormError('')
    }

    const startEdit = (client) => {
        setEditing(client)
        setForm({ ...EMPTY_FORM, ...client, dateNaissance: client.dateNaissance || '' })
        setFormOpen(true)
        setNotice('')
        setFormError('')
    }

    const closeForm = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setFormOpen(false)
        setFormError('')
    }

    const saveClient = async (event) => {
        event.preventDefault()
        setSaving(true)
        setNotice('')
        setFormError('')
        const payload = Object.fromEntries(Object.keys(EMPTY_FORM).map(key => [key, form[key] || null]))
        try {
            if (editing) {
                await agencyAxios.put(`/agence/${agencyId}/clients/${editing.id}`, payload)
            } else {
                await agencyAxios.post(`/agence/${agencyId}/clients`, payload)
            }
            closeForm()
            await loadClients()
        } catch (error) {
            setFormError(error.response?.data?.message || 'Enregistrement impossible. Vérifiez les champs saisis.')
        } finally {
            setSaving(false)
        }
    }

    const deleteClient = async (client) => {
        if (!window.confirm(`Supprimer la fiche de ${client.prenom} ${client.nom} ?`)) return
        setNotice('')
        try {
            await agencyAxios.delete(`/agence/${agencyId}/clients/${client.id}`)
            setClients(current => current.filter(item => item.id !== client.id))
        } catch (error) {
            setNotice(error.response?.data?.message || 'Suppression impossible. Réessayez.')
        }
    }

    const updateField = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
    const fieldClass = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#66CAD8] focus:ring-2 focus:ring-[#66CAD8]/20'

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="mt-1 text-sm text-gray-500">Centralisez les coordonnées et préférences de vos voyageurs.</p>
                </div>
                <button type="button" onClick={startCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                    <Plus size={17} /> Ajouter un client
                </button>
            </div>

            {notice && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div>}

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <label className="relative block">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={query} onChange={event => setQuery(event.target.value)}
                           placeholder="Rechercher par nom, email, téléphone ou nationalité"
                           className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#66CAD8] focus:ring-2 focus:ring-[#66CAD8]/20" />
                </label>
                <p className="mt-3 text-xs text-gray-500">{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500">Chargement des clients…</div>
            ) : filteredClients.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
                    <Users size={38} className="mx-auto mb-3 text-gray-300" />
                    <h2 className="font-semibold text-gray-900">{query ? 'Aucun résultat' : 'Votre carnet client est vide'}</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{query ? 'Essayez un autre nom ou une autre coordonnée.' : 'Ajoutez une fiche pour retrouver rapidement les coordonnées de vos voyageurs.'}</p>
                    {!query && <button type="button" onClick={startCreate} className="mt-4 text-sm font-semibold text-[#4B8794] hover:underline">Ajouter le premier client</button>}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredClients.map(client => (
                        <article key={client.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#66CAD8]/15 text-[#276879]">
                                        <UserRound size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate font-semibold text-gray-900">{client.prenom} {client.nom}</h2>
                                        <p className="text-xs text-gray-500">{client.nationalite || 'Nationalité non renseignée'}</p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <button type="button" onClick={() => startEdit(client)} aria-label={`Modifier ${client.prenom} ${client.nom}`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><Pencil size={16} /></button>
                                    <button type="button" onClick={() => deleteClient(client)} aria-label={`Supprimer ${client.prenom} ${client.nom}`} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="mt-5 space-y-2.5 text-sm text-gray-600">
                                <p className="flex items-center gap-2 break-all"><Mail size={15} className="shrink-0 text-gray-400" />{client.email || 'Email non renseigné'}</p>
                                <p className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-gray-400" />{client.telephone || 'Téléphone non renseigné'}</p>
                            </div>
                            {client.preferences && <p className="mt-4 line-clamp-2 border-t border-gray-100 pt-3 text-xs text-gray-500">Préférences : {client.preferences}</p>}
                        </article>
                    ))}
                </div>
            )}

            {formOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) closeForm() }}>
                    <form onSubmit={saveClient} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{editing ? 'Modifier le client' : 'Nouveau client'}</h2>
                                <p className="mt-1 text-sm text-gray-500">Les champs marqués d’un * sont obligatoires.</p>
                            </div>
                            <button type="button" onClick={closeForm} aria-label="Fermer" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        {formError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{formError}</p>}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-medium text-gray-700">Prénom *<input required maxLength={100} name="prenom" value={form.prenom} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700">Nom *<input required maxLength={100} name="nom" value={form.nom} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700">Email<input type="email" maxLength={150} name="email" value={form.email || ''} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700">Téléphone<input maxLength={30} name="telephone" value={form.telephone || ''} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700">Nationalité<input maxLength={80} name="nationalite" value={form.nationalite || ''} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700">Date de naissance<input type="date" name="dateNaissance" value={form.dateNaissance || ''} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Adresse<input maxLength={300} name="adresse" value={form.adresse || ''} onChange={updateField} className={`${fieldClass} mt-1.5`} /></label>
                            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Préférences / notes<textarea rows={3} name="preferences" value={form.preferences || ''} onChange={updateField} className={`${fieldClass} mt-1.5 resize-y`} /></label>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={closeForm} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                            <button type="submit" disabled={saving} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

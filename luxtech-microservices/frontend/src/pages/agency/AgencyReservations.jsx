// AgencyReservations.jsx
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, Ban, Calendar, RefreshCw, Search } from 'lucide-react'
import { agencyAxios } from '../../api/axios'

export default function AgencyReservations() {
    const { user } = useAuth()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [actionError, setActionError] = useState('')
    const [cancellingId, setCancellingId] = useState(null)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')

   const loadReservations = useCallback(async () => {
    if (!user?.agencyId) {
        setReservations([])
        setLoadError('Aucune agence n’est associée à ce compte.')
        setLoading(false)
        return
    }

    setLoading(true)
    setLoadError('')

   try {
    const response = await agencyAxios.get('/booking/agency/reservations')
    setReservations(response.data?.data || response.data || [])
} catch (error) {
    console.error('Erreur chargement réservations:', error)

    setLoadError(
        error.response?.data?.message ||
        'Impossible de charger les réservations. Vérifiez votre connexion puis réessayez.'
    )
} finally {
    setLoading(false)
}
}, [user?.agencyId])

    useEffect(() => { loadReservations() }, [loadReservations])

    const requestCancellation = async reservation => {
        const motif = window.prompt(`Motif de la demande d'annulation ${reservation.numeroReservation || ''} ?`)
        if (motif === null) return
        setCancellingId(reservation.id)
        setActionError('')
        try {
            await agencyAxios.post(`/booking/agency/reservations/${reservation.id}/demande-annulation`, { motif: motif.trim() || null })
            await loadReservations()
        } catch (error) {
            setActionError(error.response?.data?.message || 'Impossible de demander l annulation de cette reservation.')
        } finally {
            setCancellingId(null)
        }
    }

    const STATUS = {
        CONFIRMEE:  { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmée' },
        EN_ATTENTE: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
        ANNULEE:    { bg: 'bg-red-50',   text: 'text-red-700',   label: 'Annulée' },
        CHECKIN:    { bg: 'bg-blue-50',  text: 'text-blue-700',  label: 'Client arrivé' },
        CHECKOUT:   { bg: 'bg-gray-50',  text: 'text-gray-700',  label: 'Terminée' },
        NO_SHOW:    { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Non présenté' },
    }

    const filtered = reservations.filter(r => {
        const matchSearch = !search ||
            r.clientNom?.toLowerCase().includes(search.toLowerCase()) ||
            r.clientEmail?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
        return matchSearch && matchStatus
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
                <p className="text-gray-500 text-sm mt-1">{reservations.length} réservation(s)</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Rechercher client..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66CAD8]" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#66CAD8]">
                        <option value="ALL">Tous les statuts</option>
                        <option value="CONFIRMEE">Confirmées</option>
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="CHECKIN">Client arrivé</option>
                        <option value="CHECKOUT">Terminées</option>
                        <option value="NO_SHOW">Non présenté</option>
                        <option value="ANNULEE">Annulées</option>
                    </select>
                    <button type="button" onClick={loadReservations} disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-[#66CAD8] disabled:opacity-60">
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualiser
                    </button>
                </div>
            </div>

            {actionError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : loadError ? (
                    <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center text-red-700">
                        <AlertCircle size={28} />
                        <p className="text-sm">{loadError}</p>
                        <button type="button" onClick={loadReservations} className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold hover:bg-red-100">
                            Réessayer
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center">
                        <Calendar size={36} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Aucune réservation trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Hôtel</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Arrivée</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Départ</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map(r => {
                                const s = STATUS[r.status] || STATUS.EN_ATTENTE
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-sm text-gray-900">{r.clientNom} {r.clientPrenom}</p>
                                            <p className="text-xs text-gray-500">{r.clientEmail}</p>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-600">{r.hotelNom || r.hotelId || '—'}</td>
                                        <td className="px-5 py-3 text-sm text-gray-600">
                                            {r.dateArrivee ? new Date(r.dateArrivee).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-600">
                                            {r.dateDepart ? new Date(r.dateDepart).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                                            {r.annulationDemandeStatut === 'DEMANDEE' && <p className="mt-1 text-[11px] font-semibold text-amber-700">Annulation en attente</p>}
                                            {r.annulationDemandeStatut === 'REFUSEE' && (
                                                <p className="mt-1 text-[11px] text-red-600">
                                                    Annulation refusée{r.annulationRefusMotif ? ` : ${r.annulationRefusMotif}` : ''}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-sm" style={{ color: '#66CAD8' }}>
                                            {r.prixTotal ? `${r.prixTotal?.toLocaleString()} MAD` : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {r.source === 'AGENCE' && ['EN_ATTENTE', 'CONFIRMEE'].includes(r.status) && r.annulationDemandeStatut !== 'DEMANDEE' && (
                                                <button type="button" onClick={() => requestCancellation(r)} disabled={cancellingId === r.id}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                                                    <Ban size={13} /> {cancellingId === r.id ? 'Envoi...' : 'Demander annulation'}
                                                </button>
                                            )}
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

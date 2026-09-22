// AgencyReservations.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Calendar, Search } from 'lucide-react'
import axios from '../../api/axios'

export default function AgencyReservations() {
    const { user } = useAuth()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')

    useEffect(() => {
        if (user?.agencyId) {
            axios.get(`/api/booking/reservations/agence/${user.agencyId}`)
                .then(r => setReservations(r.data?.data || r.data || []))
                .catch(() => setReservations([]))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [user])

    const STATUS = {
        CONFIRMEE:  { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmée' },
        EN_ATTENTE: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
        ANNULEE:    { bg: 'bg-red-50',   text: 'text-red-700',   label: 'Annulée' },
        TERMINEE:   { bg: 'bg-gray-50',  text: 'text-gray-700',  label: 'Terminée' },
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
                        <option value="TERMINEE">Terminées</option>
                        <option value="ANNULEE">Annulées</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
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
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-sm" style={{ color: '#66CAD8' }}>
                                            {r.prixTotal ? `${r.prixTotal?.toLocaleString()} MAD` : '—'}
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
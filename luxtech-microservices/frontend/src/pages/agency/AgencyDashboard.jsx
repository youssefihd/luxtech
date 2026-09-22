import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Calendar, DollarSign, TrendingUp, Building2 } from 'lucide-react'
import axios from '../../api/axios'

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4"
             style={{ background: color }}>
            <Icon size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
)

export default function AgencyDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [agence, setAgence] = useState(null)
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (user?.agencyId) {
                const [agenceRes, resaRes] = await Promise.allSettled([
                    axios.get(`/api/agence/agences/${user.agencyId}`),
                    axios.get(`/api/booking/reservations/agence/${user.agencyId}?limit=5`),
                ])
                if (agenceRes.status === 'fulfilled') setAgence(agenceRes.value.data?.data || agenceRes.value.data)
                if (resaRes.status === 'fulfilled') setReservations(resaRes.value.data?.data || [])
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const STATUS = {
        CONFIRMEE:  { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmée' },
        EN_ATTENTE: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
        ANNULEE:    { bg: 'bg-red-50',   text: 'text-red-700',   label: 'Annulée' },
        TERMINEE:   { bg: 'bg-gray-50',  text: 'text-gray-700',  label: 'Terminée' },
    }

    return (
        <div className="space-y-6">

            {/* Welcome */}
            <div className="rounded-2xl p-6 text-white"
                 style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                <h1 className="text-2xl font-bold mb-1">Bonjour, {user?.prenom} 👋</h1>
                <p className="text-white/70">{agence?.nom || 'Votre agence'} — Tableau de bord</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Réservations totales" value={reservations.length}
                          color="linear-gradient(135deg, #66CAD8, #1D2252)" />
                <StatCard icon={TrendingUp} label="Réservations actives"
                          value={reservations.filter(r => r.status === 'CONFIRMEE').length}
                          color="linear-gradient(135deg, #1D2252, #5D2E8B)" />
                <StatCard icon={DollarSign} label="Commissions"
                          value={agence?.commissionTaux ? `${agence.commissionTaux}%` : '—'}
                          color="linear-gradient(135deg, #10b981, #059669)" />
                <StatCard icon={Building2} label="Plafond crédit"
                          value={agence?.plafondCredit ? `${agence.plafondCredit?.toLocaleString()} MAD` : '—'}
                          color="linear-gradient(135deg, #f59e0b, #d97706)" />
            </div>

            {/* Réservations récentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Réservations récentes</h2>
                    <button onClick={() => navigate('/agence/reservations')}
                            className="text-sm font-medium hover:underline" style={{ color: '#66CAD8' }}>
                        Voir tout →
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : reservations.length === 0 ? (
                    <div className="p-8 text-center">
                        <Calendar size={36} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Aucune réservation pour le moment</p>
                        <button onClick={() => navigate('/agence/reservations')}
                                className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-medium"
                                style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                            Faire une réservation
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Hôtel</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Arrivée</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Départ</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {reservations.map(r => {
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

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Nouvelle réservation', icon: Calendar, path: '/agence/reservations' },
                    { label: 'Voir les hôtels', icon: Building2, path: '/agence/reservations' },
                    { label: 'Mon agence', icon: TrendingUp, path: '/agence/profile' },
                ].map((a, i) => {
                    const Icon = a.icon
                    return (
                        <button key={i} onClick={() => navigate(a.path)}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#66CAD8] transition-all">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                                 style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                <Icon size={18} />
                            </div>
                            <p className="font-semibold text-gray-900">{a.label}</p>
                        </button>
                    )
                })}
            </div>

        </div>
    )
}
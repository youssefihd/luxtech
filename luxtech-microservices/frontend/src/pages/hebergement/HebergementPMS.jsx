import { useState, useEffect, useCallback } from 'react'
import { Calendar, User, Check, AlertTriangle, RefreshCw } from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY = '#1D2252'
const CYAN = '#66CAD8'

export default function HebergementPMS() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [checkins, setCheckins]   = useState([])
    const [checkouts, setCheckouts] = useState([])
    const [loading, setLoading]     = useState(true)
    const [toast, setToast]         = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const load = useCallback(async () => {
        try {
            const hebergRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = hebergRes?.data?.data
            if (!h?.id) { setLoading(false); return }

            const [ci, co] = await Promise.all([
                bookingAxios.get(`/booking/reservations/hotel/${h.id}/checkins-today`).catch(() => null),
                bookingAxios.get(`/booking/reservations/hotel/${h.id}/checkouts-today`).catch(() => null),
            ])
            setCheckins(ci?.data?.data || [])
            setCheckouts(co?.data?.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => { load() }, [load])

    const action = async (fn, msg) => {
        try {
            await fn()
            showToast(msg)
            load()
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <RefreshCw size={28} className="animate-spin" style={{ color: CYAN }} />
            </div>
        )
    }

    return (
        <div>
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">PMS — Planning du jour</h2>
                <p className="text-gray-400 text-sm capitalize">{today}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                        Arrivées ({checkins.length})
                    </h3>
                    <div className="space-y-3">
                        {checkins.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center text-gray-400 py-6">
                                Aucune arrivée aujourd'hui
                            </div>
                        ) : checkins.map(r => (
                            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{r.clientPrenom} {r.clientNom}</p>
                                    <p className="text-xs text-gray-400">{r.numeroReservation} · {r.nbNuits} nuit(s)</p>
                                    {r.clientTelephone && <p className="text-xs text-gray-400">📞 {r.clientTelephone}</p>}
                                </div>
                                <button onClick={() => action(() => bookingAxios.post(`/booking/reservations/${r.id}/checkin`), 'Check-in effectué !')}
                                        className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    ✅ Check-in
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                        Départs ({checkouts.length})
                    </h3>
                    <div className="space-y-3">
                        {checkouts.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center text-gray-400 py-6">
                                Aucun départ aujourd'hui
                            </div>
                        ) : checkouts.map(r => (
                            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{r.clientPrenom} {r.clientNom}</p>
                                    <p className="text-xs text-gray-400">{r.numeroReservation} · {r.nbNuits} nuit(s)</p>
                                    {r.clientTelephone && <p className="text-xs text-gray-400">📞 {r.clientTelephone}</p>}
                                </div>
            vc                   {r.status === 'CHECKIN' ? (
                                <button onClick={() => action(() => bookingAxios.post(`/booking/reservations/${r.id}/checkout`), 'Check-out effectué !')}
                                        className="border text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        style={{ borderColor: NAVY, color: NAVY }}>
                                    🚪 Check-out
                                </button>
                            ) : (
                                <span className="text-xs font-bold text-emerald-600 px-3 py-2 rounded-lg bg-emerald-50">
                                        ✓ Parti
                                    </span>
                            )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { AlertCircle, BedDouble, CalendarDays, CheckCircle2, Hotel, LoaderCircle, MapPin, Search, Star, Users, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { agencyAxios, bookingAxios, publicApiAxios } from '../../api/axios'

const today = () => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 10)
}
const addDays = (value, days) => {
    const date = new Date(`${value}T12:00:00`)
    date.setDate(date.getDate() + days)
    return date.toISOString().slice(0, 10)
}
const money = value => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(Number(value) || 0)

const EMPTY_GUEST = { nom: '', prenom: '', email: '', telephone: '', nationalite: '', notes: '' }

export default function AgencySearch() {
    const { user } = useAuth()
    const [query, setQuery] = useState('')
    const [arrival, setArrival] = useState(() => addDays(today(), 1))
    const [departure, setDeparture] = useState(() => addDays(today(), 2))
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [hotels, setHotels] = useState([])
    const [availability, setAvailability] = useState({})
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState('')
    const [clients, setClients] = useState([])
    const [booking, setBooking] = useState(null)
    const [selectedClient, setSelectedClient] = useState('')
    const [guest, setGuest] = useState(EMPTY_GUEST)
    const [submitting, setSubmitting] = useState(false)
    const [bookingError, setBookingError] = useState('')
    const [confirmation, setConfirmation] = useState(null)

    useEffect(() => {
        if (!user?.agencyId) return
        agencyAxios.get(`/agence/${user.agencyId}/clients`)
            .then(response => setClients(response.data?.data || []))
            .catch(() => setClients([]))
    }, [user?.agencyId])

    const searchHotels = async event => {
        event.preventDefault()
        if (!arrival || !departure || departure <= arrival) {
            setError('La date de départ doit être après la date d’arrivée.')
            return
        }
        setLoading(true)
        setError('')
        setAvailability({})
        try {
            const response = await publicApiAxios.get('/search/hotels', {
                params: { ville: query.trim() || undefined, nbAdultes: adults },
            })
            const body = response.data
            if (body?.success === false) throw new Error(body.message || 'Le service de recherche a refusé la demande.')
            const payload = body?.data
            if (payload?.success === false) throw new Error(payload.message || 'Le service hôtelier est indisponible.')
            const data = Array.isArray(payload) ? payload : payload?.data
            if (!Array.isArray(data)) throw new Error('Le service de recherche a renvoyé une réponse inattendue.')
            setHotels(Array.isArray(data) ? data : [])
            setSearched(true)
        } catch (requestError) {
            setHotels([])
            setError(requestError.response?.data?.message || requestError.message || 'La recherche des hôtels a échoué. Réessayez.')
        } finally {
            setLoading(false)
        }
    }

    const checkAvailability = async hotel => {
        const id = hotel.id
        setAvailability(current => ({ ...current, [id]: { loading: true, rooms: [] } }))
        try {
            const response = await bookingAxios.get(`/booking/public/disponibilite/${id}`, {
                params: { dateArrivee: arrival, dateDepart: departure },
            })
            const rooms = (response.data?.data || []).filter(room =>
                (room.capaciteAdultes == null || room.capaciteAdultes >= adults) &&
                (room.capaciteEnfants == null || room.capaciteEnfants >= children)
            )
            setAvailability(current => ({ ...current, [id]: { loading: false, rooms } }))
        } catch {
            setAvailability(current => ({ ...current, [id]: { loading: false, rooms: [], error: 'Disponibilités momentanément indisponibles.' } }))
        }
    }

    const beginBooking = (hotel, room) => {
        setBooking({ hotel, room })
        setSelectedClient('')
        setGuest(EMPTY_GUEST)
        setBookingError('')
        setConfirmation(null)
    }

    const selectClient = clientId => {
        setSelectedClient(clientId)
        const client = clients.find(item => String(item.id) === clientId)
        if (client) {
            setGuest(current => ({
                ...current,
                nom: client.nom || '', prenom: client.prenom || '', email: client.email || '',
                telephone: client.telephone || '', nationalite: client.nationalite || '',
            }))
        } else {
            setGuest(EMPTY_GUEST)
        }
    }

    const submitBooking = async event => {
        event.preventDefault()
        setSubmitting(true)
        setBookingError('')
        try {
            const response = await agencyAxios.post('/booking/agency/reservations', {
                hotelId: booking.hotel.id,
                chambreTypeId: booking.room.chambreTypeId,
                dateArrivee: arrival,
                dateDepart: departure,
                clientNom: guest.nom.trim(),
                clientPrenom: guest.prenom.trim(),
                clientEmail: guest.email.trim(),
                clientTelephone: guest.telephone || null,
                clientNationalite: guest.nationalite || null,
                nbAdultes: adults,
                nbEnfants: children,
                notes: guest.notes || null,
            })
            setConfirmation(response.data?.data)
            setBooking(null)
        } catch (requestError) {
            setBookingError(requestError.response?.data?.message || 'La réservation n’a pas pu être créée. Les disponibilités ont peut-être changé.')
        } finally {
            setSubmitting(false)
        }
    }

    const nights = Math.max(1, Math.round((new Date(`${departure}T12:00:00`) - new Date(`${arrival}T12:00:00`)) / 86400000))

    return (
        <div className="space-y-6">
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B8794]">Catalogue LUXTECH</p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">Rechercher un hôtel</h1>
                <p className="mt-1 text-sm text-gray-500">Comparez les établissements, vérifiez les chambres disponibles et créez une demande pour votre client.</p>
            </header>

            {confirmation && (
                <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                    <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-emerald-600" />
                    <div className="flex-1">
                        <p className="font-semibold">Demande de réservation créée</p>
                        <p className="mt-1 text-sm">Référence : <strong>{confirmation.numeroReservation}</strong>. Statut : {confirmation.status || 'EN_ATTENTE'}.</p>
                    </div>
                    <button type="button" onClick={() => setConfirmation(null)} aria-label="Fermer" className="rounded-lg p-1 hover:bg-emerald-100"><X size={17} /></button>
                </div>
            )}

            {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} />{error}</div>}

            <form onSubmit={searchHotels} className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-6">
                <label className="text-xs font-semibold text-gray-600 xl:col-span-2">Ville ou destination
                    <span className="relative mt-1.5 block"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex. Marrakech" className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#66CAD8] focus:ring-2 focus:ring-[#66CAD8]/20" /></span>
                </label>
                <label className="text-xs font-semibold text-gray-600">Arrivée
                    <span className="relative mt-1.5 block"><CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input required type="date" min={today()} value={arrival} onChange={event => setArrival(event.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-2 text-sm outline-none focus:border-[#66CAD8]" /></span>
                </label>
                <label className="text-xs font-semibold text-gray-600">Départ
                    <span className="relative mt-1.5 block"><CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input required type="date" min={arrival || today()} value={departure} onChange={event => setDeparture(event.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-2 text-sm outline-none focus:border-[#66CAD8]" /></span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs font-semibold text-gray-600">Adultes<input min="1" max="20" type="number" value={adults} onChange={event => setAdults(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#66CAD8]" /></label>
                    <label className="text-xs font-semibold text-gray-600">Enfants<input min="0" max="20" type="number" value={children} onChange={event => setChildren(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#66CAD8]" /></label>
                </div>
                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 xl:self-end" style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                    {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />} Rechercher
                </button>
            </form>

            {searched && <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Résultats</h2><span className="text-sm text-gray-500">{hotels.length} établissement{hotels.length !== 1 ? 's' : ''}</span></div>}

            {searched && hotels.length === 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center"><Hotel size={35} className="mx-auto mb-3 text-gray-300" /><p className="font-semibold text-gray-800">Aucun hôtel trouvé</p><p className="mt-1 text-sm text-gray-500">Essayez une autre destination.</p></div>
            )}

            <div className="grid gap-5 xl:grid-cols-2">
                {hotels.map(hotel => {
                    const photo = hotel.photos?.find(item => item.estPrincipale) || hotel.photos?.[0]
                    const result = availability[hotel.id]
                    return (
                        <article key={hotel.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex flex-col sm:flex-row">
                                <div className="h-48 shrink-0 bg-gradient-to-br from-[#1D2252] to-[#66CAD8] sm:h-auto sm:w-48">
                                    {photo?.url ? <img src={photo.url} alt={hotel.nom} className="h-full w-full object-cover" /> : <div className="flex h-full min-h-36 items-center justify-center text-white/80"><Hotel size={42} /></div>}
                                </div>
                                <div className="min-w-0 flex-1 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div><h3 className="text-lg font-bold text-gray-900">{hotel.nom || hotel.nomCommercial || 'Établissement'}</h3><p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} />{[hotel.ville, hotel.pays].filter(Boolean).join(', ') || 'Destination non précisée'}</p></div>
                                        {hotel.etoiles > 0 && <div className="flex shrink-0 items-center gap-0.5 text-amber-500">{Array.from({ length: Math.min(5, hotel.etoiles) }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div>}
                                    </div>
                                    {hotel.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{hotel.description}</p>}
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-500"><Users size={14} />{adults} adulte{adults > 1 ? 's' : ''}{children ? `, ${children} enfant${children > 1 ? 's' : ''}` : ''} · {nights} nuit{nights > 1 ? 's' : ''}</span>
                                        <button type="button" onClick={() => checkAvailability(hotel)} disabled={result?.loading} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                            {result?.loading ? 'Recherche…' : 'Voir les chambres'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {result && !result.loading && (
                                <div className="border-t border-gray-100 bg-gray-50/70 p-4">
                                    {result.error ? <p className="text-sm text-amber-700">{result.error}</p> : result.rooms.length === 0 ? <p className="text-sm text-gray-600">Aucune chambre disponible pour ces dates et ce nombre de voyageurs.</p> : (
                                        <div className="space-y-3">
                                            {result.rooms.map(room => (
                                                <div key={room.chambreTypeId} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0"><p className="flex items-center gap-2 font-semibold text-gray-900"><BedDouble size={16} className="text-[#4B8794]" />{room.nom || 'Chambre'}</p><p className="mt-1 text-xs text-gray-500">{room.nbDisponibles} disponible{room.nbDisponibles !== 1 ? 's' : ''} · capacité {room.capaciteAdultes || '—'} adulte(s)</p></div>
                                                    <div className="flex items-center justify-between gap-4 sm:justify-end"><p className="font-bold text-gray-900">{Number(room.prixBase) > 0 ? <>{money(room.prixBase)}<span className="font-normal text-gray-500"> / nuit</span></> : <span className="text-xs font-medium text-amber-700">Tarif indisponible</span>}</p><button type="button" disabled={Number(room.prixBase) <= 0} onClick={() => beginBooking(hotel, room)} className="rounded-lg bg-[#1D2252] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#30386f] disabled:cursor-not-allowed disabled:opacity-40">Réserver</button></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>

            {booking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setBooking(null) }}>
                    <form onSubmit={submitBooking} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div><p className="text-xs font-semibold uppercase tracking-wider text-[#4B8794]">Demande de réservation</p><h2 className="mt-1 text-xl font-bold text-gray-900">{booking.hotel.nom}</h2><p className="mt-1 text-sm text-gray-500">{booking.room.nom} · {arrival} au {departure} · {money(Number(booking.room.prixBase) * nights)} estimés</p></div>
                            <button type="button" onClick={() => setBooking(null)} aria-label="Fermer" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        {bookingError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{bookingError}</p>}
                        {clients.length > 0 && <label className="mb-4 block text-sm font-medium text-gray-700">Remplir depuis le carnet client<select value={selectedClient} onChange={event => selectClient(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"><option value="">Nouveau client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.prenom} {client.nom}{client.email ? ` · ${client.email}` : ''}</option>)}</select></label>}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[['prenom', 'Prénom *', true], ['nom', 'Nom *', true], ['email', 'Email *', true], ['telephone', 'Téléphone', false], ['nationalite', 'Nationalité', false]].map(([key, label, required]) => <label key={key} className="text-sm font-medium text-gray-700">{label}<input required={required} type={key === 'email' ? 'email' : 'text'} value={guest[key]} onChange={event => setGuest(current => ({ ...current, [key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#66CAD8]" /></label>)}
                            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Notes<textarea rows={2} value={guest.notes} onChange={event => setGuest(current => ({ ...current, notes: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#66CAD8]" /></label>
                        </div>
                        <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-5 text-amber-800">La demande sera créée avec le statut « en attente » pour confirmation par l’établissement.</p>
                        <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setBooking(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700">Annuler</button><button type="submit" disabled={submitting} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>{submitting ? 'Envoi…' : 'Créer la demande'}</button></div>
                    </form>
                </div>
            )}
        </div>
    )
}

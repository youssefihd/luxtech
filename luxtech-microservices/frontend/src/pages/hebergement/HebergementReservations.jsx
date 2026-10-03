import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Calendar, Plus, Search, Filter, X, Check, User,
    RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
    Building2, Globe, Briefcase, Home, Plane, CreditCard,
    TrendingUp, CheckCircle, Clock, ChevronDown,
    ArrowUpRight, Eye, RotateCcw, Sparkles, Users, Minus,
    PlayCircle, Ban, Receipt
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import FactureViewModal from './FactureViewModal'

const NAVY = '#1D2252'
const CYAN = '#66CAD8'
const PURPLE = '#5D2E8B'

const STATUS_CONFIG = {
    CONFIRMEE: { label: 'Confirmée', cls: 'bg-cyan-50 text-cyan-700 border border-cyan-200', dot: CYAN },
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border border-amber-200', dot: '#d97706' },
    ANNULEE: { label: 'Annulée', cls: 'bg-red-50 text-red-600 border border-red-200', dot: '#dc2626' },
    CHECKIN: { label: 'Check-in', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: '#059669' },
    CHECKOUT: { label: 'Check-out', cls: 'bg-gray-100 text-gray-600 border border-gray-200', dot: '#6b7280' },
    NO_SHOW: { label: 'No-show', cls: 'bg-purple-50 text-purple-700 border border-purple-200', dot: PURPLE },
}

const SERVICE_STATUT_CONFIG = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border border-amber-200', dot: '#d97706' },
    CONFIRMEE: { label: 'Confirmée', cls: 'bg-cyan-50 text-cyan-700 border border-cyan-200', dot: CYAN },
    TERMINEE: { label: 'Terminée', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: '#059669' },
    ANNULEE: { label: 'Annulée', cls: 'bg-red-50 text-red-600 border border-red-200', dot: '#dc2626' },
}

const SERVICE_PAIEMENT_CONFIG = {
    NON_PAYE: { label: 'Non payé', cls: 'bg-red-50 text-red-600' },
    PARTIELLEMENT_PAYE: { label: 'Partiel', cls: 'bg-amber-50 text-amber-600' },
    PAYE: { label: 'Payé', cls: 'bg-emerald-50 text-emerald-600' },
    FACTURE_CHAMBRE: { label: 'Facturé chambre', cls: 'bg-purple-50 text-purple-600' },
}

const SOURCE_CONFIG = {
    DIRECT: { label: 'Direct', icon: Building2, cls: 'bg-blue-50 text-blue-700' },
    AGENCE: { label: 'Agence', icon: Briefcase, cls: 'bg-purple-50 text-purple-700' },
    BOOKING_ENGINE: { label: 'Booking.com', icon: Globe, cls: 'bg-indigo-50 text-indigo-700' },
    PMS: { label: 'PMS', icon: Home, cls: 'bg-rose-50 text-rose-700' },
    CHANNEL_MANAGER: { label: 'Channel Mgr', icon: Plane, cls: 'bg-cyan-50 text-cyan-700' },
}

const SOURCE_FORM_MAP = {
    interne: 'DIRECT',
    booking: 'BOOKING_ENGINE',
    airbnb: 'CHANNEL_MANAGER',
    expedia: 'CHANNEL_MANAGER',
    agence: 'AGENCE',
    site_web: 'DIRECT',
}

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'CONFIRMEE', label: 'Confirmées' },
    { value: 'CHECKIN', label: 'Check-in' },
    { value: 'CHECKOUT', label: 'Check-out' },
    { value: 'ANNULEE', label: 'Annulées' },
    { value: 'NO_SHOW', label: 'No-show' },
    { value: 'TERMINEE', label: 'Services terminés' },
]

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const fmtDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
const fmtShort = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }
const fmtInput = (d) => { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}` }
const fmtHeure = (h) => h ? h.slice(0, 5) : null

const normalizeDate = (d) => { const n = new Date(d); n.setHours(0, 0, 0, 0); return n }

// Une chambre est libre pour une plage donnée si aucune réservation active
// (hors annulée/no-show) ne chevauche cette plage pour cette chambre précise.
const isChambreFreeForRange = (chambreId, start, end, reservations) => {
    if (!reservations?.length) return true
    const s = normalizeDate(start)
    const e = normalizeDate(end)
    return !reservations.some(r => {
        if (r.status === 'ANNULEE' || r.status === 'NO_SHOW') return false
        if ((r.chambreId ?? r.chambre_id) !== chambreId) return false
        const rs = normalizeDate(r.dateArrivee || r.date_arrivee || 0)
        const re = normalizeDate(r.dateDepart || r.date_depart || 0)
        return s < re && rs < e
    })
}

const getDayCount = (start, end) => {
    if (!start || !end) return '—'
    const diff = Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)))
    return `${diff}j`
}

const Badge = ({ config, value }) => {
    const c = config[value] || { label: value, cls: 'bg-gray-100 text-gray-600', dot: '#6b7280' }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${c.cls}`}>
            {c.dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }}/>}
            {c.label}
        </span>
    )
}

const KPICard = ({ title, value, icon: Icon, color, bg, active, onClick }) => (
    <div onClick={onClick}
         className={`relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
             active ? 'border-transparent shadow-lg' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:-translate-y-0.5 hover:shadow-md'
         }`}
         style={active ? { background: `linear-gradient(135deg, white, ${color}08)`, borderColor: color + '40', boxShadow: `0 8px 24px ${color}20` } : {}}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: color }}/>
        <div className="relative p-2.5 rounded-xl w-fit mb-3" style={{ background: bg }}>
            <Icon className="h-5 w-5" style={{ color }}/>
        </div>
        <p className="relative text-3xl font-black text-gray-900 mb-1">{value ?? 0}</p>
        <p className="relative text-sm text-gray-500 font-medium">{title}</p>
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: color }}/>}
    </div>
)

const CheckoutBlockedModal = ({ isOpen, reservation, onClose, onPayNow }) => {
    if (!isOpen || !reservation) return null
    const reste = Number(reservation.prixTotal || 0) - Number(reservation.montantPaye || 0)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-2xl bg-amber-100 shrink-0">
                        <AlertTriangle className="h-6 w-6 text-amber-600"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Check-out bloqué</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Cette réservation ne peut pas passer en check-out tant que le solde n'est pas réglé.
                        </p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-5">
                    <p className="text-sm font-bold text-amber-800">Reste à payer : {fmt(reste)}</p>
                    <p className="text-xs text-amber-600 mt-1">Enregistrez le paiement pour finaliser le check-out.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Fermer
                    </button>
                    <button onClick={onPayNow}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition"
                            style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                        Payer maintenant
                    </button>
                </div>
            </div>
        </div>
    )
}

const ExtendModal = ({ isOpen, reservation, onClose, onConfirm }) => {
    const [newDate, setNewDate] = useState('')
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')
    const minDate = useMemo(() => {
        if (!reservation?.dateDepart) return ''
        const d = new Date(reservation.dateDepart)
        d.setDate(d.getDate() + 1)
        return fmtInput(d)
    }, [reservation])
    const nightsAdded = useMemo(() => {
        if (!newDate || !reservation?.dateDepart) return 0
        return Math.max(0, Math.round((new Date(newDate) - new Date(reservation.dateDepart)) / (1000 * 60 * 60 * 24)))
    }, [newDate, reservation])
    useEffect(() => {
        if (isOpen) { setNewDate(minDate); setError('') }
    }, [isOpen, minDate])
    const handleConfirm = async () => {
        if (!newDate || nightsAdded <= 0) { setError('Veuillez choisir une date valide'); return }
        setProcessing(true)
        try { await onConfirm(reservation.id, newDate) }
        catch (err) { setError(err.message || 'Erreur lors de la prolongation') }
        finally { setProcessing(false) }
    }
    if (!isOpen || !reservation) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                         style={{ background: `linear-gradient(135deg, #6366f1, #4f46e5)` }}>
                        <ArrowUpRight className="h-5 w-5"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Prolonger le séjour</h2>
                        <p className="text-sm text-gray-400">{reservation.numeroReservation}</p>
                    </div>
                </div>
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle size={14}/>{error}
                    </div>
                )}
                <div className="mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Date de départ actuelle</span>
                        <span className="font-bold text-gray-900">{fmtDate(reservation.dateDepart)}</span>
                    </div>
                    {nightsAdded > 0 && (
                        <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                            <span className="text-gray-500">Nuits ajoutées</span>
                            <span className="font-black text-indigo-600">+{nightsAdded} nuit{nightsAdded > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nouvelle date de départ *</label>
                    <input type="date" value={newDate} min={minDate}
                           onChange={e => setNewDate(e.target.value)}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm"/>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing || nightsAdded <= 0}
                            className="flex-1 py-3.5 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Valider'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const PaymentModal = ({ isOpen, reservation, onSubmit, onClose }) => {
    const [amount, setAmount] = useState('')
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')
    const isConfirm = reservation?.status === 'EN_ATTENTE'
    useEffect(() => { if (isOpen) { setAmount(''); setError('') } }, [isOpen])
    const montantRestant = reservation
        ? Math.max(0, Number(reservation.prixTotal || 0) - Number(reservation.montantPaye || 0))
        : 0
    const handleSubmit = async () => {
        const montant = parseFloat(amount) || 0
        if (!isConfirm && montant <= 0) { setError('Montant invalide'); return }
        if (montant > montantRestant + 0.01) { setError(`Maximum: ${fmt(montantRestant)}`); return }
        setProcessing(true)
        try { await onSubmit(reservation.id, montant, isConfirm) }
        catch (err) { setError(err.message || 'Erreur lors du traitement') }
        finally { setProcessing(false) }
    }
    if (!isOpen || !reservation) return null
    const pct = reservation.prixTotal > 0
        ? Math.min(100, Math.round((Number(reservation.montantPaye || 0) / reservation.prixTotal) * 100))
        : 0
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md mx-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        <CreditCard className="h-5 w-5"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900">
                            {isConfirm ? 'Confirmer la réservation' : 'Enregistrer un paiement'}
                        </h2>
                        <p className="text-sm text-gray-400">{reservation.numeroReservation || `#${reservation.id}`}</p>
                    </div>
                </div>
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle size={14}/>{error}
                    </div>
                )}
                <div className="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-500">Progression</span>
                        <span className="font-bold text-gray-900">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full"
                             style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CYAN}, ${NAVY})` }}/>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="text-sm font-bold text-gray-900">{fmt(reservation.prixTotal)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Payé</p>
                            <p className="text-sm font-bold text-emerald-600">{fmt(reservation.montantPaye)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Restant</p>
                            <p className="text-sm font-bold text-orange-500">{fmt(montantRestant)}</p>
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isConfirm ? 'Montant à encaisser (optionnel)' : 'Montant à encaisser *'}
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">MAD</span>
                        <input type="number" step="0.01" min="0" value={amount}
                               onChange={e => setAmount(e.target.value)} disabled={processing}
                               placeholder="0.00"
                               className="w-full pl-16 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm font-semibold transition"/>
                    </div>
                    {isConfirm && (
                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                            <span>💡</span> Laissez vide pour confirmer sans paiement
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin mx-auto"/> : isConfirm ? 'Confirmer' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const ServicePaymentModal = ({ isOpen, rs, onConfirm, onFacturerChambre, onClose }) => {
    const reste = rs ? Number(rs.prixTotal) - Number(rs.montantPaye || 0) : 0
    const [montant, setMontant] = useState('')
    const [methode, setMethode] = useState('ESPECE')
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { if (isOpen) { setMontant(reste > 0 ? String(reste) : ''); setMethode('ESPECE'); setError('') } }, [isOpen, rs])

    const handlePay = async () => {
        if (!montant || Number(montant) <= 0) { setError('Montant invalide'); return }
        setProcessing(true)
        try { await onConfirm(rs.id, Number(montant), methode) }
        catch (err) { setError(err.message || 'Erreur') }
        finally { setProcessing(false) }
    }

    const handleFacturer = async () => {
        setProcessing(true)
        try { await onFacturerChambre(rs.id) }
        catch (err) { setError(err.message || 'Erreur') }
        finally { setProcessing(false) }
    }

    if (!isOpen || !rs) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
                <div className="text-center mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="h-7 w-7 text-emerald-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Paiement du service</h2>
                    <p className="text-sm text-gray-500 mt-1">{rs.serviceNom} · Reste : <span className="font-bold text-gray-900">{fmt(reste)}</span></p>
                </div>

                {error && <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2"><AlertTriangle size={12}/>{error}</div>}

                <div className="space-y-3 mb-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Montant (MAD)</label>
                        <input type="number" min="0" step="0.01" value={montant} onChange={e => setMontant(e.target.value)} className={ic}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Méthode</label>
                        <select value={methode} onChange={e => setMethode(e.target.value)} className={ic}>
                            <option value="ESPECE">Espèce</option>
                            <option value="CARTE">Carte</option>
                            <option value="VIREMENT">Virement</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 mb-2">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handlePay} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Encaisser'}
                    </button>
                </div>

                {rs.reservationId && (
                    <button onClick={handleFacturer} disabled={processing}
                            className="w-full py-2.5 rounded-2xl border-2 border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 transition flex items-center justify-center gap-1.5">
                        <Receipt size={13}/> Facturer à la chambre
                    </button>
                )}
            </div>
        </div>
    )
}

const ServicesDetailModal = ({ isOpen, reservation, services, catalog, onAction, onPay, onClose }) => {
    if (!isOpen || !reservation) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 max-h-[80vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Services de</p>
                                <h2 className="text-lg font-black text-white">{reservation.clientNom} {reservation.clientPrenom || ''}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto">
                    {services.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">Aucun service.</p>
                    ) : services.map(rs => {
                        const reste = Number(rs.prixTotal) - Number(rs.montantPaye || 0)
                        const catalogItem = catalog?.find(c => c.id === rs.serviceId)
                        const imageUrl = catalogItem?.imageUrl
                        return (
                            <div key={rs.id} className="rounded-2xl border border-gray-100 p-4">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                                         style={imageUrl ? {} : { background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={rs.serviceNom} className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Sparkles size={20} className="text-white/60"/>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{rs.serviceNom} × {rs.quantite}</p>
                                                <p className="text-xs text-gray-400">{fmtDate(rs.serviceDate)}{fmtHeure(rs.serviceHeure) ? ` · ${fmtHeure(rs.serviceHeure)}` : ''}</p>
                                            </div>
                                            <span className="text-sm font-black text-gray-900 shrink-0">{fmt(rs.prixTotal)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge config={SERVICE_STATUT_CONFIG} value={rs.statut}/>
                                            <Badge config={SERVICE_PAIEMENT_CONFIG} value={rs.statutPaiement}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                                    {rs.statut === 'EN_ATTENTE' && (
                                        <>
                                            <button onClick={() => onAction(rs.id, 'confirmer', 'Service confirmé !')}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                                                <CheckCircle size={12}/> Confirmer
                                            </button>
                                            <button onClick={() => onAction(rs.id, 'annuler', 'Service annulé.')}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition">
                                                <Ban size={12}/> Annuler
                                            </button>
                                        </>
                                    )}
                                    {rs.statut === 'CONFIRMEE' && (
                                        <>
                                            <button onClick={() => onAction(rs.id, 'terminer', 'Service terminé !')}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
                                                <PlayCircle size={12}/> Terminer
                                            </button>
                                            <button onClick={() => onAction(rs.id, 'annuler', 'Service annulé.')}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition">
                                                <Ban size={12}/> Annuler
                                            </button>
                                        </>
                                    )}
                                    {(rs.statutPaiement === 'NON_PAYE' || rs.statutPaiement === 'PARTIELLEMENT_PAYE') && rs.statut !== 'ANNULEE' && (
                                        <button onClick={() => onPay(rs)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition">
                                            <CreditCard size={12}/> Payer ({fmt(reste)})
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

const ServiceModal = ({ isOpen, presetReservation, services, reservations, hotelId, onSubmit, onClose }) => {
    const [clientType, setClientType] = useState('existant')
    const [searchClient, setSearchClient] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [linkedReservationId, setLinkedReservationId] = useState('')
    const [form, setForm] = useState({
        serviceId: '', clientNom: '', clientEmail: '', clientTelephone: '',
        serviceDate: '', serviceHeure: '', quantite: 1, notes: ''
    })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    const isPreset = !!presetReservation

    useEffect(() => {
        if (isOpen) {
            setError('')
            setSearchClient('')
            setSelectedClient(null)
            setLinkedReservationId('')
            setClientType('existant')
            setForm({
                serviceId: services[0]?.id || '',
                clientNom: '', clientEmail: '', clientTelephone: '',
                serviceDate: presetReservation?.dateArrivee ? fmtInput(presetReservation.dateArrivee) : new Date().toISOString().slice(0, 10),
                serviceHeure: '', quantite: 1, notes: ''
            })
        }
    }, [isOpen, services, presetReservation])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })
    const selectedService = useMemo(() => services.find(s => String(s.id) === String(form.serviceId)), [services, form.serviceId])
    const prixEstime = selectedService ? Number(selectedService.prix) * Number(form.quantite || 1) : 0

    // Regroupe les réservations par client (par email, sinon nom+téléphone) — un seul résultat par personne
    const clientsUniques = useMemo(() => {
        const map = {}
        reservations.forEach(r => {
            const key = (r.clientEmail || `${r.clientNom}-${r.clientTelephone}`).toLowerCase()
            if (!map[key]) {
                map[key] = {
                    key,
                    nom: r.clientNom, prenom: r.clientPrenom,
                    email: r.clientEmail, telephone: r.clientTelephone,
                    reservations: [],
                }
            }
            map[key].reservations.push(r)
        })
        return Object.values(map)
    }, [reservations])

    const filteredClients = useMemo(() => {
        const q = searchClient.toLowerCase()
        return clientsUniques.filter(c =>
            !q || `${c.nom} ${c.prenom || ''}`.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
        ).slice(0, 8)
    }, [clientsUniques, searchClient])

    // Séjours actifs (ni annulés, ni terminés) du client sélectionné — pour lier optionnellement
    const sejoursActifs = useMemo(() => {
        if (!selectedClient) return []
        return selectedClient.reservations.filter(r => r.status === 'CONFIRMEE' || r.status === 'CHECKIN')
    }, [selectedClient])

    const handleSelectClient = (client) => {
        setSelectedClient(client)
        setSearchClient('')
        setLinkedReservationId('')
    }

    const handleSubmit = async () => {
        if (!form.serviceId) { setError('Veuillez sélectionner un service'); return }
        if (!form.serviceDate) { setError('La date est obligatoire'); return }
        if (!isPreset) {
            if (clientType === 'existant' && !selectedClient) { setError('Veuillez sélectionner un client'); return }
            if (clientType === 'externe' && !form.clientNom.trim()) { setError('Le nom du client est obligatoire'); return }
        }
        setProcessing(true)
        try {
            await onSubmit({
                serviceId: Number(form.serviceId),
                hotelId,
                reservationId: isPreset
                    ? presetReservation.id
                    : (clientType === 'existant' && linkedReservationId ? Number(linkedReservationId) : null),
                clientNom: isPreset ? null : (clientType === 'existant'
                    ? `${selectedClient.nom} ${selectedClient.prenom || ''}`.trim()
                    : form.clientNom.trim()),
                clientEmail: isPreset ? null : (clientType === 'existant' ? selectedClient.email : form.clientEmail || null),
                clientTelephone: isPreset ? null : (clientType === 'existant' ? selectedClient.telephone : form.clientTelephone || null),
                serviceDate: form.serviceDate,
                serviceHeure: form.serviceHeure || null,
                quantite: Number(form.quantite) || 1,
                notes: form.notes || null,
            })
        } catch (err) {
            setError(err.message || 'Erreur lors de la création')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                                    {isPreset ? 'Ajouter un service' : 'Nouveau'}
                                </p>
                                <h2 className="text-lg font-black text-white">
                                    {isPreset ? `${presetReservation.clientNom} ${presetReservation.clientPrenom || ''}` : 'Réservation de service'}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 font-medium"><AlertTriangle size={14}/>{error}</div>}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Service *</label>
                        <select {...F('serviceId')} className={ic}>
                            <option value="">Sélectionner...</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.nom} — {fmt(s.prix)}</option>)}
                        </select>
                        {services.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1"><AlertTriangle size={12}/> Aucun service actif dans le catalogue</p>
                        )}
                    </div>

                    {!isPreset && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Type de client</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => { setClientType('existant'); setSelectedClient(null) }}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                                clientType === 'existant' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                            }`}>
                                        <Home size={14}/> Client de l'hôtel
                                    </button>
                                    <button type="button" onClick={() => setClientType('externe')}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                                clientType === 'externe' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                            }`}>
                                        <Users size={14}/> Client externe
                                    </button>
                                </div>
                            </div>

                            {clientType === 'existant' ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Rechercher un client</label>
                                        <div className="relative mb-2">
                                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                            <input type="text" placeholder="Nom ou email..."
                                                   value={searchClient} onChange={e => setSearchClient(e.target.value)}
                                                   className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-gray-50"/>
                                        </div>
                                        {selectedClient ? (
                                            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-[#66CAD8] bg-[#66CAD8]/5">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{selectedClient.nom} {selectedClient.prenom}</p>
                                                    <p className="text-xs text-gray-400">{selectedClient.email || selectedClient.telephone}</p>
                                                </div>
                                                <button onClick={() => { setSelectedClient(null); setLinkedReservationId('') }} className="text-gray-400 hover:text-red-500">
                                                    <X size={16}/>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="max-h-40 overflow-y-auto space-y-1.5">
                                                {filteredClients.length === 0 ? (
                                                    <p className="text-xs text-gray-400 text-center py-3">Aucun résultat</p>
                                                ) : filteredClients.map(c => (
                                                    <button key={c.key} type="button"
                                                            onClick={() => handleSelectClient(c)}
                                                            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-[#66CAD8] hover:bg-gray-50 transition text-left">
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800">{c.nom} {c.prenom}</p>
                                                            <p className="text-[10px] text-gray-400">{c.email || c.telephone}</p>
                                                        </div>
                                                        <User size={13} className="text-gray-300"/>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedClient && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5">
                                                Lier à un séjour <span className="text-gray-400 font-normal">(optionnel)</span>
                                            </label>
                                            {sejoursActifs.length === 0 ? (
                                                <p className="text-xs text-gray-400 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                    Aucun séjour en cours pour ce client — le service sera autonome.
                                                </p>
                                            ) : (
                                                <select value={linkedReservationId} onChange={e => setLinkedReservationId(e.target.value)} className={ic}>
                                                    <option value="">Aucun — service autonome</option>
                                                    {sejoursActifs.map(r => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.numeroReservation} — {r.dateArrivee} → {r.dateDepart}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <p className="text-[11px] text-gray-400 mt-1.5">Liez uniquement si ce service concerne ce séjour précis (ex: pour pouvoir le facturer à la chambre).</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom du client *</label>
                                        <input {...F('clientNom')} placeholder="Nom complet" className={ic}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Email</label>
                                            <input type="email" {...F('clientEmail')} placeholder="email@exemple.com" className={ic}/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Téléphone</label>
                                            <input {...F('clientTelephone')} placeholder="+212 6XX XXXXXX" className={ic}/>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Date *</label>
                            <input type="date" {...F('serviceDate')} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Heure</label>
                            <input type="time" {...F('serviceHeure')} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Quantité</label>
                            <input type="number" min="1" {...F('quantite')} className={ic}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Notes</label>
                        <textarea rows={2} {...F('notes')} placeholder="Remarques..." className={ic}/>
                    </div>

                    {selectedService && (
                        <div className="rounded-2xl p-4" style={{ background: `${CYAN}10`, border: `1.5px solid ${CYAN}30` }}>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Total estimé</span>
                                <span className="font-black text-gray-900">{fmt(prixEstime)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing || services.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Ajouter</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Reservation Modal — avec étape Services intégrée ──────
const ReservationModal = ({ isOpen, chambres, services, reservations, onSubmit, onClose }) => {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        clientNom: '', clientPrenom: '', clientEmail: '', clientTelephone: '',
        clientNationalite: '', clientCinPasseport: '',
        clientPays: 'Maroc', chambreId: '', dateArrivee: '', dateDepart: '',
        nombrePersonnes: 1, notes: '', source: 'interne', montantTotal: '', avance: '',
        selectedServices: []
    })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')
    const nbJours = useMemo(() => {
        if (!form.dateArrivee || !form.dateDepart) return 0
        return Math.max(0, Math.round((new Date(form.dateDepart) - new Date(form.dateArrivee)) / (1000 * 60 * 60 * 24)))
    }, [form.dateArrivee, form.dateDepart])

    // Chambres réellement disponibles sur les dates sélectionnées
    const chambresDisponibles = useMemo(() => {
        if (!form.dateArrivee || !form.dateDepart || nbJours <= 0) return chambres
        return chambres.filter(c => isChambreFreeForRange(c.id, form.dateArrivee, form.dateDepart, reservations))
    }, [chambres, reservations, form.dateArrivee, form.dateDepart, nbJours])

    // Si la chambre sélectionnée devient indisponible suite à un changement de dates, on la désélectionne
    useEffect(() => {
        if (form.chambreId && form.dateArrivee && form.dateDepart) {
            const stillAvailable = chambresDisponibles.some(c => String(c.id) === String(form.chambreId))
            if (!stillAvailable) setForm(p => ({ ...p, chambreId: '' }))
        }
    }, [chambresDisponibles])

    const chambreSelectionnee = useMemo(() =>
            chambresDisponibles.find(c => String(c.id) === String(form.chambreId))
        , [chambresDisponibles, form.chambreId])
    const montantAuto = useMemo(() => {
        if (!chambreSelectionnee?.prixBase || !nbJours) return 0
        return chambreSelectionnee.prixBase * nbJours
    }, [chambreSelectionnee, nbJours])
    const servicesTotal = useMemo(() => {
        return form.selectedServices.reduce((sum, sel) => {
            const svc = services.find(s => s.id === sel.serviceId)
            return sum + (svc ? Number(svc.prix) * sel.quantite : 0)
        }, 0)
    }, [form.selectedServices, services])
    useEffect(() => {
        if (isOpen) {
            setStep(1); setError('')
            setForm({ clientNom: '', clientPrenom: '', clientEmail: '', clientTelephone: '',
                clientNationalite: '', clientCinPasseport: '',
                clientPays: 'Maroc', chambreId: '', dateArrivee: '', dateDepart: '',
                nombrePersonnes: 1, notes: '', source: 'interne', montantTotal: '', avance: '',
                selectedServices: [] })
        }
    }, [isOpen])
    useEffect(() => {
        if (montantAuto > 0 && !form.montantTotal) {
            setForm(p => ({ ...p, montantTotal: String(montantAuto) }))
        }
    }, [montantAuto])
    const F = (field) => ({
        value: form[field],
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value }))
    })
    const toggleService = (serviceId) => {
        setForm(p => {
            const exists = p.selectedServices.find(s => s.serviceId === serviceId)
            if (exists) return { ...p, selectedServices: p.selectedServices.filter(s => s.serviceId !== serviceId) }
            return { ...p, selectedServices: [...p.selectedServices, { serviceId, quantite: 1 }] }
        })
    }
    const updateServiceQty = (serviceId, qty) => {
        setForm(p => ({ ...p, selectedServices: p.selectedServices.map(s => s.serviceId === serviceId ? { ...s, quantite: Math.max(1, qty) } : s) }))
    }
    const validateStep = () => {
        if (step === 1) {
            if (!form.clientNom.trim()) { setError('Le nom du client est obligatoire'); return false }
            if (!form.clientEmail.trim()) { setError("L'email est obligatoire"); return false }
        }
        if (step === 2) {
            if (!form.dateArrivee || !form.dateDepart) { setError('Veuillez renseigner les dates'); return false }
            if (nbJours <= 0) { setError('La date de départ doit être après la date d\'arrivée'); return false }
            if (!form.chambreId) { setError('Veuillez sélectionner une chambre'); return false }
        }
        setError(''); return true
    }
    const handleNext = () => { if (validateStep()) setStep(s => Math.min(4, s + 1)) }
    const handleSubmit = async () => {
        if (!validateStep()) return
        setProcessing(true)
        try { await onSubmit(form) }
        catch (err) { setError(err.message || 'Erreur lors de la sauvegarde') }
        finally { setProcessing(false) }
    }
    if (!isOpen) return null
    const inputCls = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm transition bg-gray-50 hover:bg-white hover:border-gray-200"
    const steps = [{ num: 1, label: 'Client' }, { num: 2, label: 'Séjour' }, { num: 3, label: 'Services' }, { num: 4, label: 'Récap' }]
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-100 overflow-hidden">
                <div className="text-white p-6 relative overflow-hidden"
                     style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between mb-5">
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Nouvelle réservation</p>
                            <h2 className="text-xl font-black text-white mt-0.5">Créer une réservation</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                    <div className="relative flex items-center">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/20"/>
                        <div className="absolute top-4 left-0 h-0.5 bg-white/60 transition-all duration-500"
                             style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}/>
                        {steps.map(s => (
                            <div key={s.num} className="relative flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                                    step > s.num ? 'bg-white border-white text-[#1D2252]' :
                                        step === s.num ? 'bg-white border-white text-[#1D2252] shadow-lg scale-110' :
                                            'bg-white/20 border-white/40 text-white'
                                }`}>
                                    {step > s.num ? <Check size={14}/> : s.num}
                                </div>
                                <span className={`mt-1.5 text-xs font-semibold ${step >= s.num ? 'text-white' : 'text-white/40'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 max-h-[55vh] overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                            <AlertTriangle size={14}/>{error}
                        </div>
                    )}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Informations personnelles</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Nom *</label><input {...F('clientNom')} placeholder="Nom du client" className={inputCls}/></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Prénom</label><input {...F('clientPrenom')} placeholder="Prénom" className={inputCls}/></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Email *</label><input type="email" {...F('clientEmail')} placeholder="email@exemple.com" className={inputCls}/></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Téléphone</label><input {...F('clientTelephone')} placeholder="+212 6XX XXXXXX" className={inputCls}/></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Pays</label>
                                    <select {...F('clientPays')} className={inputCls}>
                                        <option value="Maroc">Maroc</option><option value="France">France</option>
                                        <option value="Espagne">Espagne</option><option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Nationalité</label><input {...F('clientNationalite')} placeholder="Ex: Marocaine" className={inputCls}/></div>
                                <div className="col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1.5">CIN / Passeport</label><input {...F('clientCinPasseport')} placeholder="Ex: AB123456" className={inputCls}/></div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Détails du séjour</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Date d'arrivée *</label>
                                    <input type="date" {...F('dateArrivee')} min={new Date().toISOString().split('T')[0]} className={inputCls}/></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Date de départ *</label>
                                    <input type="date" {...F('dateDepart')} min={form.dateArrivee || new Date().toISOString().split('T')[0]} className={inputCls}/></div>
                            </div>
                            {nbJours > 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#66CAD8]/10 border border-[#66CAD8]/20">
                                    <Calendar size={16} style={{ color: CYAN }}/>
                                    <span className="text-sm font-bold" style={{ color: NAVY }}>
                                        Durée du séjour : <span style={{ color: CYAN }}>{nbJours} nuit{nbJours > 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                        Chambre *
                                        {form.dateArrivee && form.dateDepart && chambresDisponibles.length === 0 && (
                                            <span className="text-red-400 ml-1">— Aucune chambre disponible pour ces dates</span>
                                        )}
                                    </label>
                                    <select {...F('chambreId')} className={inputCls}>
                                        <option value="">Sélectionner une chambre</option>
                                        {chambresDisponibles.map(c => (
                                            <option key={c.id} value={c.id}>{c.numero} — {c.chambreTypeNom} {c.prixBase ? `(${c.prixBase} MAD/nuit)` : ''}</option>
                                        ))}
                                    </select>
                                    {!form.dateArrivee || !form.dateDepart ? (
                                        <p className="text-[11px] text-gray-400 mt-1">Sélectionnez d'abord les dates pour voir les chambres disponibles.</p>
                                    ) : null}
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Personnes</label>
                                    <input type="number" min="1" max="20" {...F('nombrePersonnes')} className={inputCls}/></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Source</label>
                                    <select {...F('source')} className={inputCls}>
                                        <option value="interne">Réservation directe</option>
                                        <option value="booking">Booking.com</option><option value="airbnb">Airbnb</option>
                                        <option value="expedia">Expedia</option><option value="agence">Agence de voyage</option>
                                        <option value="site_web">Site web</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">
                                    Montant total (MAD) {montantAuto > 0 && <span className="text-[#66CAD8] ml-1">Auto: {montantAuto}</span>}
                                </label>
                                    <input type="number" min="0" {...F('montantTotal')} placeholder={montantAuto > 0 ? String(montantAuto) : '0.00'} className={inputCls}/>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Avance / Acompte (MAD)</label>
                                    <input type="number" min="0" {...F('avance')} placeholder="0.00" className={inputCls}/></div>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Notes internes</label>
                                <textarea rows={2} {...F('notes')} placeholder="Demandes spéciales..." className={inputCls}/></div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Services additionnels</p>
                                <p className="text-xs text-gray-400 mt-0.5">Optionnel — vous pourrez aussi en ajouter plus tard</p>
                            </div>
                            {services.length === 0 ? (
                                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                    <Sparkles size={22} className="text-gray-300 mx-auto mb-2"/>
                                    <p className="text-sm text-gray-400">Aucun service actif dans le catalogue</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {services.map(s => {
                                        const sel = form.selectedServices.find(x => x.serviceId === s.id)
                                        return (
                                            <div key={s.id}
                                                 className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition ${
                                                     sel ? 'border-[#66CAD8] bg-[#66CAD8]/5' : 'border-gray-100'
                                                 }`}>
                                                <button type="button" onClick={() => toggleService(s.id)}
                                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${
                                                            sel ? 'border-[#66CAD8] bg-[#66CAD8]' : 'border-gray-300'
                                                        }`}>
                                                    {sel && <Check size={13} className="text-white"/>}
                                                </button>
                                                <div className="flex-1 min-w-0" onClick={() => toggleService(s.id)} style={{ cursor: 'pointer' }}>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{s.nom}</p>
                                                    <p className="text-xs text-gray-400">{fmt(s.prix)}</p>
                                                </div>
                                                {sel && (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button type="button" onClick={() => updateServiceQty(s.id, sel.quantite - 1)}
                                                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#66CAD8]">
                                                            <Minus size={12}/>
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-bold">{sel.quantite}</span>
                                                        <button type="button" onClick={() => updateServiceQty(s.id, sel.quantite + 1)}
                                                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#66CAD8]">
                                                            <Plus size={12}/>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            {servicesTotal > 0 && (
                                <div className="rounded-2xl p-4 flex justify-between text-sm" style={{ background: `${CYAN}10`, border: `1.5px solid ${CYAN}30` }}>
                                    <span className="text-gray-500 font-medium">Total services</span>
                                    <span className="font-black text-gray-900">{fmt(servicesTotal)}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {step === 4 && (
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Récapitulatif</p>
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Client</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                        {form.clientNom[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900">{form.clientNom} {form.clientPrenom}</p>
                                        <p className="text-xs text-gray-500">{form.clientEmail} · {form.clientTelephone || '—'}</p>
                                        {(form.clientNationalite || form.clientCinPasseport) && (
                                            <p className="text-xs text-gray-400 mt-0.5">{form.clientNationalite || '—'} · {form.clientCinPasseport || '—'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Séjour</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><p className="text-gray-400 text-xs">Arrivée</p><p className="font-bold">{fmtDate(form.dateArrivee)}</p></div>
                                    <div><p className="text-gray-400 text-xs">Départ</p><p className="font-bold">{fmtDate(form.dateDepart)}</p></div>
                                    <div><p className="text-gray-400 text-xs">Durée</p><p className="font-bold">{nbJours} nuit{nbJours > 1 ? 's' : ''}</p></div>
                                    <div><p className="text-gray-400 text-xs">Chambre</p><p className="font-bold">{chambreSelectionnee ? `${chambreSelectionnee.numero} — ${chambreSelectionnee.chambreTypeNom}` : '—'}</p></div>
                                </div>
                            </div>
                            {form.selectedServices.length > 0 && (
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Services ({form.selectedServices.length})</p>
                                    <div className="space-y-1.5">
                                        {form.selectedServices.map(sel => {
                                            const svc = services.find(s => s.id === sel.serviceId)
                                            if (!svc) return null
                                            return (
                                                <div key={sel.serviceId} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{svc.nom} × {sel.quantite}</span>
                                                    <span className="font-bold text-gray-900">{fmt(Number(svc.prix) * sel.quantite)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="rounded-2xl border-2 p-4 space-y-2" style={{ borderColor: CYAN + '30', background: CYAN + '08' }}>
                                <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: NAVY }}>Montants</p>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Chambre</span><span className="font-black">{fmt(form.montantTotal || montantAuto)}</span></div>
                                {servicesTotal > 0 && (
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Services</span><span className="font-black">{fmt(servicesTotal)}</span></div>
                                )}
                                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                                    <span className="font-semibold text-gray-600">Total estimé</span>
                                    <span className="font-black" style={{ color: NAVY }}>{fmt((Number(form.montantTotal) || montantAuto) + servicesTotal)}</span>
                                </div>
                                {Number(form.avance) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Avance (chambre)</span><span className="font-bold text-emerald-600">{fmt(form.avance)}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-400 text-center">Les services seront créés en statut "En attente" et facturés séparément.</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                    {step > 1 && (
                        <button onClick={() => setStep(s => s - 1)} disabled={processing}
                                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                            <ChevronLeft size={15}/> Retour
                        </button>
                    )}
                    <button onClick={onClose} disabled={processing}
                            className={`${step === 1 ? 'flex-1' : ''} px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-white transition`}>
                        Annuler
                    </button>
                    {step < 4 ? (
                        <button onClick={handleNext}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            Suivant <ChevronRight size={15}/>
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={16}/> Créer la réservation</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const StatusBadge = ({ status }) => <Badge config={STATUS_CONFIG} value={status}/>

// ══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════
export default function HebergementReservations() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur
    const [hebergement, setHebergement] = useState(null)
    const [reservations, setReservations] = useState([])
    const [chambres, setChambres] = useState([])
    const [factures, setFactures] = useState([])
    const [services, setServices] = useState([])
    const [reservationsServices, setReservationsServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterSource, setFilterSource] = useState('ALL')
    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10
    const [showAddModal, setShowAddModal] = useState(false)
    const [paymentModal, setPaymentModal] = useState({ open: false, reservation: null })
    const [checkoutBlockedModal, setCheckoutBlockedModal] = useState({ open: false, reservation: null })
    const [extendModal, setExtendModal] = useState({ open: false, reservation: null })
    const [serviceModal, setServiceModal] = useState({ open: false, reservation: null })
    const [servicesDetailModal, setServicesDetailModal] = useState({ open: false, reservation: null, services: [] })
    const [servicePaymentModal, setServicePaymentModal] = useState({ open: false, rs: null })
    const [viewingData, setViewingData] = useState(null)
    const [toast, setToast] = useState(null)
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }
    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const hebergRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = hebergRes?.data?.data
            setHebergement(h)
            if (h?.id) {
                const [resaRes, chambresRes, facturesRes, servicesRes, resaServicesRes] = await Promise.all([
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(() => null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambres`).catch(() => null),
                    bookingAxios.get(`/booking/factures/hotel/${h.id}`).catch(() => null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/services`).catch(() => null),
                    bookingAxios.get(`/booking/reservations-services/hotel/${h.id}`).catch(() => null),
                ])
                setReservations(resaRes?.data?.data || [])
                setChambres(chambresRes?.data?.data || [])
                setFactures(facturesRes?.data?.data || [])
                setServices((servicesRes?.data?.data || []).filter(s => s.isActive))
                setReservationsServices(resaServicesRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])
    useEffect(() => { fetchData() }, [fetchData])
    const enrichedReservations = useMemo(() => {
        return reservations.map(r => {
            const chambre = chambres.find(c => c.id === r.chambreId)
            const facture = factures.find(f => Number(f.reservationId) === Number(r.id))
            return {
                ...r,
                chambreNumero: chambre?.numero || null,
                chambreTypeNom: chambre?.chambreTypeNom || null,
                facture: facture || null,
            }
        })
    }, [reservations, chambres, factures])
    const stats = useMemo(() => ({
        total: enrichedReservations.length,
        pending: enrichedReservations.filter(r => r.status === 'EN_ATTENTE').length,
        pendingAgency: enrichedReservations.filter(r => r.source === 'AGENCE'
            && (r.status === 'EN_ATTENTE' || r.annulationDemandeStatut === 'DEMANDEE')).length,
        confirmed: enrichedReservations.filter(r => r.status === 'CONFIRMEE').length,
        checkIn: enrichedReservations.filter(r => r.status === 'CHECKIN').length,
    }), [enrichedReservations])

    const combinedRows = useMemo(() => {
        const roomRows = enrichedReservations.map(r => {
            const linkedServices = reservationsServices.filter(rs => Number(rs.reservationId) === Number(r.id))
            const servicesTotal = linkedServices.reduce((s, rs) => s + Number(rs.prixTotal || 0), 0)
            return { type: 'reservation', key: `r-${r.id}`, sortDate: r.createdAt, data: r, linkedServices, servicesTotal }
        })
        const standaloneRows = reservationsServices
            .filter(rs => !rs.reservationId)
            .map(rs => ({ type: 'service', key: `s-${rs.id}`, sortDate: rs.createdAt, data: rs }))
        return [...roomRows, ...standaloneRows]
    }, [enrichedReservations, reservationsServices])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return combinedRows.filter(row => {
            let matchSearch, matchStatus, matchSource, matchDate
            if (row.type === 'reservation') {
                const r = row.data
                const nomComplet = `${r.clientNom || ''} ${r.clientPrenom || ''}`.toLowerCase()
                matchSearch = !search ||
                    nomComplet.includes(q) ||
                    (r.clientNom || '').toLowerCase().includes(q) ||
                    (r.clientPrenom || '').toLowerCase().includes(q) ||
                    (r.clientEmail || '').toLowerCase().includes(q) ||
                    (r.clientTelephone || '').includes(q) ||
                    (r.numeroReservation || '').toLowerCase().includes(q) ||
                    String(r.id).includes(q)
                matchStatus = filterStatus === 'ALL' || r.status === filterStatus
                matchSource = filterSource === 'ALL' || r.source === filterSource
                matchDate = (!dateDebut || new Date(r.dateArrivee) >= new Date(dateDebut)) &&
                    (!dateFin || new Date(r.dateDepart) <= new Date(dateFin))
            } else {
                const rs = row.data
                matchSearch = !search ||
                    (rs.clientNom || '').toLowerCase().includes(q) ||
                    (rs.clientEmail || '').toLowerCase().includes(q) ||
                    (rs.clientTelephone || '').includes(q) ||
                    (rs.serviceNom || '').toLowerCase().includes(q) ||
                    String(rs.id).includes(q)
                matchStatus = filterStatus === 'ALL' || rs.statut === filterStatus
                matchSource = filterSource === 'ALL'
                matchDate = (!dateDebut || new Date(rs.serviceDate) >= new Date(dateDebut)) &&
                    (!dateFin || new Date(rs.serviceDate) <= new Date(dateFin))
            }
            return matchSearch && matchStatus && matchSource && matchDate
        }).sort((a, b) => new Date(b.sortDate || 0) - new Date(a.sortDate || 0))
    }, [combinedRows, search, filterStatus, filterSource, dateDebut, dateFin])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    const activeFiltersCount = [filterStatus !== 'ALL', filterSource !== 'ALL', !!dateDebut, !!dateFin].filter(Boolean).length
    const clearFilters = () => {
        setSearch(''); setFilterStatus('ALL'); setFilterSource('ALL')
        setDateDebut(''); setDateFin(''); setCurrentPage(1)
    }
    const handleCheckin = async (id) => {
        try { await bookingAxios.post(`/booking/reservations/${id}/checkin`); await fetchData(true); showToast('Check-in effectué !') }
        catch (err) { showToast(err.response?.data?.message || 'Erreur.', 'error') }
    }
    const handleCheckout = async (reservation) => {
        const reste = Number(reservation.prixTotal || 0) - Number(reservation.montantPaye || 0)
        if (reste > 0) {
            setCheckoutBlockedModal({ open: true, reservation })
            return
        }
        try { await bookingAxios.post(`/booking/reservations/${reservation.id}/checkout`); await fetchData(true); showToast('Check-out effectué !') }
        catch (err) { showToast(err.response?.data?.message || 'Erreur.', 'error') }
    }
    const handleCancel = async (id) => {
        if (!window.confirm('Annuler cette réservation ?')) return
        try { await bookingAxios.post(`/booking/reservations/${id}/annuler`); await fetchData(true); showToast('Réservation annulée.') }
        catch (err) { showToast(err.response?.data?.message || 'Erreur.', 'error') }
    }
    const handleCancellationDecision = async (id, acceptee) => {
        let motifRefus = null
        if (acceptee) {
            if (!window.confirm('Accepter la demande et annuler la reservation ?')) return
        } else {
            motifRefus = window.prompt('Motif du refus de la demande ?')
            if (motifRefus === null) return
            if (!motifRefus.trim()) { showToast('Indiquez le motif du refus.', 'error'); return }
        }
        try {
            await bookingAxios.post(`/booking/hotel/reservations/${id}/annulation-decision`, { acceptee, motifRefus })
            await fetchData(true)
            showToast(acceptee ? 'Annulation acceptee.' : 'Demande refusee.')
        } catch (err) { showToast(err.response?.data?.message || 'Erreur.', 'error') }
    }

    const handlePayment = async (id, montant, isConfirm) => {
        try {
            if (montant > 0) await bookingAxios.post(`/booking/reservations/${id}/paiement`, { montant })
            if (isConfirm) await bookingAxios.post(`/booking/reservations/${id}/confirmer`)
            await fetchData(true)
            setPaymentModal({ open: false, reservation: null })
            setCheckoutBlockedModal({ open: false, reservation: null })
            showToast('Paiement enregistré !')
        } catch (err) { throw new Error(err.response?.data?.message || 'Erreur paiement.') }
    }
    const handleExtend = async (id, nouvelleDateDepart) => {
        try {
            await bookingAxios.patch(`/booking/reservations/${id}/prolonger`, null, {
                params: { nouvelleDateDepart }
            })
            await fetchData(true)
            setExtendModal({ open: false, reservation: null })
            showToast('Réservation prolongée !')
        } catch (err) { throw new Error(err.response?.data?.message || 'Erreur lors de la prolongation') }
    }
    const handleCreateReservation = async (form) => {
        const payload = {
            hotelId: hebergement.id,
            chambreId: form.chambreId ? Number(form.chambreId) : null,
            clientNom: form.clientNom,
            clientPrenom: form.clientPrenom || '',
            clientEmail: form.clientEmail,
            clientTelephone:form.clientTelephone || '',
            clientNationalite: form.clientNationalite || '',
            clientCinPasseport: form.clientCinPasseport || '',
            dateArrivee: form.dateArrivee,
            dateDepart: form.dateDepart,
            nbAdultes: Number(form.nombrePersonnes) || 1,
            nbEnfants: 0,
            prixTotal: Number(form.montantTotal) || 0,
            source: SOURCE_FORM_MAP[form.source] || 'DIRECT',
            notes: form.notes || '',
        }
        try {
            const res = await bookingAxios.post('/booking/reservations/create', payload)
            const reservationId = res?.data?.data?.id

            if (reservationId && Number(form.avance) > 0) {
                await bookingAxios.post(`/booking/reservations/${reservationId}/paiement`, { montant: Number(form.avance) })
            }

            let serviceErrors = 0
            if (reservationId && form.selectedServices?.length > 0) {
                for (const sel of form.selectedServices) {
                    try {
                        await bookingAxios.post('/booking/reservations-services/create', {
                            serviceId: sel.serviceId,
                            hotelId: hebergement.id,
                            reservationId,
                            serviceDate: form.dateArrivee,
                            quantite: sel.quantite,
                        })
                    } catch { serviceErrors++ }
                }
            }

            await fetchData(true)
            setShowAddModal(false)
            showToast(serviceErrors > 0
                ? `Réservation créée ! (${serviceErrors} service(s) non ajouté(s))`
                : 'Réservation créée !')
        } catch (err) { throw new Error(err.response?.data?.message || 'Erreur lors de la création') }
    }
    const handleCreateService = async (payload) => {
        try {
            await bookingAxios.post('/booking/reservations-services/create', payload)
            setServiceModal({ open: false, reservation: null })
            showToast('Service réservé !')
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de l\'ajout du service')
        }
    }
    const handleServiceStatusAction = async (id, action, successMsg) => {
        try {
            await bookingAxios.post(`/booking/reservations-services/${id}/${action}`)
            showToast(successMsg)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }
    const handleServicePayment = async (id, montant, methode) => {
        try {
            await bookingAxios.post(`/booking/reservations-services/${id}/paiement`, { montant, methode })
            showToast('Paiement enregistré !')
            setServicePaymentModal({ open: false, rs: null })
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors du paiement')
        }
    }
    const handleFactureALaChambreService = async (id) => {
        try {
            await bookingAxios.post(`/booking/reservations-services/${id}/facturer-chambre`)
            showToast('Facturé à la chambre !')
            setServicePaymentModal({ open: false, rs: null })
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur')
        }
    }
    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"
    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}
            <div className="rounded-2xl shadow-md p-6 text-white relative overflow-hidden"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des réservations</p>
                        <h1 className="text-2xl font-black text-white">Réservations</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <button onClick={() => setServiceModal({ open: true, reservation: null })}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-black transition hover:bg-white/10">
                            <Sparkles size={16}/> Nouveau service
                        </button>
                        <button onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Nouvelle réservation
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard title="Total réservations" value={stats.total} icon={TrendingUp} color="#2563eb" bg="#dbeafe" active={filterStatus === 'ALL'} onClick={() => { setFilterStatus('ALL'); setCurrentPage(1) }}/>
                <KPICard title="En attente" value={stats.pending} icon={Clock} color="#d97706" bg="#fef3c7" active={filterStatus === 'EN_ATTENTE'} onClick={() => { setFilterStatus('EN_ATTENTE'); setCurrentPage(1) }}/>
                <KPICard title="Demandes agences" value={stats.pendingAgency} icon={Briefcase} color={PURPLE} bg="#ede9fe" active={filterStatus === 'ALL' && filterSource === 'AGENCE'} onClick={() => { setFilterStatus('ALL'); setFilterSource('AGENCE'); setCurrentPage(1) }}/>
                <KPICard title="Confirmées" value={stats.confirmed} icon={CheckCircle} color="#059669" bg="#d1fae5" active={filterStatus === 'CONFIRMEE'} onClick={() => { setFilterStatus('CONFIRMEE'); setCurrentPage(1) }}/>
                <KPICard title="Check-in en cours" value={stats.checkIn} icon={User} color={PURPLE} bg="#ede9fe" active={filterStatus === 'CHECKIN'} onClick={() => { setFilterStatus('CHECKIN'); setCurrentPage(1) }}/>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par client, email, téléphone, n° réservation..."
                               value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || activeFiltersCount > 0
                                    ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/>
                        Filtres avancés
                        {activeFiltersCount > 0 && (
                            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-black"
                                  style={{ background: CYAN }}>{activeFiltersCount}</span>
                        )}
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || activeFiltersCount > 0) && (
                        <button onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Statut</label>
                            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Source</label>
                            <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Toutes les sources</option>
                                {Object.entries(SOURCE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">À partir de</label>
                            <input type="date" value={dateDebut} onChange={e => { setDateDebut(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Jusqu'au</label>
                            <input type="date" value={dateFin} min={dateDebut} onChange={e => { setDateFin(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}/>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="font-black text-gray-900">Liste des réservations</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} résultats
                        </p>
                    </div>
                </div>
                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des réservations...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <Calendar size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune réservation trouvée</p>
                        <p className="text-gray-400 text-sm mb-4">Modifiez vos critères ou créez une nouvelle réservation</p>
                        <button onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            <Plus size={15}/> Créer une réservation
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Réf.', 'Client', 'Séjour / Date', 'Chambre', 'Montants', 'Services', 'Facture', 'Statut', 'Source', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginated.map(row => {
                                if (row.type === 'reservation') {
                                    const r = row.data
                                    const src = SOURCE_CONFIG[r.source]
                                    const SrcIcon = src?.icon || Building2
                                    const paye = Number(r.montantPaye || 0)
                                    const total = Number(r.prixTotal || 0)
                                    const reste = Math.max(0, total - paye)
                                    const pct = total > 0 ? Math.round((paye / total) * 100) : 0
                                    const isAvance = paye > 0 && reste > 0
                                    const montantLabel = isAvance ? 'Avance' : 'Réglé'
                                    return (
                                        <tr key={row.key} className="hover:bg-gray-50/80 transition group">
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-black font-mono text-gray-900">{r.numeroReservation || `#${r.id}`}</span>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(r.createdAt)}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                        {(r.clientNom || 'C')[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{r.clientNom} {r.clientPrenom || ''}</p>
                                                        <p className="text-xs text-gray-400 truncate">{r.clientEmail || r.clientTelephone || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-bold text-gray-900">{getDayCount(r.dateArrivee, r.dateDepart)}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{fmtShort(r.dateArrivee)} → {fmtShort(r.dateDepart)}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-bold text-gray-900">{r.chambreNumero || (r.chambreId ? `#${r.chambreId}` : '—')}</p>
                                                <p className="text-xs text-gray-400">{r.chambreTypeNom || ''}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-black text-gray-900">{fmt(total)}</p>
                                                {paye > 0 && (
                                                    <p className="text-xs text-emerald-600 font-semibold">{montantLabel}: {fmt(paye)}</p>
                                                )}
                                                {reste > 0 ? (
                                                    <p className="text-xs text-orange-500 font-semibold">Non réglé: {fmt(reste)}</p>
                                                ) : paye > 0 ? (
                                                    <p className="text-xs text-emerald-600 font-semibold">✓ Soldé</p>
                                                ) : null}
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[50px]">
                                                        <div className="h-full rounded-full" style={{
                                                            width: `${pct}%`,
                                                            background: pct >= 100 ? '#059669' : `linear-gradient(90deg, ${CYAN}, ${NAVY})`
                                                        }}/>
                                                    </div>
                                                    <span className={`text-[10px] font-bold ${pct >= 100 ? 'text-emerald-600' : 'text-orange-500'}`}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {row.linkedServices.length > 0 ? (
                                                    <button onClick={() => setServicesDetailModal({ open: true, reservation: r, services: row.linkedServices })}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition">
                                                        <Sparkles size={12}/> {row.linkedServices.length} · {fmt(row.servicesTotal)}
                                                    </button>
                                                ) : <span className="text-xs text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                {r.facture ? (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black font-mono text-gray-700">{r.facture.numeroFacture}</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                                r.facture.statut === 'PAYEE' ? 'bg-emerald-100 text-emerald-700' :
                                                                    r.facture.statut === 'PARTIELLEMENT_PAYEE' ? 'bg-blue-100 text-blue-700' :
                                                                        r.facture.statut === 'ANNULEE' ? 'bg-red-100 text-red-500' :
                                                                            'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {r.facture.statut === 'PAYEE' ? 'Payée' :
                                                                    r.facture.statut === 'PARTIELLEMENT_PAYEE' ? 'Partiel' :
                                                                        r.facture.statut === 'ANNULEE' ? 'Annulée' : 'Non payée'}
                                                            </span>
                                                            <button onClick={() => setViewingData({ facture: r.facture, reservation: r })}
                                                                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                                                    title="Visualiser">
                                                                <Eye size={12}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : <span className="text-xs text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={r.status}/>
                                                {r.annulationDemandeStatut === 'DEMANDEE' && (
                                                    <p className="mt-1 max-w-40 text-[10px] font-semibold text-amber-700">
                                                        Demande agence: {r.annulationDemandeMotif || 'sans motif'}
                                                    </p>
                                                )}
                                                {r.annulationDemandeStatut === 'REFUSEE' && r.annulationRefusMotif && (
                                                    <p className="mt-1 max-w-40 text-[10px] text-red-600">Refus: {r.annulationRefusMotif}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {src ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ${src.cls}`}>
                                                        <SrcIcon size={11}/>{src.label}
                                                    </span>
                                                ) : <span className="text-xs text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    {r.annulationDemandeStatut === 'DEMANDEE' && (
                                                        <>
                                                            <button onClick={() => handleCancellationDecision(r.id, true)}
                                                                    className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                                                                    title="Accepter la demande d'annulation">
                                                                <Check size={11}/> Accepter annulation
                                                            </button>
                                                            <button onClick={() => handleCancellationDecision(r.id, false)}
                                                                    className="p-1.5 text-gray-500 transition hover:bg-gray-100"
                                                                    title="Refuser la demande d'annulation">
                                                                <X size={14}/>
                                                            </button>
                                                        </>
                                                    )}
                                                    {r.status === 'EN_ATTENTE' && (
                                                        <button onClick={() => setPaymentModal({ open: true, reservation: r })}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition hover:shadow-sm"
                                                                style={{ background: `linear-gradient(135deg, #059669, #047857)` }}
                                                                title="Confirmer la réservation">
                                                            <Check size={11}/> Confirmer
                                                        </button>
                                                    )}
                                                    {r.status === 'CONFIRMEE' && (
                                                        <button onClick={() => handleCheckin(r.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                                                title="Check-in">
                                                            <User size={11}/> Check-in
                                                        </button>
                                                    )}
                                                    {r.status === 'CHECKIN' && (
                                                        <>
                                                            <button onClick={() => setExtendModal({ open: true, reservation: r })}
                                                                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                                                                    title="Prolonger le séjour">
                                                                <ArrowUpRight size={14}/>
                                                            </button>
                                                            <button onClick={() => handleCheckout(r)}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                                    title="Check-out">
                                                                <User size={11}/> Check-out
                                                            </button>
                                                        </>
                                                    )}
                                                    {r.status === 'CHECKOUT' && (
                                                        <button onClick={() => {
                                                            if (window.confirm('Corriger ce check-out ? (annule le check-out et repasse en check-in)')) {
                                                                bookingAxios.post(`/booking/reservations/${r.id}/checkin`)
                                                                    .then(() => { fetchData(true); showToast('Statut corrigé.') })
                                                                    .catch(err => showToast(err.response?.data?.message || 'Erreur.', 'error'))
                                                            }
                                                        }}
                                                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                                                                title="Corriger le statut (erreur)">
                                                            <RotateCcw size={14}/>
                                                        </button>
                                                    )}
                                                    {['CONFIRMEE', 'CHECKIN'].includes(r.status) && reste > 0 && (
                                                        <button onClick={() => setPaymentModal({ open: true, reservation: r })}
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                                                title="Enregistrer un paiement">
                                                            <CreditCard size={14}/>
                                                        </button>
                                                    )}
                                                    {['CONFIRMEE', 'CHECKIN', 'CHECKOUT'].includes(r.status) && (
                                                        <button onClick={() => setServiceModal({ open: true, reservation: r })}
                                                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                                                                title="Ajouter un service">
                                                            <Sparkles size={14}/>
                                                        </button>
                                                    )}
                                                    {['EN_ATTENTE', 'CONFIRMEE'].includes(r.status) && (
                                                        <button onClick={() => handleCancel(r.id)}
                                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                                                title="Annuler">
                                                            <X size={14}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }

                                const rs = row.data
                                const rsPaye = Number(rs.montantPaye || 0)
                                const rsTotal = Number(rs.prixTotal || 0)
                                const rsReste = Math.max(0, rsTotal - rsPaye)
                                const rsPct = rsTotal > 0 ? Math.round((rsPaye / rsTotal) * 100) : 0
                                return (
                                    <tr key={row.key} className="hover:bg-purple-50/40 transition group bg-purple-50/10">
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-black font-mono text-purple-700">SRV-{rs.id}</span>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(rs.createdAt)}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                                                     style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                                                    <Sparkles size={14}/>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{rs.clientNom || 'Client'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{rs.clientEmail || rs.clientTelephone || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-gray-900">{fmtShort(rs.serviceDate)}</p>
                                            {fmtHeure(rs.serviceHeure) && <p className="text-xs text-gray-400 mt-0.5">{fmtHeure(rs.serviceHeure)}</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
                                                <Sparkles size={11}/> Service seul
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-black text-gray-900">{fmt(rsTotal)}</p>
                                            {rsPaye > 0 && <p className="text-xs text-emerald-600 font-semibold">Réglé: {fmt(rsPaye)}</p>}
                                            {rsReste > 0 ? (
                                                <p className="text-xs text-orange-500 font-semibold">Non réglé: {fmt(rsReste)}</p>
                                            ) : rsPaye > 0 ? (
                                                <p className="text-xs text-emerald-600 font-semibold">✓ Soldé</p>
                                            ) : null}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[50px]">
                                                    <div className="h-full rounded-full" style={{
                                                        width: `${rsPct}%`,
                                                        background: rsPct >= 100 ? '#059669' : `linear-gradient(90deg, ${PURPLE}, ${NAVY})`
                                                    }}/>
                                                </div>
                                                <span className={`text-[10px] font-bold ${rsPct >= 100 ? 'text-emerald-600' : 'text-orange-500'}`}>{rsPct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-bold text-gray-700">{rs.serviceNom} × {rs.quantite}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs text-gray-300">—</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge config={SERVICE_STATUT_CONFIG} value={rs.statut}/>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs text-gray-300">—</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                {rs.statut === 'EN_ATTENTE' && (
                                                    <>
                                                        <button onClick={() => handleServiceStatusAction(rs.id, 'confirmer', 'Service confirmé !')}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                                                title="Confirmer">
                                                            <CheckCircle size={12}/> Confirmer
                                                        </button>
                                                        <button onClick={() => handleServiceStatusAction(rs.id, 'annuler', 'Service annulé.')}
                                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                                                title="Annuler">
                                                            <Ban size={14}/>
                                                        </button>
                                                    </>
                                                )}
                                                {rs.statut === 'CONFIRMEE' && (
                                                    <>
                                                        <button onClick={() => handleServiceStatusAction(rs.id, 'terminer', 'Service terminé !')}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                                                title="Terminer">
                                                            <PlayCircle size={12}/> Terminer
                                                        </button>
                                                        <button onClick={() => handleServiceStatusAction(rs.id, 'annuler', 'Service annulé.')}
                                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                                                title="Annuler">
                                                            <Ban size={14}/>
                                                        </button>
                                                    </>
                                                )}
                                                {(rs.statutPaiement === 'NON_PAYE' || rs.statutPaiement === 'PARTIELLEMENT_PAYE') && rs.statut !== 'ANNULEE' && (
                                                    <button onClick={() => setServicePaymentModal({ open: true, rs })}
                                                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                                                            title="Paiement">
                                                        <CreditCard size={14}/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500 font-medium">
                            Page <span className="font-black text-gray-900">{currentPage}</span> sur {totalPages}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                    className="p-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8] transition disabled:opacity-30">
                                <ChevronLeft size={15}/>
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                                return (
                                    <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-xl text-sm font-black transition ${
                                                currentPage === page ? 'text-white shadow-sm' : 'border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8]'
                                            }`}
                                            style={currentPage === page ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                        {page}
                                    </button>
                                )
                            })}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8] transition disabled:opacity-30">
                                <ChevronRight size={15}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <PaymentModal
                isOpen={paymentModal.open}
                reservation={paymentModal.reservation}
                onSubmit={handlePayment}
                onClose={() => setPaymentModal({ open: false, reservation: null })}
            />
            <CheckoutBlockedModal
                isOpen={checkoutBlockedModal.open}
                reservation={checkoutBlockedModal.reservation}
                onClose={() => setCheckoutBlockedModal({ open: false, reservation: null })}
                onPayNow={() => {
                    const r = checkoutBlockedModal.reservation
                    setCheckoutBlockedModal({ open: false, reservation: null })
                    setPaymentModal({ open: true, reservation: r })
                }}
            />
            <ExtendModal
                isOpen={extendModal.open}
                reservation={extendModal.reservation}
                onClose={() => setExtendModal({ open: false, reservation: null })}
                onConfirm={handleExtend}
            />
            <ServiceModal
                isOpen={serviceModal.open}
                presetReservation={serviceModal.reservation}
                services={services}
                reservations={reservations}
                hotelId={hebergement?.id}
                onSubmit={handleCreateService}
                onClose={() => setServiceModal({ open: false, reservation: null })}
            />
            <ServicesDetailModal
                isOpen={servicesDetailModal.open}
                reservation={servicesDetailModal.reservation}
                services={servicesDetailModal.services}
                catalog={services}
                onAction={handleServiceStatusAction}
                onPay={(rs) => { setServicesDetailModal({ open: false, reservation: null, services: [] }); setServicePaymentModal({ open: true, rs }) }}
                onClose={() => setServicesDetailModal({ open: false, reservation: null, services: [] })}
            />
            <ServicePaymentModal
                isOpen={servicePaymentModal.open}
                rs={servicePaymentModal.rs}
                onConfirm={handleServicePayment}
                onFacturerChambre={handleFactureALaChambreService}
                onClose={() => setServicePaymentModal({ open: false, rs: null })}
            />
            <ReservationModal
                isOpen={showAddModal}
                chambres={chambres}
                services={services}
                reservations={reservations}
                onSubmit={handleCreateReservation}
                onClose={() => setShowAddModal(false)}
            />
            <FactureViewModal
                facture={viewingData?.facture || null}
                reservation={viewingData?.reservation || null}
                onClose={() => setViewingData(null)}
            />
        </div>
    )
}

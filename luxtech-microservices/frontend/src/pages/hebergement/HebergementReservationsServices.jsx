import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Sparkles, Plus, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronDown, User, Users, Clock, DollarSign, CreditCard, Home,
    CheckCircle, XCircle, PlayCircle, Ban, Receipt
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const STATUT_CONFIG = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-100 text-amber-700', dot: '#d97706' },
    CONFIRMEE:  { label: 'Confirmée',  cls: 'bg-blue-100 text-blue-700',   dot: '#2563eb' },
    TERMINEE:   { label: 'Terminée',   cls: 'bg-emerald-100 text-emerald-700', dot: '#059669' },
    ANNULEE:    { label: 'Annulée',    cls: 'bg-red-100 text-red-600',     dot: '#dc2626' },
}

const PAIEMENT_CONFIG = {
    NON_PAYE:             { label: 'Non payé',   cls: 'bg-red-50 text-red-600' },
    PARTIELLEMENT_PAYE:   { label: 'Partiel',    cls: 'bg-amber-50 text-amber-600' },
    PAYE:                 { label: 'Payé',       cls: 'bg-emerald-50 text-emerald-600' },
    FACTURE_CHAMBRE:      { label: 'Facturé chambre', cls: 'bg-purple-50 text-purple-600' },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtHeure = (h) => h ? h.slice(0, 5) : null

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
        <p className="relative text-3xl font-black text-gray-900 mb-0.5">{value ?? 0}</p>
        <p className="relative text-sm text-gray-500 font-medium">{title}</p>
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: color }}/>}
    </div>
)

// ── Modal Créer une réservation de service ────────────────
const CreateModal = ({ isOpen, services, reservations, hotelId, onSubmit, onClose }) => {
    const [clientType, setClientType] = useState('existant') // 'existant' | 'externe'
    const [form, setForm] = useState({
        serviceId: '', reservationId: '', clientNom: '', clientEmail: '', clientTelephone: '',
        serviceDate: '', serviceHeure: '', quantite: 1, notes: ''
    })
    const [searchClient, setSearchClient] = useState('')
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setClientType('existant')
            setSearchClient('')
            setForm({ serviceId: services[0]?.id || '', reservationId: '', clientNom: '', clientEmail: '', clientTelephone: '',
                serviceDate: new Date().toISOString().slice(0, 10), serviceHeure: '', quantite: 1, notes: '' })
        }
    }, [isOpen, services])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const selectedService = useMemo(() => services.find(s => String(s.id) === String(form.serviceId)), [services, form.serviceId])
    const prixEstime = selectedService ? Number(selectedService.prix) * Number(form.quantite || 1) : 0

    const filteredReservations = useMemo(() => {
        const q = searchClient.toLowerCase()
        return reservations.filter(r =>
            !q || (r.clientNom || '').toLowerCase().includes(q) ||
            (r.numeroReservation || '').toLowerCase().includes(q)
        ).slice(0, 8)
    }, [reservations, searchClient])

    const handleSubmit = async () => {
        if (!form.serviceId) { setError('Veuillez sélectionner un service'); return }
        if (!form.serviceDate) { setError('La date est obligatoire'); return }
        if (clientType === 'existant' && !form.reservationId) { setError('Veuillez sélectionner un client'); return }
        if (clientType === 'externe' && !form.clientNom.trim()) { setError('Le nom du client est obligatoire'); return }

        setProcessing(true)
        try {
            await onSubmit({
                serviceId: Number(form.serviceId),
                hotelId,
                reservationId: clientType === 'existant' ? Number(form.reservationId) : null,
                clientNom: clientType === 'externe' ? form.clientNom.trim() : null,
                clientEmail: clientType === 'externe' ? form.clientEmail || null : null,
                clientTelephone: clientType === 'externe' ? form.clientTelephone || null : null,
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
    const selectedReservation = reservations.find(r => String(r.id) === String(form.reservationId))

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
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Nouvelle</p>
                                <h2 className="text-lg font-black text-white">Réservation de service</h2>
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

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Type de client</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setClientType('existant')}
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
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Rechercher un client / réservation</label>
                            <div className="relative mb-2">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Nom ou n° réservation..."
                                       value={searchClient} onChange={e => setSearchClient(e.target.value)}
                                       className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-gray-50"/>
                            </div>
                            {selectedReservation ? (
                                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-[#66CAD8] bg-[#66CAD8]/5">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedReservation.clientNom} {selectedReservation.clientPrenom}</p>
                                        <p className="text-xs text-gray-400 font-mono">{selectedReservation.numeroReservation}</p>
                                    </div>
                                    <button onClick={() => setForm(p => ({ ...p, reservationId: '' }))} className="text-gray-400 hover:text-red-500">
                                        <X size={16}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="max-h-40 overflow-y-auto space-y-1.5">
                                    {filteredReservations.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-3">Aucun résultat</p>
                                    ) : filteredReservations.map(r => (
                                        <button key={r.id} type="button"
                                                onClick={() => { setForm(p => ({ ...p, reservationId: r.id })); setSearchClient('') }}
                                                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-[#66CAD8] hover:bg-gray-50 transition text-left">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{r.clientNom} {r.clientPrenom}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{r.numeroReservation}</p>
                                            </div>
                                            <User size={13} className="text-gray-300"/>
                                        </button>
                                    ))}
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
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Créer</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Modal Paiement ─────────────────────────────────────────
const PaymentModal = ({ isOpen, rs, onConfirm, onFacturerChambre, onClose }) => {
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
                    <h2 className="text-lg font-black text-gray-900">Paiement</h2>
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

export default function HebergementReservationsServices() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [services, setServices] = useState([])
    const [reservations, setReservations] = useState([])
    const [reservationsServices, setReservationsServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterStatut, setFilterStatut] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [paymentTarget, setPaymentTarget] = useState(null)
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
                const [servicesRes, reservationsRes, rsRes] = await Promise.all([
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/services`).catch(() => null),
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(() => null),
                    bookingAxios.get(`/booking/reservations-services/hotel/${h.id}`).catch(() => null),
                ])
                setServices((servicesRes?.data?.data || []).filter(s => s.isActive))
                setReservations(reservationsRes?.data?.data || [])
                setReservationsServices(rsRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const stats = useMemo(() => ({
        total: reservationsServices.length,
        enAttente: reservationsServices.filter(r => r.statut === 'EN_ATTENTE').length,
        confirmees: reservationsServices.filter(r => r.statut === 'CONFIRMEE').length,
        revenu: reservationsServices.filter(r => r.statut !== 'ANNULEE').reduce((s, r) => s + Number(r.prixTotal || 0), 0),
    }), [reservationsServices])

    const filtered = useMemo(() => {
        return reservationsServices.filter(r => {
            const q = search.toLowerCase()
            const matchSearch = !search || (r.serviceNom || '').toLowerCase().includes(q) || (r.clientNom || '').toLowerCase().includes(q)
            const matchStatut = filterStatut === 'ALL' || r.statut === filterStatut
            return matchSearch && matchStatut
        }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }, [reservationsServices, search, filterStatut])

    const handleCreate = async (payload) => {
        try {
            await bookingAxios.post('/booking/reservations-services/create', payload)
            showToast('Réservation de service créée !')
            setShowCreateModal(false)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la création')
        }
    }

    const handleAction = async (id, action, successMsg) => {
        try {
            await bookingAxios.post(`/booking/reservations-services/${id}/${action}`)
            showToast(successMsg)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    const handlePayment = async (id, montant, methode) => {
        try {
            await bookingAxios.post(`/booking/reservations-services/${id}/paiement`, { montant, methode })
            showToast('Paiement enregistré !')
            setPaymentTarget(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors du paiement')
        }
    }

    const handleFacturerChambre = async (id) => {
        try {
            await bookingAxios.post(`/booking/reservations-services/${id}/facturer-chambre`)
            showToast('Facturé à la chambre !')
            setPaymentTarget(null)
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
                 style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, ${NAVY} 100%)` }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Réservations de services</p>
                        <h1 className="text-2xl font-black text-white">Services réservés</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} réservation{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <button onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Nouvelle réservation
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total"      value={stats.total}      icon={Sparkles} color="#5D2E8B" bg="#f3e8ff" active={filterStatut === 'ALL'}       onClick={() => setFilterStatut('ALL')}/>
                <KPICard title="En attente" value={stats.enAttente}  icon={Clock}    color="#d97706" bg="#fef3c7" active={filterStatut === 'EN_ATTENTE'} onClick={() => setFilterStatut('EN_ATTENTE')}/>
                <KPICard title="Confirmées" value={stats.confirmees} icon={CheckCircle} color="#2563eb" bg="#dbeafe" active={filterStatut === 'CONFIRMEE'} onClick={() => setFilterStatut('CONFIRMEE')}/>
                <KPICard title="Revenu"     value={fmt(stats.revenu)} icon={DollarSign} color="#059669" bg="#d1fae5" active={false} onClick={() => {}}/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par service ou client..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterStatut !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/> Filtres
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Statut</label>
                        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className={inputCls}>
                            <option value="ALL">Tous les statuts</option>
                            {Object.entries(STATUT_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Liste des réservations</h2>
                </div>

                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${PURPLE}15, ${CYAN}15)` }}>
                            <Sparkles size={32} style={{ color: PURPLE }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune réservation de service</p>
                        <p className="text-gray-400 text-sm">Créez-en une depuis le bouton ci-dessus</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Service', 'Client', 'Date', 'Qté', 'Total', 'Paiement', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map(rs => {
                                const heure = fmtHeure(rs.serviceHeure)
                                return (
                                    <tr key={rs.id} className="hover:bg-gray-50/80 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                                     style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                    <Sparkles size={14}/>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{rs.serviceNom}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-700">{rs.clientNom || '—'}</p>
                                            {rs.reservationId && <p className="text-[10px] text-gray-400 flex items-center gap-1"><Home size={10}/> Client hôtel</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-700">{fmtDate(rs.serviceDate)}</p>
                                            {heure && <p className="text-[10px] text-gray-400">{heure}</p>}
                                        </td>
                                        <td className="px-5 py-4"><span className="text-sm text-gray-700">{rs.quantite}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm font-black text-gray-900">{fmt(rs.prixTotal)}</span></td>
                                        <td className="px-5 py-4"><Badge config={PAIEMENT_CONFIG} value={rs.statutPaiement}/></td>
                                        <td className="px-5 py-4"><Badge config={STATUT_CONFIG} value={rs.statut}/></td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                {rs.statut === 'EN_ATTENTE' && (
                                                    <>
                                                        <button onClick={() => handleAction(rs.id, 'confirmer', 'Réservation confirmée !')}
                                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Confirmer">
                                                            <CheckCircle size={14}/>
                                                        </button>
                                                        <button onClick={() => handleAction(rs.id, 'annuler', 'Réservation annulée.')}
                                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition" title="Annuler">
                                                            <Ban size={14}/>
                                                        </button>
                                                    </>
                                                )}
                                                {rs.statut === 'CONFIRMEE' && (
                                                    <>
                                                        <button onClick={() => handleAction(rs.id, 'terminer', 'Service terminé !')}
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition" title="Terminer">
                                                            <PlayCircle size={14}/>
                                                        </button>
                                                        <button onClick={() => handleAction(rs.id, 'annuler', 'Réservation annulée.')}
                                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition" title="Annuler">
                                                            <Ban size={14}/>
                                                        </button>
                                                    </>
                                                )}
                                                {(rs.statutPaiement === 'NON_PAYE' || rs.statutPaiement === 'PARTIELLEMENT_PAYE') && rs.statut !== 'ANNULEE' && (
                                                    <button onClick={() => setPaymentTarget(rs)}
                                                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition" title="Paiement">
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
            </div>

            <CreateModal
                isOpen={showCreateModal}
                services={services}
                reservations={reservations}
                hotelId={hebergement?.id}
                onSubmit={handleCreate}
                onClose={() => setShowCreateModal(false)}
            />
            <PaymentModal
                isOpen={!!paymentTarget}
                rs={paymentTarget}
                onConfirm={handlePayment}
                onFacturerChambre={handleFacturerChambre}
                onClose={() => setPaymentTarget(null)}
            />
        </div>
    )
}
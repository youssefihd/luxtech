import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    FileText, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronLeft, ChevronRight, CheckCircle, XCircle, ChevronDown, Eye, Download, Loader
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import FactureViewModal from './FactureViewModal'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const STATUT_CONFIG = {
    PAYEE:               { label: 'Payée',    cls: 'bg-emerald-100 text-emerald-700', dot: '#059669' },
    PARTIELLEMENT_PAYEE: { label: 'Partiel',  cls: 'bg-blue-100 text-blue-700',      dot: '#2563eb' },
    IMPAYEE:             { label: 'Non payée',cls: 'bg-amber-100 text-amber-700',    dot: '#d97706' },
    ANNULEE:             { label: 'Annulée',  cls: 'bg-red-100 text-red-600',        dot: '#dc2626' },
}

const TYPE_HEBERGEMENT_LABELS = {
    hotel:     'Hôtel',
    auberge:   'Auberge',
    camping:   'Camping',
    ferme:     'Ferme',
    gite:      'Gîte',
    maison:    "Maison d'hôtes",
    pension:   'Pension',
    relais:    'Relais',
    residence: 'Résidence',
    riad:      'Riad',
    villa:     'Villa',
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', {
    style: 'currency', currency: 'MAD', minimumFractionDigits: 0
}).format(Number(v) || 0)

const fmtDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
    catch { return '—' }
}

const fmtShort = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }
    catch { return '—' }
}

const StatutBadge = ({ statut }) => {
    const c = STATUT_CONFIG[statut] || { label: statut, cls: 'bg-gray-100 text-gray-600', dot: '#6b7280' }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${c.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }}/>
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

const MarkPaidModal = ({ isOpen, facture, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(facture.id) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !facture) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-7 w-7 text-emerald-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Marquer comme payée</h2>
                    <p className="text-sm text-gray-500 mt-1">Facture <span className="font-bold">{facture.numeroFacture}</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">Montant : <span className="font-black text-gray-900">{fmt(facture.montantTotal)}</span></p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementFactures() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement]   = useState(null)
    const [factures, setFactures]         = useState([])
    const [reservations, setReservations] = useState([])
    const [loading, setLoading]           = useState(true)
    const [refreshing, setRefreshing]     = useState(false)

    const [search, setSearch]             = useState('')
    const [filterStatut, setFilterStatut] = useState('ALL')
    const [showFilters, setShowFilters]   = useState(false)
    const [currentPage, setCurrentPage]   = useState(1)
    const ITEMS_PER_PAGE = 10

    const [viewingData, setViewingData]     = useState(null)
    const [markPaidModal, setMarkPaidModal] = useState({ open: false, facture: null })
    const [downloadingId, setDownloadingId] = useState(null)
    const [toast, setToast]                 = useState(null)

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
                const [facturesRes, reservationsRes] = await Promise.all([
                    bookingAxios.get(`/booking/factures/hotel/${h.id}`).catch(() => null),
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(() => null),
                ])
                setFactures(facturesRes?.data?.data || [])
                setReservations(reservationsRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const typeHebergementLabel = useMemo(() => {
        if (!hebergement?.typeHebergement) return 'Hébergement'
        const t = hebergement.typeHebergement.toLowerCase()
        return TYPE_HEBERGEMENT_LABELS[t] || (t.charAt(0).toUpperCase() + t.slice(1))
    }, [hebergement])

    const enriched = useMemo(() => {
        return factures.map(f => {
            const resa = reservations.find(r => Number(r.id) === Number(f.reservationId))
            return {
                ...f,
                clientNom:         resa?.clientNom         || '—',
                clientPrenom:      resa?.clientPrenom       || '',
                clientEmail:       resa?.clientEmail        || '',
                numeroReservation: resa?.numeroReservation  || '',
                dateArrivee:       resa?.dateArrivee        || null,
                dateDepart:        resa?.dateDepart         || null,
                montantPaye:       resa?.montantPaye        || 0,
                reservation:       resa || null,
            }
        })
    }, [factures, reservations])

    const stats = useMemo(() => ({
        total:        enriched.length,
        payees:       enriched.filter(f => f.statut === 'PAYEE').length,
        partielles:   enriched.filter(f => f.statut === 'PARTIELLEMENT_PAYEE').length,
        impayees:     enriched.filter(f => f.statut === 'IMPAYEE').length,
        montantTotal: enriched.reduce((s, f) => s + Number(f.montantTotal || 0), 0),
    }), [enriched])

    const filtered = useMemo(() => {
        return enriched.filter(f => {
            const q = search.toLowerCase()
            const matchSearch = !search ||
                (f.numeroFacture || '').toLowerCase().includes(q) ||
                (f.clientNom || '').toLowerCase().includes(q) ||
                (f.clientEmail || '').toLowerCase().includes(q) ||
                (f.numeroReservation || '').toLowerCase().includes(q)
            const matchStatut = filterStatut === 'ALL' || f.statut === filterStatut
            return matchSearch && matchStatut
        }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }, [enriched, search, filterStatut])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleMarkPaid = async (factureId) => {
        try {
            await bookingAxios.patch(`/booking/factures/${factureId}/statut`, null, { params: { statut: 'PAYEE' } })
            await fetchData(true)
            setMarkPaidModal({ open: false, facture: null })
            showToast('Facture marquée comme payée !')
        } catch (err) { showToast(err.response?.data?.message || 'Erreur.', 'error') }
    }

    const handleDownloadFacture = async (facture) => {
        setDownloadingId(facture.id)
        try {
            const res = await bookingAxios.get(`/booking/factures/${facture.id}/pdf`, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${facture.numeroFacture || 'facture'}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            showToast('Facture téléchargée !')
        } catch (err) {
            console.error(err)
            showToast('Erreur lors du téléchargement.', 'error')
        } finally {
            setDownloadingId(null)
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

            {/* Header */}
            <div className="rounded-2xl shadow-md p-6 text-white relative overflow-hidden"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des factures</p>
                        <h1 className="text-2xl font-black text-white">Factures</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} facture{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50 self-start sm:self-auto">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                        Actualiser
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total factures"     value={stats.total}             icon={FileText}    color="#2563eb" bg="#dbeafe" active={filterStatut === 'ALL'}                onClick={() => { setFilterStatut('ALL');                setCurrentPage(1) }}/>
                <KPICard title="Payées"             value={stats.payees}            icon={CheckCircle} color="#059669" bg="#d1fae5" active={filterStatut === 'PAYEE'}              onClick={() => { setFilterStatut('PAYEE');              setCurrentPage(1) }}/>
                <KPICard title="Partielles"         value={stats.partielles}        icon={FileText}    color="#2563eb" bg="#dbeafe" active={filterStatut === 'PARTIELLEMENT_PAYEE'} onClick={() => { setFilterStatut('PARTIELLEMENT_PAYEE'); setCurrentPage(1) }}/>
                <KPICard title="Non payées"         value={stats.impayees}          icon={XCircle}     color="#d97706" bg="#fef3c7" active={filterStatut === 'IMPAYEE'}            onClick={() => { setFilterStatut('IMPAYEE');            setCurrentPage(1) }}/>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par n° facture, client, n° réservation..."
                               value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterStatut !== 'ALL'
                                    ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/>
                        Filtres
                        {filterStatut !== 'ALL' && (
                            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-black"
                                  style={{ background: CYAN }}>1</span>
                        )}
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || filterStatut !== 'ALL') && (
                        <button onClick={() => { setSearch(''); setFilterStatut('ALL'); setCurrentPage(1) }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Statut</label>
                        <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setCurrentPage(1) }}
                                className={inputCls}>
                            <option value="ALL">Tous les statuts</option>
                            <option value="PAYEE">Payée</option>
                            <option value="PARTIELLEMENT_PAYEE">Partielle</option>
                            <option value="IMPAYEE">Non payée</option>
                            <option value="ANNULEE">Annulée</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Liste des factures</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} résultats
                    </p>
                </div>

                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des factures...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <FileText size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune facture trouvée</p>
                        <p className="text-gray-400 text-sm">Les factures sont générées automatiquement lors de la création des réservations</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['N° Facture', 'Client', 'Réservation', 'Montant', 'Paiement', 'Type', 'Statut', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginated.map(f => {
                                const paye  = Number(f.montantPaye) || 0
                                const total = Number(f.montantTotal) || 0
                                const reste = Math.max(0, total - paye)
                                const pct   = total > 0 ? Math.round((paye / total) * 100) : 0
                                const typeLabel = f.agenceId ? 'Agence' : typeHebergementLabel
                                const typeCls   = f.agenceId ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'

                                return (
                                    <tr key={f.id} className="hover:bg-gray-50/80 transition group">

                                        {/* N° Facture */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-black font-mono text-gray-900">{f.numeroFacture}</span>
                                        </td>

                                        {/* Client */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                                                     style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                    {(f.clientNom || 'C')[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{f.clientNom} {f.clientPrenom}</p>
                                                    <p className="text-xs text-gray-400 truncate">{f.clientEmail || '—'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Réservation */}
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono font-bold text-gray-700">{f.numeroReservation || '—'}</span>
                                            {f.dateArrivee && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    {fmtShort(f.dateArrivee)} → {fmtShort(f.dateDepart)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Montant */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-black text-gray-900">{fmt(f.montantTotal)}</p>
                                            <p className="text-[10px] text-gray-400">HT: {fmt(f.montantHt)}</p>
                                        </td>

                                        {/* Paiement */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[60px]">
                                                    <div className="h-full rounded-full" style={{
                                                        width: `${pct}%`,
                                                        background: pct >= 100 ? '#059669' : pct > 0 ? `linear-gradient(90deg, ${CYAN}, ${NAVY})` : '#e5e7eb'
                                                    }}/>
                                                </div>
                                                <span className={`text-[10px] font-bold ${
                                                    pct >= 100 ? 'text-emerald-600' :
                                                        pct > 0    ? 'text-blue-600' :
                                                            'text-orange-500'
                                                }`}>{pct}%</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {paye > 0 ? `Payé: ${fmt(paye)} · ` : ''}
                                                {reste > 0 ? `Reste: ${fmt(reste)}` : '✓ Soldé'}
                                            </p>
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeCls}`}>
                                                {typeLabel}
                                            </span>
                                        </td>

                                        {/* Statut */}
                                        <td className="px-5 py-4">
                                            <StatutBadge statut={f.statut}/>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-700">{fmtDate(f.dateFacture)}</p>
                                            {f.dateEcheance && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">Éch: {fmtDate(f.dateEcheance)}</p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setViewingData({ facture: f, reservation: f.reservation })}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                                        title="Visualiser">
                                                    <Eye size={14}/>
                                                </button>
                                                <button onClick={() => handleDownloadFacture(f)}
                                                        disabled={downloadingId === f.id}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
                                                        title="Télécharger PDF">
                                                    {downloadingId === f.id
                                                        ? <Loader size={14} className="animate-spin"/>
                                                        : <Download size={14}/>}
                                                </button>
                                                {(f.statut === 'IMPAYEE' || f.statut === 'PARTIELLEMENT_PAYEE') && (
                                                    <button onClick={() => setMarkPaidModal({ open: true, facture: f })}
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                                            title="Marquer comme payée">
                                                        <CheckCircle size={14}/>
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

            <FactureViewModal
                facture={viewingData?.facture || null}
                reservation={viewingData?.reservation || null}
                onClose={() => setViewingData(null)}
            />
            <MarkPaidModal
                isOpen={markPaidModal.open}
                facture={markPaidModal.facture}
                onConfirm={handleMarkPaid}
                onClose={() => setMarkPaidModal({ open: false, facture: null })}
            />
        </div>
    )
}
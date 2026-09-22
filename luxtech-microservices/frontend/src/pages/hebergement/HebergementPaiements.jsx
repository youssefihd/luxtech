import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    CreditCard, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronLeft, ChevronRight, ChevronDown, TrendingUp, DollarSign,
    Calendar, Download, FileSpreadsheet, FileText, Bed, Sparkles,
    RotateCcw, Wallet, Banknote, Landmark, Eye
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { hebergementAxios, bookingAxios, paymentAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import FactureViewModal from './FactureViewModal'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const MODE_CONFIG = {
    ESPECES:        { label: 'Espèces',  cls: 'bg-emerald-50 text-emerald-700', icon: Banknote },
    CARTE_BANCAIRE: { label: 'Carte',    cls: 'bg-blue-50 text-blue-700',       icon: CreditCard },
    VIREMENT:       { label: 'Virement', cls: 'bg-purple-50 text-purple-700',   icon: Landmark },
    CHEQUE:         { label: 'Chèque',   cls: 'bg-amber-50 text-amber-700',     icon: Wallet },
    STRIPE:         { label: 'Stripe',   cls: 'bg-indigo-50 text-indigo-700',   icon: CreditCard },
}

const STATUS_CONFIG = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
    VALIDE:     { label: 'Validé',     cls: 'bg-emerald-50 text-emerald-700' },
    ECHOUE:     { label: 'Échoué',     cls: 'bg-red-50 text-red-600' },
    REMBOURSE:  { label: 'Remboursé',  cls: 'bg-gray-100 text-gray-500' },
    ANNULE:     { label: 'Annulé',     cls: 'bg-gray-100 text-gray-500' },
}

const SOLDE_CONFIG = {
    PAYE:                { label: 'Payé',      cls: 'bg-emerald-100 text-emerald-700' },
    PARTIELLEMENT_PAYE:  { label: 'Partiel',   cls: 'bg-orange-100 text-orange-700' },
    NON_PAYE:            { label: 'Non payé',  cls: 'bg-red-100 text-red-600' },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

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

const ExportMenu = ({ onExportExcel, onExportPdf, disabled }) => {
    const [open, setOpen] = useState(false)
    const [ref, setRef] = useState(null)

    useEffect(() => {
        const handler = (e) => { if (ref && !ref.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [ref])

    return (
        <div className="relative" ref={setRef}>
            <button onClick={() => setOpen(v => !v)} disabled={disabled}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-black transition hover:bg-white/10 disabled:opacity-50">
                <Download size={16}/> Exporter
                <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button onClick={() => { onExportExcel(); setOpen(false) }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <FileSpreadsheet size={15} className="text-emerald-600"/> Excel (.xlsx)
                    </button>
                    <button onClick={() => { onExportPdf(); setOpen(false) }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50">
                        <FileText size={15} className="text-red-600"/> PDF
                    </button>
                </div>
            )}
        </div>
    )
}

const RembourserModal = ({ isOpen, paiement, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(paiement.id) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !paiement) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <RotateCcw className="h-7 w-7 text-amber-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Rembourser ce paiement</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {paiement.clientNom || paiement.reference} — <span className="font-bold">{fmt(paiement.montant)}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementPaiements() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [paiements, setPaiements] = useState([])
    const [reservations, setReservations] = useState([])
    const [reservationsServices, setReservationsServices] = useState([])
    const [factures, setFactures] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterMode, setFilterMode] = useState('ALL')
    const [filterType, setFilterType] = useState('ALL')
    const [filterSolde, setFilterSolde] = useState('ALL')
    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    const [rembourserTarget, setRembourserTarget] = useState(null)
    const [viewingFacture, setViewingFacture] = useState(null)
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
                const [payRes, resaRes, resaSrvRes, factRes] = await Promise.all([
                    paymentAxios.get(`/payment/hotel/${h.id}`).catch(() => null),
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(() => null),
                    bookingAxios.get(`/booking/reservations-services/hotel/${h.id}`).catch(() => null),
                    bookingAxios.get(`/booking/factures/hotel/${h.id}`).catch(() => null),
                ])
                setPaiements(payRes?.data?.data || [])
                setReservations(resaRes?.data?.data || [])
                setReservationsServices(resaSrvRes?.data?.data || [])
                setFactures(factRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    // ── Enrichit chaque transaction avec le solde global de sa réservation/service ──
    const enrichedPaiements = useMemo(() => {
        return paiements.map(p => {
            let prixTotal = null, montantPaye = null, soldeStatut = null, facture = null, parent = null

            if (p.reservationId != null) {
                parent = reservations.find(r => r.id === p.reservationId)
                if (parent) {
                    prixTotal = Number(parent.prixTotal || 0)
                    montantPaye = Number(parent.montantPaye || 0)
                    soldeStatut = parent.paymentStatus
                    facture = factures.find(f => Number(f.reservationId) === Number(parent.id)) || null
                }
            } else if (p.reservationServiceId != null) {
                parent = reservationsServices.find(rs => rs.id === p.reservationServiceId)
                if (parent) {
                    prixTotal = Number(parent.prixTotal || 0)
                    montantPaye = Number(parent.montantPaye || 0)
                    soldeStatut = parent.statutPaiement === 'FACTURE_CHAMBRE' ? 'PAYE' : parent.statutPaiement
                }
            }

            const resteAPayer = prixTotal != null ? Math.max(0, prixTotal - montantPaye) : null

            return { ...p, prixTotal, montantPaye, resteAPayer, soldeStatut, facture }
        })
    }, [paiements, reservations, reservationsServices, factures])

    const stats = useMemo(() => {
        const valides = enrichedPaiements.filter(p => p.status === 'VALIDE')
        const now = new Date()
        const ceMois = valides.filter(p => {
            const d = new Date(p.createdAt)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        return {
            total: enrichedPaiements.length,
            montantTotal: valides.reduce((s, p) => s + Number(p.montant || 0), 0),
            montantMois: ceMois.reduce((s, p) => s + Number(p.montant || 0), 0),
            resteAPayerTotal: enrichedPaiements.reduce((s, p) => s + (p.resteAPayer || 0), 0),
        }
    }, [enrichedPaiements])

    const filtered = useMemo(() => {
        return enrichedPaiements.filter(p => {
            const q = search.toLowerCase()
            const matchSearch = !search ||
                (p.clientNom || '').toLowerCase().includes(q) ||
                (p.reference || '').toLowerCase().includes(q)
            const matchMode = filterMode === 'ALL' || p.modePaiement === filterMode
            const matchType = filterType === 'ALL' ||
                (filterType === 'CHAMBRE' && p.reservationServiceId == null) ||
                (filterType === 'SERVICE' && p.reservationServiceId != null)
            const matchSolde = filterSolde === 'ALL' || p.soldeStatut === filterSolde
            const matchDate = (!dateDebut || new Date(p.createdAt) >= new Date(dateDebut)) &&
                (!dateFin || new Date(p.createdAt) <= new Date(dateFin + 'T23:59:59'))
            return matchSearch && matchMode && matchType && matchSolde && matchDate
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [enrichedPaiements, search, filterMode, filterType, filterSolde, dateDebut, dateFin])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleRembourser = async (id) => {
        try {
            await paymentAxios.post(`/payment/${id}/rembourser`)
            showToast('Paiement remboursé.')
            setRembourserTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors du remboursement.', 'error')
        }
    }

    const handleExportExcel = () => {
        const rows = filtered.map(p => ({
            'Référence': p.reference || '',
            'Client': p.clientNom || '',
            'Type': p.reservationServiceId != null ? 'Service' : 'Chambre',
            'Montant (MAD)': p.montant,
            'Mode': MODE_CONFIG[p.modePaiement]?.label || p.modePaiement,
            'Statut transaction': STATUS_CONFIG[p.status]?.label || p.status,
            'Reste à payer (MAD)': p.resteAPayer ?? '',
            'État solde': p.soldeStatut ? (SOLDE_CONFIG[p.soldeStatut]?.label || p.soldeStatut) : '',
            'Date': fmtDateTime(p.createdAt),
            'Notes': p.notes || '',
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        ws['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 18 }, { wch: 25 }]
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Paiements')
        const dateStr = new Date().toISOString().slice(0, 10)
        XLSX.writeFile(wb, `paiements_${hebergement?.nom?.replace(/\s+/g, '_') || 'hotel'}_${dateStr}.xlsx`)
    }

    const handleExportPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 14

        doc.setFillColor(29, 34, 82)
        doc.rect(0, 0, pageWidth, 28, 'F')
        doc.setFillColor(102, 202, 216)
        doc.rect(0, 28, pageWidth, 1, 'F')

        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('LUX', margin, 9)
        const luxW = doc.getTextWidth('LUX')
        doc.setTextColor(102, 202, 216)
        doc.text('TECH', margin + luxW, 9)

        doc.setFontSize(17)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text(hebergement?.nom || 'Établissement', margin, 20)

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(210, 218, 235)
        doc.text(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), pageWidth - margin, 10, { align: 'right' })
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(102, 202, 216)
        doc.text(`${fmt(stats.montantTotal)} encaissé`, pageWidth - margin, 18, { align: 'right' })

        const body = filtered.map(p => [
            p.reference || '—',
            p.clientNom || '—',
            p.reservationServiceId != null ? 'Service' : 'Chambre',
            fmt(p.montant),
            MODE_CONFIG[p.modePaiement]?.label || p.modePaiement,
            p.resteAPayer != null ? fmt(p.resteAPayer) : '—',
            p.soldeStatut ? (SOLDE_CONFIG[p.soldeStatut]?.label || p.soldeStatut) : '—',
            fmtDate(p.createdAt),
        ])

        autoTable(doc, {
            startY: 38,
            head: [['Référence', 'Client', 'Type', 'Montant', 'Mode', 'Reste à payer', 'État', 'Date']],
            body,
            theme: 'plain',
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [29, 34, 82], textColor: 255, fontStyle: 'bold', fontSize: 9.5, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
            bodyStyles: { fontSize: 9, cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 }, textColor: [55, 65, 81], lineColor: [235, 237, 242], lineWidth: 0.15 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [29, 34, 82] },
                3: { fontStyle: 'bold', textColor: [5, 150, 105] },
                5: { fontStyle: 'bold', textColor: [217, 119, 6] },
            },
        })

        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setDrawColor(230, 230, 235)
            doc.setLineWidth(0.3)
            doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)
            doc.setFontSize(7.5)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(150, 150, 160)
            doc.text('Généré automatiquement par LuxTech PMS', margin, pageHeight - 9)
            doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' })
        }

        const dateStr = new Date().toISOString().slice(0, 10)
        doc.save(`paiements_${hebergement?.nom?.replace(/\s+/g, '_') || 'hotel'}_${dateStr}.pdf`)
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

            <div className="rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Suivi financier</p>
                        <h1 className="text-2xl font-black text-white">Paiements</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <ExportMenu onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} disabled={filtered.length === 0}/>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total transactions" value={stats.total}              icon={TrendingUp}  color="#2563eb" bg="#dbeafe" active={filterSolde === 'ALL'}              onClick={() => setFilterSolde('ALL')}/>
                <KPICard title="Total encaissé"     value={fmt(stats.montantTotal)}   icon={DollarSign}  color="#059669" bg="#d1fae5" active={false}                              onClick={() => {}}/>
                <KPICard title="Reste à recouvrer"  value={fmt(stats.resteAPayerTotal)} icon={AlertTriangle} color="#d97706" bg="#fef3c7" active={filterSolde === 'PARTIELLEMENT_PAYE'} onClick={() => setFilterSolde('PARTIELLEMENT_PAYE')}/>
                <KPICard title="Ce mois-ci"         value={fmt(stats.montantMois)}    icon={Calendar}    color={PURPLE}  bg="#f3e8ff" active={false}                              onClick={() => {}}/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par client ou référence..."
                               value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterMode !== 'ALL' || filterType !== 'ALL' || filterSolde !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/> Filtres
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || filterMode !== 'ALL' || filterType !== 'ALL' || filterSolde !== 'ALL' || dateDebut || dateFin) && (
                        <button onClick={() => { setSearch(''); setFilterMode('ALL'); setFilterType('ALL'); setFilterSolde('ALL'); setDateDebut(''); setDateFin(''); setCurrentPage(1) }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mode de paiement</label>
                            <select value={filterMode} onChange={e => { setFilterMode(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous les modes</option>
                                {Object.entries(MODE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
                            <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous types</option>
                                <option value="CHAMBRE">Chambre</option>
                                <option value="SERVICE">Service</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">État du solde</label>
                            <select value={filterSolde} onChange={e => { setFilterSolde(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous</option>
                                <option value="PAYE">Payé</option>
                                <option value="PARTIELLEMENT_PAYE">Partiel</option>
                                <option value="NON_PAYE">Non payé</option>
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
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Historique des transactions</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} résultats
                    </p>
                </div>

                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des paiements...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <CreditCard size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucun paiement trouvé</p>
                        <p className="text-gray-400 text-sm">Les paiements encaissés apparaîtront ici automatiquement</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Référence', 'Client', 'Type', 'Montant', 'Mode', 'Reste à payer', 'État solde', 'Facture', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginated.map(p => {
                                const modeCfg = MODE_CONFIG[p.modePaiement] || { label: p.modePaiement, cls: 'bg-gray-100 text-gray-600', icon: CreditCard }
                                const soldeCfg = p.soldeStatut ? (SOLDE_CONFIG[p.soldeStatut] || { label: p.soldeStatut, cls: 'bg-gray-100 text-gray-600' }) : null
                                const ModeIcon = modeCfg.icon
                                const isService = p.reservationServiceId != null
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/80 transition group">
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-black font-mono text-gray-900">{p.reference || `#${p.id}`}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-gray-900">{p.clientNom || '—'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                                isService ? 'bg-purple-50 text-purple-700' : 'bg-cyan-50 text-cyan-700'
                                            }`}>
                                                {isService ? <Sparkles size={11}/> : <Bed size={11}/>}
                                                {isService ? 'Service' : 'Chambre'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-black text-emerald-600">{fmt(p.montant)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${modeCfg.cls}`}>
                                                <ModeIcon size={12}/> {modeCfg.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {p.resteAPayer != null ? (
                                                <span className={`text-sm font-bold ${p.resteAPayer > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                    {p.resteAPayer > 0 ? fmt(p.resteAPayer) : '✓ Soldé'}
                                                </span>
                                            ) : <span className="text-xs text-gray-300">—</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            {soldeCfg ? (
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${soldeCfg.cls}`}>{soldeCfg.label}</span>
                                            ) : <span className="text-xs text-gray-300">—</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            {p.facture ? (
                                                <button onClick={() => setViewingFacture(p)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition">
                                                    <Eye size={12}/> {p.facture.numeroFacture}
                                                </button>
                                            ) : <span className="text-xs text-gray-300">—</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-700">{fmtDate(p.createdAt)}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {p.status === 'VALIDE' && (
                                                <button onClick={() => setRembourserTarget(p)}
                                                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition" title="Rembourser">
                                                    <RotateCcw size={14}/>
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

            <RembourserModal isOpen={!!rembourserTarget} paiement={rembourserTarget} onConfirm={handleRembourser} onClose={() => setRembourserTarget(null)}/>
            <FactureViewModal
                facture={viewingFacture?.facture || null}
                reservation={reservations.find(r => r.id === viewingFacture?.reservationId) || null}
                onClose={() => setViewingFacture(null)}
            />
        </div>
    )
}
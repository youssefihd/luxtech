import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Users, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronLeft, ChevronRight, ChevronDown, Eye, Mail, Phone,
    TrendingUp, UserPlus, Repeat, DollarSign, Calendar, Download,
    FileSpreadsheet, FileText, Globe, CreditCard, MapPin, Bed,
    Clock, StickyNote, Ban, Building2, Briefcase, Home, Zap, RefreshCw as ChannelIcon
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const RESA_STATUS_CONFIG = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
    CONFIRMEE:  { label: 'Confirmée', cls: 'bg-cyan-50 text-cyan-700' },
    CHECKIN:    { label: 'Check-in', cls: 'bg-emerald-50 text-emerald-700' },
    CHECKOUT:   { label: 'Check-out', cls: 'bg-gray-100 text-gray-600' },
    ANNULEE:    { label: 'Annulée', cls: 'bg-red-50 text-red-600' },
    NO_SHOW:    { label: 'No-show', cls: 'bg-purple-50 text-purple-700' },
}

const PAYMENT_STATUS_CONFIG = {
    NON_PAYE:             { label: 'Non payé', cls: 'bg-red-50 text-red-600' },
    PARTIELLEMENT_PAYE:   { label: 'Partiel', cls: 'bg-amber-50 text-amber-600' },
    PAYE:                 { label: 'Payé', cls: 'bg-emerald-50 text-emerald-600' },
    ANNULE:                { label: 'Annulé', cls: 'bg-gray-100 text-gray-500' },
}

const SOURCE_CONFIG = {
    DIRECT:          { label: 'Direct', icon: Building2 },
    AGENCE:          { label: 'Agence', icon: Briefcase },
    BOOKING_ENGINE:  { label: 'Booking.com', icon: Globe },
    PMS:             { label: 'PMS', icon: Home },
    CHANNEL_MANAGER: { label: 'Channel Mgr', icon: ChannelIcon },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'

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

// ── Modal détail client — enrichi au maximum ──────────────
const ClientDetailModal = ({ isOpen, client, onClose }) => {
    if (!isOpen || !client) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 max-h-[88vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0"
                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                {(client.nom || 'C')[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Fiche client</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                        client.niveau === 'Fidèle' ? 'bg-amber-400 text-amber-900' :
                                            client.niveau === 'Régulier' ? 'bg-purple-400/80 text-white' : 'bg-emerald-400/80 text-white'
                                    }`}>{client.niveau}</span>
                                </div>
                                <h2 className="text-xl font-black text-white">{client.nom} {client.prenom || ''}</h2>
                                <p className="text-white/50 text-xs mt-0.5">Client depuis {fmtDate(client.premiereReservation)} · {client.ancienneteMois} mois</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition shrink-0">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Coordonnées */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Coordonnées</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Mail size={11}/> Email</p>
                                <p className="text-sm font-semibold text-gray-800 truncate mt-1">{client.email || '—'}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Phone size={11}/> Téléphone</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">{client.telephone || '—'}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Globe size={11}/> Nationalité</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">{client.nationalite || '—'}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><CreditCard size={11}/> CIN / Passeport</p>
                                <p className="text-sm font-semibold text-gray-800 mt-1">{client.cinPasseport || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Statistiques</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            <div className="p-3 rounded-2xl text-center" style={{ background: `${CYAN}10`, border: `1.5px solid ${CYAN}30` }}>
                                <p className="text-lg font-black" style={{ color: NAVY }}>{client.nbReservations}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Séjours</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-emerald-50 border border-emerald-100">
                                <p className="text-base font-black text-emerald-600">{fmt(client.totalDepense)}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Total dépensé</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-orange-50 border border-orange-100">
                                <p className="text-base font-black text-orange-600">{fmt(client.resteAPayer)}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Reste à payer</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-blue-50 border border-blue-100">
                                <p className="text-base font-black text-blue-600">{fmt(client.panierMoyen)}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Panier moyen</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-gray-50 border border-gray-100">
                                <p className="text-base font-black text-gray-700">{client.nbNuitsTotal}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Nuits totales</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-gray-50 border border-gray-100">
                                <p className="text-base font-black text-gray-700">{client.sejourMoyen}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Nuits/séjour</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-purple-50 border border-purple-100">
                                <p className="text-sm font-black text-purple-700 truncate">{client.chambreTypePreferee || '—'}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Type préféré</p>
                            </div>
                            <div className="p-3 rounded-2xl text-center bg-red-50 border border-red-100">
                                <p className="text-base font-black text-red-500">{client.nbAnnulations}</p>
                                <p className="text-[9px] text-gray-500 font-semibold">Annulations</p>
                            </div>
                        </div>
                    </div>

                    {/* Sources de réservation */}
                    {client.sources.length > 0 && (
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Canaux utilisés</p>
                            <div className="flex flex-wrap gap-2">
                                {client.sources.map(s => {
                                    const cfg = SOURCE_CONFIG[s] || { label: s, icon: Globe }
                                    const Icon = cfg.icon
                                    return (
                                        <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                            <Icon size={12}/> {cfg.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Notes / demandes spéciales historiques */}
                    {client.notesHistorique.length > 0 && (
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5"><StickyNote size={12}/> Notes & demandes spéciales</p>
                            <div className="space-y-1.5">
                                {client.notesHistorique.map((n, i) => (
                                    <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
                                        <span className="font-bold">{fmtDateShort(n.date)} :</span> {n.texte}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Historique complet des réservations */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Historique complet ({client.toutesReservations.length})</p>
                        <div className="space-y-2">
                            {client.toutesReservations.map(r => {
                                const st = RESA_STATUS_CONFIG[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-600' }
                                const pay = PAYMENT_STATUS_CONFIG[r.paymentStatus] || { label: r.paymentStatus, cls: 'bg-gray-100 text-gray-600' }
                                const src = SOURCE_CONFIG[r.source]
                                return (
                                    <div key={r.id} className="p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-xs font-bold font-mono text-gray-700">{r.numeroReservation}</p>
                                            <p className="text-sm font-black text-gray-900">{fmt(r.prixTotal)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                                            <span className="flex items-center gap-1"><Calendar size={10}/> {fmtDateShort(r.dateArrivee)} → {fmtDateShort(r.dateDepart)}</span>
                                            {r.chambreNumero && <span className="flex items-center gap-1"><Bed size={10}/> Ch. {r.chambreNumero}</span>}
                                            {r.nbAdultes != null && <span className="flex items-center gap-1"><Users size={10}/> {r.nbAdultes}A{r.nbEnfants ? `+${r.nbEnfants}E` : ''}</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${st.cls}`}>{st.label}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${pay.cls}`}>{pay.label}</span>
                                            {src && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-500">{src.label}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
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

export default function HebergementClients() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [reservations, setReservations] = useState([])
    const [chambres, setChambres] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterStatut, setFilterStatut] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    const [detailTarget, setDetailTarget] = useState(null)

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const hebergRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(() => null)
            const h = hebergRes?.data?.data
            setHebergement(h)
            if (h?.id) {
                const [resaRes, chambresRes] = await Promise.all([
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(() => null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambres`).catch(() => null),
                ])
                setReservations(resaRes?.data?.data || [])
                setChambres(chambresRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    // ── Agrégation enrichie des réservations en "clients" ──
    const clients = useMemo(() => {
        const map = {}
        reservations.forEach(r => {
            const key = (r.clientEmail || `${r.clientNom}-${r.clientTelephone}`).toLowerCase()
            const chambre = chambres.find(c => c.id === r.chambreId)
            const enrichedR = { ...r, chambreNumero: chambre?.numero || null, chambreTypeNom: chambre?.chambreTypeNom || null }

            if (!map[key]) {
                map[key] = {
                    key, nom: r.clientNom, prenom: r.clientPrenom, email: r.clientEmail, telephone: r.clientTelephone,
                    nationalite: null, cinPasseport: null,
                    toutesReservations: [], sources: new Set(), notesHistorique: [], chambreTypeCounts: {},
                    premiereReservation: r.createdAt, derniereVisite: r.dateArrivee,
                }
            }
            const c = map[key]
            c.toutesReservations.push(enrichedR)
            if (r.clientNationalite) c.nationalite = r.clientNationalite
            if (r.clientCinPasseport) c.cinPasseport = r.clientCinPasseport
            if (r.source) c.sources.add(r.source)
            if (r.notes) c.notesHistorique.push({ date: r.createdAt, texte: r.notes })
            if (r.demandesSpeciales) c.notesHistorique.push({ date: r.createdAt, texte: r.demandesSpeciales })
            if (enrichedR.chambreTypeNom) c.chambreTypeCounts[enrichedR.chambreTypeNom] = (c.chambreTypeCounts[enrichedR.chambreTypeNom] || 0) + 1
            if (new Date(r.createdAt) < new Date(c.premiereReservation)) c.premiereReservation = r.createdAt
            if (new Date(r.dateArrivee) > new Date(c.derniereVisite)) c.derniereVisite = r.dateArrivee
        })

        return Object.values(map).map(c => {
            const actives = c.toutesReservations.filter(r => r.status !== 'ANNULEE')
            const annulees = c.toutesReservations.filter(r => r.status === 'ANNULEE')
            const totalDepense = actives.reduce((s, r) => s + Number(r.prixTotal || 0), 0)
            const totalPaye = actives.reduce((s, r) => s + Number(r.montantPaye || 0), 0)
            const nbNuitsTotal = actives.reduce((s, r) => s + Number(r.nbNuits || 0), 0)
            const chambreTypePreferee = Object.entries(c.chambreTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
            const ancienneteMois = Math.max(0, Math.round((new Date() - new Date(c.premiereReservation)) / (1000 * 60 * 60 * 24 * 30)))
            const niveau = actives.length >= 4 ? 'Fidèle' : actives.length >= 2 ? 'Régulier' : 'Nouveau'

            return {
                ...c,
                sources: Array.from(c.sources),
                toutesReservations: c.toutesReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                nbReservations: actives.length,
                nbAnnulations: annulees.length,
                totalDepense,
                totalPaye,
                resteAPayer: Math.max(0, totalDepense - totalPaye),
                panierMoyen: actives.length > 0 ? totalDepense / actives.length : 0,
                nbNuitsTotal,
                sejourMoyen: actives.length > 0 ? Math.round(nbNuitsTotal / actives.length) : 0,
                chambreTypePreferee,
                ancienneteMois,
                niveau,
            }
        }).filter(c => c.nbReservations > 0 || c.nbAnnulations > 0)
            .sort((a, b) => new Date(b.derniereVisite) - new Date(a.derniereVisite))
    }, [reservations, chambres])

    const stats = useMemo(() => {
        const now = new Date()
        const nouveauxCeMois = clients.filter(c => {
            const d = new Date(c.premiereReservation)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length
        const recurrents = clients.filter(c => c.nbReservations > 1).length
        const totalRevenue = clients.reduce((s, c) => s + c.totalDepense, 0)
        return { total: clients.length, nouveauxCeMois, recurrents, totalRevenue }
    }, [clients])

    const filtered = useMemo(() => {
        return clients.filter(c => {
            const q = search.toLowerCase()
            const matchSearch = !search ||
                (c.nom || '').toLowerCase().includes(q) ||
                (c.prenom || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q) ||
                (c.telephone || '').includes(q)
            const matchStatut = filterStatut === 'ALL' ||
                (filterStatut === 'NOUVEAU' && c.nbReservations === 1) ||
                (filterStatut === 'RECURRENT' && c.nbReservations > 1)
            return matchSearch && matchStatut
        })
    }, [clients, search, filterStatut])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleExportExcel = () => {
        const rows = filtered.map(c => ({
            'Nom': c.nom, 'Prénom': c.prenom || '', 'Email': c.email || '', 'Téléphone': c.telephone || '',
            'Nationalité': c.nationalite || '', 'CIN/Passeport': c.cinPasseport || '',
            'Réservations': c.nbReservations, 'Annulations': c.nbAnnulations,
            'Total dépensé (MAD)': c.totalDepense, 'Reste à payer (MAD)': c.resteAPayer,
            'Nuits totales': c.nbNuitsTotal, 'Type préféré': c.chambreTypePreferee || '',
            'Dernière visite': fmtDate(c.derniereVisite), 'Niveau': c.niveau,
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        ws['!cols'] = Array(14).fill({ wch: 16 })
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Clients')
        const dateStr = new Date().toISOString().slice(0, 10)
        XLSX.writeFile(wb, `clients_${hebergement?.nom?.replace(/\s+/g, '_') || 'hotel'}_${dateStr}.xlsx`)
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
        doc.text(`${filtered.length} client${filtered.length > 1 ? 's' : ''}`, pageWidth - margin, 18, { align: 'right' })

        const body = filtered.map(c => [
            `${c.nom} ${c.prenom || ''}`.trim(),
            c.email || '—',
            c.telephone || '—',
            String(c.nbReservations),
            fmt(c.totalDepense),
            `${c.nbNuitsTotal} nuits`,
            fmtDate(c.derniereVisite),
            c.niveau,
        ])

        autoTable(doc, {
            startY: 38,
            head: [['Client', 'Email', 'Téléphone', 'Résa.', 'Total dépensé', 'Nuits', 'Dernière visite', 'Niveau']],
            body,
            theme: 'plain',
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [29, 34, 82], textColor: 255, fontStyle: 'bold', fontSize: 9.5, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
            bodyStyles: { fontSize: 9, cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 }, textColor: [55, 65, 81], lineColor: [235, 237, 242], lineWidth: 0.15 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [29, 34, 82] },
                4: { fontStyle: 'bold', textColor: [5, 150, 105] },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 7) {
                    const colors = { 'Fidèle': [217, 119, 6], 'Régulier': [93, 46, 139], 'Nouveau': [5, 150, 105] }
                    data.cell.styles.textColor = colors[data.cell.raw] || [55, 65, 81]
                    data.cell.styles.fontStyle = 'bold'
                }
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
        doc.save(`clients_${hebergement?.nom?.replace(/\s+/g, '_') || 'hotel'}_${dateStr}.pdf`)
    }

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            <div className="rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des clients</p>
                        <h1 className="text-2xl font-black text-white">Clients</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} client{filtered.length > 1 ? 's' : ''}
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
                <KPICard title="Total clients"    value={stats.total}          icon={Users}      color="#2563eb" bg="#dbeafe" active={filterStatut === 'ALL'}       onClick={() => { setFilterStatut('ALL'); setCurrentPage(1) }}/>
                <KPICard title="Nouveaux ce mois" value={stats.nouveauxCeMois} icon={UserPlus}   color="#059669" bg="#d1fae5" active={filterStatut === 'NOUVEAU'}   onClick={() => { setFilterStatut('NOUVEAU'); setCurrentPage(1) }}/>
                <KPICard title="Récurrents"       value={stats.recurrents}     icon={Repeat}     color={PURPLE}  bg="#f3e8ff" active={filterStatut === 'RECURRENT'} onClick={() => { setFilterStatut('RECURRENT'); setCurrentPage(1) }}/>
                <KPICard title="Revenu total"     value={fmt(stats.totalRevenue)} icon={DollarSign} color="#d97706" bg="#fef3c7" active={false} onClick={() => {}}/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par nom, email, téléphone..."
                               value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
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
                        <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setCurrentPage(1) }} className={inputCls}>
                            <option value="ALL">Tous les clients</option>
                            <option value="NOUVEAU">Nouveaux (1 réservation)</option>
                            <option value="RECURRENT">Récurrents (2+ réservations)</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Liste des clients</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} résultats
                    </p>
                </div>

                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des clients...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <Users size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucun client trouvé</p>
                        <p className="text-gray-400 text-sm">Les clients apparaissent ici dès leur première réservation</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Client', 'Contact', 'Réservations', 'Total dépensé', 'Dernière visite', 'Niveau', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginated.map(c => (
                                <tr key={c.key} className="hover:bg-gray-50/80 transition group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                {(c.nom || 'C')[0].toUpperCase()}
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{c.nom} {c.prenom || ''}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-xs text-gray-600 truncate max-w-[180px]">{c.email || '—'}</p>
                                        <p className="text-xs text-gray-400">{c.telephone || '—'}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-bold text-gray-900">{c.nbReservations}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-black text-emerald-600">{fmt(c.totalDepense)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm text-gray-700">{fmtDate(c.derniereVisite)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                                            c.niveau === 'Fidèle' ? 'bg-amber-100 text-amber-700' :
                                                c.niveau === 'Régulier' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {c.niveau}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => setDetailTarget(c)}
                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Voir le détail">
                                            <Eye size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
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

            <ClientDetailModal isOpen={!!detailTarget} client={detailTarget} onClose={() => setDetailTarget(null)}/>
        </div>
    )
}
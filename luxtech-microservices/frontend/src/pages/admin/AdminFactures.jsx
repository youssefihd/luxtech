import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    FileText, Search, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
    ChevronDown, TrendingUp, Building2, Filter, X, Download, FileSpreadsheet, Eye
} from 'lucide-react'
import * as XLSX from 'xlsx'
import axios, { bookingAxios } from '../../api/axios'

const NAVY = '#1D2252', CYAN = '#66CAD8', PURPLE = '#5D2E8B'

const STATUS_CONFIG = {
    IMPAYEE: { label: 'Impayée', cls: 'bg-red-50 text-red-600' },
    PARTIELLEMENT_PAYEE: { label: 'Partielle', cls: 'bg-orange-50 text-orange-700' },
    PAYEE: { label: 'Payée', cls: 'bg-emerald-50 text-emerald-700' },
    ANNULEE: { label: 'Annulée', cls: 'bg-gray-100 text-gray-500' },
}
const TYPE_CONFIG = {
    HOTEL: { label: 'Hôtel', cls: 'bg-cyan-50 text-cyan-700' },
    AGENCE: { label: 'Agence', cls: 'bg-purple-50 text-purple-700' },
    SAAS: { label: 'SaaS', cls: 'bg-indigo-50 text-indigo-700' },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const KPICard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="relative rounded-2xl p-5 border-2 border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: color }}/>
        <div className="relative p-2.5 rounded-xl w-fit mb-3" style={{ background: bg }}>
            <Icon className="h-5 w-5" style={{ color }}/>
        </div>
        <p className="relative text-3xl font-black text-gray-900 mb-0.5">{value ?? 0}</p>
        <p className="relative text-sm text-gray-500 font-medium">{title}</p>
    </div>
)

const ExportMenu = ({ onExportExcel, disabled }) => {
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
                <Download size={16}/> Exporter <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button onClick={() => { onExportExcel(); setOpen(false) }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <FileSpreadsheet size={15} className="text-emerald-600"/> Excel (.xlsx)
                    </button>
                </div>
            )}
        </div>
    )
}

export default function AdminFactures() {
    const [factures, setFactures] = useState([])
    const [hebergements, setHebergements] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterType, setFilterType] = useState('ALL')
    const [filterHotel, setFilterHotel] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 15

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const [factRes, usersRes] = await Promise.all([
                bookingAxios.get('/booking/factures/all').catch(() => null),
                axios.get('/auth/admin/users').catch(() => null),
            ])
            setFactures(factRes?.data?.data || [])
            const hebergementUsers = (usersRes?.data?.data || []).filter(u => u.role === 'HEBERGEMENT_ADMIN' || user?.role === 'CLIENT' && u.hotelId)
            setHebergements(hebergementUsers)
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const hotelMap = useMemo(() => Object.fromEntries(hebergements.map(h => [h.hotelId, h.nomEtablissement])), [hebergements])

    const enriched = useMemo(() => factures.map(f => ({ ...f, hotelNom: hotelMap[f.hotelId] || null })), [factures, hotelMap])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return enriched.filter(f => {
            const matchSearch = !search || (f.numeroFacture || '').toLowerCase().includes(q) || (f.hotelNom || '').toLowerCase().includes(q)
            const matchStatus = filterStatus === 'ALL' || f.statut === filterStatus
            const matchType = filterType === 'ALL' || f.typeFacture === filterType
            const matchHotel = filterHotel === 'ALL' || String(f.hotelId) === filterHotel
            return matchSearch && matchStatus && matchType && matchHotel
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [enriched, search, filterStatus, filterType, filterHotel])

    const stats = useMemo(() => ({
        total: factures.length,
        payees: factures.filter(f => f.statut === 'PAYEE').length,
        montantTotal: factures.reduce((s, f) => s + Number(f.montantTotal || 0), 0),
        montantImpaye: factures.filter(f => f.statut === 'IMPAYEE' || f.statut === 'PARTIELLEMENT_PAYEE').reduce((s, f) => s + Number(f.montantTotal || 0), 0),
    }), [factures])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleExportExcel = () => {
        const rows = filtered.map(f => ({
            'N° Facture': f.numeroFacture, 'Établissement': f.hotelNom || f.hotelId, 'Type': TYPE_CONFIG[f.typeFacture]?.label || f.typeFacture,
            'Montant HT': f.montantHt, 'TVA': f.montantTva, 'Total': f.montantTotal, 'Commission': f.montantCommission,
            'Statut': STATUS_CONFIG[f.statut]?.label || f.statut, 'Date': fmtDate(f.dateFacture), 'Échéance': fmtDate(f.dateEcheance),
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        ws['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Factures')
        XLSX.writeFile(wb, `factures_luxtech_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }

    const inputCls = "px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-white transition"

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            <div className="rounded-2xl shadow-md p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Réservations et Paiements</p>
                        <h1 className="text-2xl font-black text-white">Factures</h1>
                        <p className="text-white/60 text-sm mt-1">{filtered.length} facture{filtered.length > 1 ? 's' : ''} · tous établissements</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> Actualiser
                        </button>
                        <ExportMenu onExportExcel={handleExportExcel} disabled={filtered.length === 0}/>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total factures" value={stats.total} icon={FileText} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Payées" value={stats.payees} icon={TrendingUp} color="#059669" bg="#d1fae5"/>
                <KPICard title="Montant total" value={fmt(stats.montantTotal)} icon={TrendingUp} color={PURPLE} bg="#f3e8ff"/>
                <KPICard title="Impayé/Partiel" value={fmt(stats.montantImpaye)} icon={AlertTriangle} color="#d97706" bg="#fef3c7"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="N° facture, établissement..." value={search}
                               onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterStatus !== 'ALL' || filterType !== 'ALL' || filterHotel !== 'ALL' ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5' : 'border-gray-200 text-gray-600'
                            }`}>
                        <Filter size={15}/> Filtres <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || filterStatus !== 'ALL' || filterType !== 'ALL' || filterHotel !== 'ALL') && (
                        <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFilterType('ALL'); setFilterHotel('ALL'); setCurrentPage(1) }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Statut</label>
                            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous</option>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
                            <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous</option>
                                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Établissement</label>
                            <select value={filterHotel} onChange={e => { setFilterHotel(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous</option>
                                {hebergements.map(h => <option key={h.hotelId} value={h.hotelId}>{h.nomEtablissement}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center"><RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/><p className="text-gray-400 font-medium">Chargement...</p></div>
                ) : paginated.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}><FileText size={32} style={{ color: CYAN }}/></div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune facture trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['N° Facture', 'Établissement', 'Type', 'Montant', 'Statut', 'Date', 'Échéance'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginated.map(f => {
                                const statusCfg = STATUS_CONFIG[f.statut] || { label: f.statut, cls: 'bg-gray-100 text-gray-600' }
                                const typeCfg = TYPE_CONFIG[f.typeFacture] || { label: f.typeFacture, cls: 'bg-gray-100 text-gray-600' }
                                return (
                                    <tr key={f.id} className="hover:bg-gray-50/80 transition">
                                        <td className="px-5 py-4"><span className="text-sm font-black font-mono text-gray-900">{f.numeroFacture}</span></td>
                                        <td className="px-5 py-4"><span className="flex items-center gap-1.5 text-sm text-gray-700"><Building2 size={12} className="text-gray-400"/> {f.hotelNom || `#${f.hotelId}`}</span></td>
                                        <td className="px-5 py-4"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${typeCfg.cls}`}>{typeCfg.label}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm font-black text-gray-900">{fmt(f.montantTotal)}</span></td>
                                        <td className="px-5 py-4"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.cls}`}>{statusCfg.label}</span></td>
                                        <td className="px-5 py-4"><p className="text-sm text-gray-700">{fmtDate(f.dateFacture)}</p></td>
                                        <td className="px-5 py-4"><p className="text-sm text-gray-500">{fmtDate(f.dateEcheance)}</p></td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500 font-medium">Page <span className="font-black text-gray-900">{currentPage}</span> sur {totalPages}</p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8] transition disabled:opacity-30"><ChevronLeft size={15}/></button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                                return (
                                    <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-xl text-sm font-black transition ${currentPage === page ? 'text-white shadow-sm' : 'border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8]'}`}
                                            style={currentPage === page ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>{page}</button>
                                )
                            })}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#66CAD8] transition disabled:opacity-30"><ChevronRight size={15}/></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
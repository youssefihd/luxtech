import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
    Bed, Plus, Search, Filter, X, Check, RefreshCw, AlertTriangle,
    ChevronLeft, ChevronRight, ChevronDown, Edit3, Trash2,
    Users, DollarSign, Ruler, MapPin, TrendingUp, Image as ImageIcon, Timer, Sparkles,
    Upload, Download, FileText, FileSpreadsheet
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { hebergementAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const STATUT_CONFIG = {
    DISPONIBLE:     { label: 'Disponible',   cls: 'bg-emerald-100 text-emerald-700', dot: '#059669' },
    RESERVEE:       { label: 'Réservée',     cls: 'bg-blue-100 text-blue-700',       dot: '#2563eb' },
    OCCUPEE:        { label: 'Occupée',      cls: 'bg-orange-100 text-orange-700',   dot: '#ea580c' },
    EN_NETTOYAGE:   { label: 'Nettoyage',    cls: 'bg-cyan-100 text-cyan-700',       dot: '#0891b2' },
    EN_MAINTENANCE: { label: 'Maintenance',  cls: 'bg-amber-100 text-amber-700',     dot: '#d97706' },
    HORS_SERVICE:   { label: 'Hors service', cls: 'bg-red-100 text-red-600',         dot: '#dc2626' },
}

const EQUIPEMENTS_PREDEFINIS = [
    'WiFi gratuit', 'Climatisation', 'Chauffage', 'Télévision écran plat',
    'Minibar', 'Coffre-fort', 'Bureau', 'Balcon', 'Terrasse',
    'Vue sur mer', 'Vue sur jardin', 'Baignoire', 'Douche',
    'Sèche-cheveux', 'Peignoir', 'Machine à café', 'Réfrigérateur',
]

const TEMP_STATUSES = ['EN_MAINTENANCE', 'EN_NETTOYAGE']
const STATUTS_VALIDES = Object.keys(STATUT_CONFIG)

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)

// ── Parseur CSV minimal — gère les champs entre guillemets ──
const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
    if (lines.length === 0) return { headers: [], rows: [] }
    const parseLine = (line) => {
        const result = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') { inQuotes = !inQuotes }
            else if (char === ',' && !inQuotes) { result.push(current.trim()); current = '' }
            else { current += char }
        }
        result.push(current.trim())
        return result
    }
    const headers = parseLine(lines[0]).map(h => h.toLowerCase())
    const rows = lines.slice(1).map(line => {
        const values = parseLine(line)
        const obj = {}
        headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
        return obj
    })
    return { headers, rows }
}

const CSV_TEMPLATE = `numero,etage,type,capacite,prixNuitee,superficie,equipements,statut,notes
101,1,Double,2,500,25,"WiFi gratuit; Climatisation",DISPONIBLE,
102,1,Simple,1,300,18,"WiFi gratuit",DISPONIBLE,`

const StatutBadge = ({ statut }) => {
    const c = STATUT_CONFIG[statut] || { label: statut, cls: 'bg-gray-100 text-gray-600', dot: '#6b7280' }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${c.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }}/>
            {c.label}
        </span>
    )
}

// ── Minuteur live — recalcule le temps restant chaque seconde ──
const TimerBadge = ({ statusChangedAt, statusDureeMinutes }) => {
    const [now, setNow] = useState(Date.now())
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    if (!statusChangedAt || !statusDureeMinutes) return null

    const start = new Date(statusChangedAt).getTime()
    const expiry = start + statusDureeMinutes * 60 * 1000
    const remainingMs = expiry - now
    const expired = remainingMs <= 0

    const totalSec = Math.max(0, Math.floor(remainingMs / 1000))
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60

    return (
        <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${expired ? 'text-red-500' : 'text-gray-500'}`}>
            <Timer size={11}/>
            {expired ? 'Terminé — repasse bientôt disponible' : `${min}:${String(sec).padStart(2, '0')} restant`}
        </div>
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

// ── Menu déroulant Export (Excel / PDF) ───────────────────
const ExportMenu = ({ onExportExcel, onExportPdf, disabled }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
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

// ── Modal détail des équipements d'une chambre ────────────
const EquipementsDetailModal = ({ isOpen, chambre, onClose }) => {
    if (!isOpen || !chambre) return null
    const equipList = (chambre.equipements || '').split(',').map(e => e.trim()).filter(Boolean)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
                <div className="p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Équipements</p>
                                <h2 className="text-lg font-black text-white">Chambre {chambre.numero}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {equipList.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">Aucun équipement renseigné.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {equipList.map((e, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                    <Check size={11} style={{ color: CYAN }}/>
                                    {e}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

const DeleteConfirmModal = ({ isOpen, chambre, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(chambre.id) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !chambre) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-7 w-7 text-red-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Supprimer la chambre</h2>
                    <p className="text-sm text-gray-500 mt-1">Chambre <span className="font-bold">{chambre.numero}</span> — cette action est irréversible.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Supprimer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Modal d'import CSV ─────────────────────────────────────
const ImportCsvModal = ({ isOpen, chambreTypes, onImport, onClose }) => {
    const [rawText, setRawText] = useState('')
    const [parsed, setParsed] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (isOpen) { setRawText(''); setParsed(null); setResult(null) }
    }, [isOpen])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setRawText(ev.target.result)
        reader.readAsText(file, 'UTF-8')
    }

    const handleParse = () => {
        if (!rawText.trim()) return
        const { rows } = parseCsv(rawText)
        const validated = rows.map((row, idx) => {
            const errors = []
            if (!row.numero) errors.push('Numéro manquant')
            const type = chambreTypes.find(t => t.nom.toLowerCase() === (row.type || '').toLowerCase().trim())
            if (!type) errors.push(`Type "${row.type}" introuvable`)
            const statut = (row.statut || 'DISPONIBLE').toUpperCase().trim()
            if (statut && !STATUTS_VALIDES.includes(statut)) errors.push(`Statut "${row.statut}" invalide`)
            return { ...row, _index: idx + 2, _type: type, _statut: statut, _errors: errors }
        })
        setParsed(validated)
    }

    const validRows = useMemo(() => parsed ? parsed.filter(r => r._errors.length === 0) : [], [parsed])
    const invalidRows = useMemo(() => parsed ? parsed.filter(r => r._errors.length > 0) : [], [parsed])

    const handleImport = async () => {
        setProcessing(true)
        let success = 0, failed = 0
        for (const row of validRows) {
            try {
                await onImport({
                    numero: row.numero,
                    etage: row.etage ? Number(row.etage) : null,
                    chambreTypeId: row._type.id,
                    capacite: row.capacite ? Number(row.capacite) : null,
                    prixNuitee: row.prixnuitee ? Number(row.prixnuitee) : null,
                    superficie: row.superficie ? Number(row.superficie) : null,
                    equipements: row.equipements ? row.equipements.split(';').map(e => e.trim()).filter(Boolean).join(', ') : null,
                    statut: row._statut || 'DISPONIBLE',
                    notes: row.notes || null,
                })
                success++
            } catch {
                failed++
            }
        }
        setResult({ success, failed })
        setProcessing(false)
    }

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'modele_chambres.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!isOpen) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Upload size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Import en masse</p>
                                <h2 className="text-lg font-black text-white">Importer des chambres (CSV)</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {!result && (
                        <>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileText size={16} className="text-gray-400"/>
                                    Colonnes attendues : <code className="text-xs bg-white px-1.5 py-0.5 rounded border">numero, etage, type, capacite, prixNuitee, superficie, equipements, statut, notes</code>
                                </div>
                                <button onClick={downloadTemplate}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                    <Download size={13}/> Modèle
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Fichier CSV</label>
                                <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className={ic}/>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Ou collez le contenu CSV directement</label>
                                <textarea rows={6} value={rawText} onChange={e => setRawText(e.target.value)}
                                          placeholder="numero,etage,type,capacite,prixNuitee,superficie,equipements,statut,notes&#10;101,1,Double,2,500,25,..."
                                          className={ic + ' font-mono text-xs'}/>
                            </div>

                            <button onClick={handleParse} disabled={!rawText.trim()}
                                    className="w-full py-3 rounded-2xl border-2 border-[#66CAD8] text-[#1D2252] font-bold text-sm hover:bg-[#66CAD8]/5 transition disabled:opacity-40">
                                Analyser le fichier
                            </button>

                            {parsed && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{validRows.length} valide{validRows.length > 1 ? 's' : ''}</span>
                                        {invalidRows.length > 0 && (
                                            <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">{invalidRows.length} en erreur</span>
                                        )}
                                    </div>
                                    <div className="max-h-56 overflow-y-auto space-y-1.5">
                                        {parsed.map(row => (
                                            <div key={row._index} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                                                row._errors.length > 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
                                            }`}>
                                                <span className="font-semibold text-gray-700">Ligne {row._index} — Chambre {row.numero || '?'}</span>
                                                {row._errors.length > 0 ? (
                                                    <span className="text-red-600 font-medium">{row._errors.join(', ')}</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-medium flex items-center gap-1"><Check size={12}/> OK</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {result && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-emerald-600"/>
                            </div>
                            <p className="font-black text-gray-900 text-lg mb-1">Import terminé</p>
                            <p className="text-sm text-gray-500">
                                <span className="text-emerald-600 font-bold">{result.success} chambre{result.success > 1 ? 's' : ''} créée{result.success > 1 ? 's' : ''}</span>
                                {result.failed > 0 && <> · <span className="text-red-600 font-bold">{result.failed} échec{result.failed > 1 ? 's' : ''}</span></>}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        {result ? 'Fermer' : 'Annuler'}
                    </button>
                    {!result && (
                        <button onClick={handleImport} disabled={processing || !parsed || validRows.length === 0}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Upload size={15}/> Importer {validRows.length} chambre{validRows.length > 1 ? 's' : ''}</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const ChambreModal = ({ isOpen, chambre, chambreTypes, onSubmit, onClose }) => {
    const [form, setForm] = useState({
        numero: '', etage: '', chambreTypeId: '', capacite: '', prixNuitee: '', superficie: '', statut: 'DISPONIBLE', dureeMinutes: '30', notes: ''
    })
    const [selectedEquip, setSelectedEquip] = useState([])
    const [newEquip, setNewEquip] = useState('')
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [existingPhotoUrl, setExistingPhotoUrl] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setPhotoFile(null)
            setPhotoPreview(null)
            setExistingPhotoUrl(chambre?.imageUrl || null)
            setSelectedEquip((chambre?.equipements || '').split(',').map(e => e.trim()).filter(Boolean))
            setNewEquip('')
            if (chambre) {
                setForm({
                    numero: chambre.numero || '',
                    etage: chambre.etage ?? '',
                    chambreTypeId: chambre.chambreTypeId || '',
                    capacite: chambre.capacite ?? '',
                    prixNuitee: chambre.prixNuitee ?? '',
                    superficie: chambre.superficie ?? '',
                    statut: chambre.status || 'DISPONIBLE',
                    dureeMinutes: chambre.statusDureeMinutes ? String(chambre.statusDureeMinutes) : '30',
                    notes: chambre.notes || '',
                })
            } else {
                setForm({ numero: '', etage: '', chambreTypeId: chambreTypes[0]?.id || '', capacite: '', prixNuitee: '', superficie: '', statut: 'DISPONIBLE', dureeMinutes: '30', notes: '' })
            }
        }
    }, [isOpen, chambre, chambreTypes])

    const selectedType = useMemo(() => chambreTypes.find(t => String(t.id) === String(form.chambreTypeId)), [chambreTypes, form.chambreTypeId])
    const isTempStatus = TEMP_STATUSES.includes(form.statut)

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const toggleEquip = (item) => {
        setSelectedEquip(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
    }

    const addCustomEquip = () => {
        const v = newEquip.trim()
        if (!v) return
        if (!selectedEquip.includes(v)) setSelectedEquip(prev => [...prev, v])
        setNewEquip('')
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { setError('Le fichier doit être une image'); return }
        if (file.size > 5 * 1024 * 1024) { setError("L'image ne doit pas dépasser 5MB"); return }
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
        setError('')
    }

    const handleSubmit = async () => {
        if (!form.numero.trim()) { setError('Le numéro de chambre est obligatoire'); return }
        if (!form.chambreTypeId) { setError('Veuillez sélectionner un type de chambre'); return }
        if (isTempStatus && (!form.dureeMinutes || Number(form.dureeMinutes) <= 0)) { setError('Veuillez indiquer une durée valide'); return }
        setProcessing(true)
        try {
            await onSubmit({
                numero: form.numero.trim(),
                etage: form.etage !== '' ? Number(form.etage) : null,
                chambreTypeId: Number(form.chambreTypeId),
                capacite: form.capacite !== '' ? Number(form.capacite) : null,
                prixNuitee: form.prixNuitee !== '' ? Number(form.prixNuitee) : null,
                superficie: form.superficie !== '' ? Number(form.superficie) : null,
                equipements: selectedEquip.length > 0 ? selectedEquip.join(', ') : null,
                statut: form.statut,
                dureeMinutes: isTempStatus ? Number(form.dureeMinutes) : null,
                notes: form.notes || null,
            }, photoFile)
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"
    const displayedPhoto = photoPreview || existingPhotoUrl

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Bed size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                                    {chambre ? 'Modifier' : 'Nouvelle'}
                                </p>
                                <h2 className="text-lg font-black text-white">{chambre ? `Chambre ${chambre.numero}` : 'Ajouter une chambre'}</h2>
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
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Photo</label>
                        {displayedPhoto ? (
                            <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 h-40">
                                <img src={displayedPhoto} alt="Aperçu" className="w-full h-full object-cover"/>
                                <label className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                                    <span className="px-3 py-2 bg-white rounded-xl text-xs font-bold">Changer la photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                                </label>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#66CAD8] hover:bg-gray-50 transition">
                                <ImageIcon size={22} className="text-gray-300"/>
                                <span className="text-xs font-semibold text-gray-400">Ajouter une photo (JPG, PNG — max 5MB)</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Numéro *</label>
                            <input {...F('numero')} placeholder="Ex: 101" className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Étage</label>
                            <input type="number" {...F('etage')} placeholder="Ex: 1" className={ic}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Type de chambre *</label>
                        <select {...F('chambreTypeId')} className={ic}>
                            <option value="">Sélectionner...</option>
                            {chambreTypes.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prixBase ? `— ${t.prixBase} MAD/nuit` : ''}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Capacité</label>
                            <input type="number" min="1" {...F('capacite')} placeholder={selectedType?.capaciteAdultes ? String(selectedType.capaciteAdultes) : '—'} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Prix/nuit</label>
                            <input type="number" min="0" step="0.01" {...F('prixNuitee')} placeholder={selectedType?.prixBase ? String(selectedType.prixBase) : '0'} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Superficie (m²)</label>
                            <input type="number" min="0" step="0.01" {...F('superficie')} placeholder="—" className={ic}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Équipements de la chambre</label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {[...EQUIPEMENTS_PREDEFINIS, ...selectedEquip.filter(e => !EQUIPEMENTS_PREDEFINIS.includes(e))].map(item => {
                                const sel = selectedEquip.includes(item)
                                return (
                                    <button key={item} type="button" onClick={() => toggleEquip(item)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition text-left ${
                                                sel ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                            }`}>
                                        {sel && <Check size={11} style={{ color: CYAN }}/>}
                                        <span className="truncate">{item}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Ajouter un équipement personnalisé..."
                                   value={newEquip} onChange={e => setNewEquip(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomEquip())}
                                   className="flex-1 px-3 py-2 border-2 border-dashed border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-xs transition"/>
                            <button type="button" onClick={addCustomEquip}
                                    className="px-3 py-2 rounded-xl text-white text-xs font-bold transition"
                                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                + Ajouter
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Statut</label>
                        <select {...F('statut')} className={ic}>
                            {Object.entries(STATUT_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                        </select>
                    </div>

                    {isTempStatus && (
                        <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50">
                            <label className="block text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1.5">
                                <Timer size={13}/> Durée prévue (minutes) *
                            </label>
                            <input type="number" min="1" {...F('dureeMinutes')} placeholder="30"
                                   className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 text-sm bg-white font-medium"/>
                            <p className="text-[11px] text-amber-600 mt-1.5">La chambre repassera automatiquement "Disponible" à la fin de ce délai.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Notes</label>
                        <textarea rows={2} {...F('notes')} placeholder="Remarques internes..." className={ic}/>
                    </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> {chambre ? 'Enregistrer' : 'Créer'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementChambres() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [chambreTypes, setChambreTypes] = useState([])
    const [chambres, setChambres] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('ALL')
    const [filterStatut, setFilterStatut] = useState('ALL')
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    const [showAddModal, setShowAddModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [editingChambre, setEditingChambre] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [equipDetailTarget, setEquipDetailTarget] = useState(null)
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
                const [typesRes, chambresRes] = await Promise.all([
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambre-types`).catch(() => null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambres`).catch(() => null),
                ])
                setChambreTypes(typesRes?.data?.data || [])
                setChambres(chambresRes?.data?.data || [])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    // Rafraîchit la liste toutes les 30s pour refléter les repassages automatiques "Disponible"
    useEffect(() => {
        const interval = setInterval(() => fetchData(true), 30000)
        return () => clearInterval(interval)
    }, [fetchData])

    const stats = useMemo(() => ({
        total: chambres.length,
        disponibles: chambres.filter(c => c.status === 'DISPONIBLE').length,
        occupees: chambres.filter(c => c.status === 'OCCUPEE' || c.status === 'RESERVEE').length,
        maintenance: chambres.filter(c => c.status === 'EN_MAINTENANCE' || c.status === 'EN_NETTOYAGE' || c.status === 'HORS_SERVICE').length,
    }), [chambres])

    const filtered = useMemo(() => {
        return chambres.filter(c => {
            const q = search.toLowerCase()
            const matchSearch = !search ||
                (c.numero || '').toLowerCase().includes(q) ||
                (c.chambreTypeNom || '').toLowerCase().includes(q)
            const matchType = filterType === 'ALL' || String(c.chambreTypeId) === String(filterType)
            const matchStatut = filterStatut === 'ALL' || c.status === filterStatut
            return matchSearch && matchType && matchStatut
        })
    }, [chambres, search, filterType, filterStatut])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleCreateOrUpdate = async (data, photoFile) => {
        try {
            let chambreId = editingChambre?.id
            if (editingChambre) {
                await hebergementAxios.put(`/hebergement/chambres/${editingChambre.id}`, data)
            } else {
                const res = await hebergementAxios.post('/hebergement/chambres', { ...data, hotelId: hebergement.id })
                chambreId = res?.data?.data?.id
            }
            if (photoFile && chambreId) {
                const formData = new FormData()
                formData.append('photo', photoFile)
                await hebergementAxios.post(`/hebergement/chambres/${chambreId}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }
            showToast(editingChambre ? 'Chambre mise à jour !' : 'Chambre créée !')
            setShowAddModal(false)
            setEditingChambre(null)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleImportRow = async (data) => {
        await hebergementAxios.post('/hebergement/chambres', { ...data, hotelId: hebergement.id })
    }

    const handleImportComplete = async () => {
        await fetchData(true)
    }

    const handleDelete = async (id) => {
        try {
            await hebergementAxios.delete(`/hebergement/chambres/${id}`)
            showToast('Chambre supprimée.')
            setDeleteTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de la suppression.', 'error')
        }
    }

    // ── Export Excel ────────────────────────────────────────
    const handleExportExcel = () => {
        const rows = filtered.map(c => ({
            'Numéro': c.numero,
            'Étage': c.etage ?? '',
            'Type': c.chambreTypeNom || '',
            'Capacité': c.capacite ?? '',
            'Prix/nuit (MAD)': c.prixNuitee ?? c.prixBase ?? '',
            'Superficie (m²)': c.superficie ?? '',
            'Équipements': c.equipements || '',
            'Statut': STATUT_CONFIG[c.status]?.label || c.status,
            'Notes': c.notes || '',
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        ws['!cols'] = [{ wch: 10 }, { wch: 8 }, { wch: 18 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 35 }, { wch: 14 }, { wch: 25 }]
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Chambres')
        const dateStr = new Date().toISOString().slice(0, 10)
        XLSX.writeFile(wb, `chambres_${hebergement?.nom?.replace(/\s+/g, '_') || 'hotel'}_${dateStr}.xlsx`)
        showToast('Export Excel généré !')
    }

// ── Export PDF ──────────────────────────────────────────
    const handleExportPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 14

        // ── Bandeau d'en-tête ──
        doc.setFillColor(29, 34, 82) // NAVY
        doc.rect(0, 0, pageWidth, 28, 'F')
        doc.setFillColor(102, 202, 216) // CYAN — liseré d'accent
        doc.rect(0, 28, pageWidth, 1, 'F')

        // Petit wordmark LuxTech (coin haut-gauche)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('LUX', margin, 9)
        const luxW = doc.getTextWidth('LUX')
        doc.setTextColor(102, 202, 216)
        doc.text('TECH', margin + luxW, 9)

        // Nom de l'établissement (grand titre)
        doc.setFontSize(17)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text(hebergement?.nom || 'Établissement', margin, 20)

        // Date + nombre de chambres (aligné à droite)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(210, 218, 235)
        doc.text(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), pageWidth - margin, 10, { align: 'right' })
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(102, 202, 216)
        doc.text(`${filtered.length} chambre${filtered.length > 1 ? 's' : ''}`, pageWidth - margin, 18, { align: 'right' })

        // ── Couleurs de statut (mêmes teintes que l'interface) ──
        const statusColors = {
            DISPONIBLE:     [5, 150, 105],
            RESERVEE:       [37, 99, 235],
            OCCUPEE:        [234, 88, 12],
            EN_NETTOYAGE:   [8, 145, 178],
            EN_MAINTENANCE: [217, 119, 6],
            HORS_SERVICE:   [220, 38, 38],
        }

        const body = filtered.map(c => [
            c.numero,
            c.etage ?? '—',
            c.chambreTypeNom || '—',
            c.capacite ?? '—',
            fmt(c.prixNuitee ?? c.prixBase),
            c.superficie ? `${c.superficie} m²` : '—',
            STATUT_CONFIG[c.status]?.label || c.status,
        ])

        autoTable(doc, {
            startY: 38,
            head: [['Numéro', 'Étage', 'Type', 'Capacité', 'Prix/nuit', 'Superficie', 'Statut']],
            body,
            theme: 'plain',
            margin: { left: margin, right: margin },
            headStyles: {
                fillColor: [29, 34, 82],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9.5,
                cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
                textColor: [55, 65, 81],
                lineColor: [235, 237, 242],
                lineWidth: 0.15,
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [29, 34, 82] },
                4: { fontStyle: 'bold', textColor: [5, 150, 105] },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 6) {
                    const statusKey = Object.keys(STATUT_CONFIG).find(k => STATUT_CONFIG[k].label === data.cell.raw)
                    if (statusKey && statusColors[statusKey]) {
                        data.cell.styles.textColor = statusColors[statusKey]
                        data.cell.styles.fontStyle = 'bold'
                    }
                }
            },
        })

        // ── Pied de page sur toutes les pages ──
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
        doc.save(`chambres_${hebergement?.nom?.replace(/\s+/g, '_') || 'hotel'}_${dateStr}.pdf`)
        showToast('Export PDF généré !')
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
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Gestion des chambres</p>
                        <h1 className="text-2xl font-black text-white">Chambres</h1>
                        <p className="text-white/60 text-sm mt-1">
                            {hebergement?.nom || 'Mon établissement'} · {filtered.length} chambre{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                            Actualiser
                        </button>
                        <ExportMenu onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} disabled={filtered.length === 0}/>
                        <button onClick={() => setShowImportModal(true)}
                                disabled={chambreTypes.length === 0}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-black transition hover:bg-white/10 disabled:opacity-50">
                            <Upload size={16}/> Importer CSV
                        </button>
                        <button onClick={() => { setEditingChambre(null); setShowAddModal(true) }}
                                disabled={chambreTypes.length === 0}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-black transition hover:shadow-lg disabled:opacity-50"
                                style={{ color: NAVY }}>
                            <Plus size={16}/> Nouvelle chambre
                        </button>
                    </div>
                </div>
            </div>

            {chambreTypes.length === 0 && !loading && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0"/>
                    <p className="text-sm text-amber-800 font-medium">
                        Créez d'abord un type de chambre avant d'ajouter des chambres.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total chambres" value={stats.total}       icon={TrendingUp} color="#2563eb" bg="#dbeafe" active={filterStatut === 'ALL'}          onClick={() => { setFilterStatut('ALL'); setCurrentPage(1) }}/>
                <KPICard title="Disponibles"    value={stats.disponibles} icon={Check}      color="#059669" bg="#d1fae5" active={filterStatut === 'DISPONIBLE'}  onClick={() => { setFilterStatut('DISPONIBLE'); setCurrentPage(1) }}/>
                <KPICard title="Occupées"       value={stats.occupees}    icon={Users}      color="#ea580c" bg="#ffedd5" active={filterStatut === 'OCCUPEE'}     onClick={() => { setFilterStatut('OCCUPEE'); setCurrentPage(1) }}/>
                <KPICard title="Maintenance"    value={stats.maintenance} icon={AlertTriangle} color="#d97706" bg="#fef3c7" active={filterStatut === 'EN_MAINTENANCE'} onClick={() => { setFilterStatut('EN_MAINTENANCE'); setCurrentPage(1) }}/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher par numéro ou type..."
                               value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                               className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] transition"/>
                    </div>
                    <button onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                showFilters || filterType !== 'ALL' || filterStatut !== 'ALL'
                                    ? 'border-[#66CAD8] text-[#1D2252] bg-[#66CAD8]/5'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                        <Filter size={15}/>
                        Filtres
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    {(search || filterType !== 'ALL' || filterStatut !== 'ALL') && (
                        <button onClick={() => { setSearch(''); setFilterType('ALL'); setFilterStatut('ALL'); setCurrentPage(1) }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                            <X size={15}/> Réinitialiser
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Type de chambre</label>
                            <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous les types</option>
                                {chambreTypes.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Statut</label>
                            <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setCurrentPage(1) }} className={inputCls + ' w-full'}>
                                <option value="ALL">Tous les statuts</option>
                                {Object.entries(STATUT_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Liste des chambres</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} résultats
                    </p>
                </div>

                {loading ? (
                    <div className="p-16 text-center">
                        <RefreshCw size={32} className="animate-spin mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-400 font-medium">Chargement des chambres...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                             style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                            <Bed size={32} style={{ color: CYAN }}/>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Aucune chambre trouvée</p>
                        <p className="text-gray-400 text-sm">Modifiez vos critères ou ajoutez une nouvelle chambre</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Chambre', 'Type', 'Capacité', 'Prix / nuit', 'Superficie', 'Équipements', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginated.map(c => {
                                const equipList = (c.equipements || '').split(',').map(e => e.trim()).filter(Boolean)
                                const isTemp = TEMP_STATUSES.includes(c.status)
                                return (
                                    <tr key={c.id} className="hover:bg-gray-50/80 transition group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white shrink-0"
                                                     style={c.imageUrl ? {} : { background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                                    {c.imageUrl ? <img src={c.imageUrl} alt={c.numero} className="w-full h-full object-cover"/> : <Bed size={16}/>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{c.numero}</p>
                                                    {c.etage != null && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10}/> Étage {c.etage}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-semibold text-gray-700">{c.chambreTypeNom || '—'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                <Users size={13} className="text-gray-400"/>
                                                {c.capacite ?? '—'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                                                <DollarSign size={13} className="text-emerald-500"/>
                                                {fmt(c.prixNuitee ?? c.prixBase)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                <Ruler size={13} className="text-gray-400"/>
                                                {c.superficie ? `${c.superficie} m²` : '—'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {equipList.length > 0 ? (
                                                <button onClick={() => setEquipDetailTarget(c)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-bold hover:bg-cyan-100 transition">
                                                    <Sparkles size={12}/> {equipList.length}
                                                </button>
                                            ) : <span className="text-xs text-gray-300">—</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatutBadge statut={c.status}/>
                                            {isTemp && <TimerBadge statusChangedAt={c.statusChangedAt} statusDureeMinutes={c.statusDureeMinutes}/>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => { setEditingChambre(c); setShowAddModal(true) }}
                                                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                                        title="Modifier">
                                                    <Edit3 size={14}/>
                                                </button>
                                                <button onClick={() => setDeleteTarget(c)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                                        title="Supprimer">
                                                    <Trash2 size={14}/>
                                                </button>
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

            <ChambreModal
                isOpen={showAddModal}
                chambre={editingChambre}
                chambreTypes={chambreTypes}
                onSubmit={handleCreateOrUpdate}
                onClose={() => { setShowAddModal(false); setEditingChambre(null) }}
            />
            <ImportCsvModal
                isOpen={showImportModal}
                chambreTypes={chambreTypes}
                onImport={handleImportRow}
                onClose={async () => { setShowImportModal(false); await handleImportComplete() }}
            />
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                chambre={deleteTarget}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
            <EquipementsDetailModal
                isOpen={!!equipDetailTarget}
                chambre={equipDetailTarget}
                onClose={() => setEquipDetailTarget(null)}
            />
        </div>
    )
}
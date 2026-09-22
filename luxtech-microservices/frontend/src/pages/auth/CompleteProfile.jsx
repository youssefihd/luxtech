import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    Check, ChevronDown, ChevronUp, BedDouble,
    Camera, Upload, X, Plus, Minus,
    AlertCircle, Clock, CheckCircle, ArrowRight, Info, RefreshCw,
    CreditCard, Building, User, Hash
} from 'lucide-react'
import { hebergementApi } from '../../api/authApi'

// ─── Constantes ───────────────────────────────────────────

const TYPES_CHAMBRE = [
    'Simple', 'Double', 'Lits Jumeaux', 'Triple', 'Quadruple',
    'Suite', 'Suite Junior', 'Familiale', 'Studio', 'Appartement',
    'Chambre Deluxe', 'Chambre Supérieure', 'Penthouse',
]

const TYPES_LITS = [
    { key: 'simple', label: 'Lit simple', dim: '90-130 cm de large' },
    { key: 'double', label: 'Lit double', dim: '131-150 cm de large' },
    { key: 'kingSize', label: 'Lit King-Size', dim: '151-180 cm' },
    { key: 'grandKing', label: 'Grand lit King-Size', dim: '181-210 cm' },
    { key: 'superKing', label: 'Super King', dim: '> 210 cm' },
]

const EQUIP_CHAMBRE = {
    'Principaux équipements': [
        'Télévision écran plat', 'Climatisation', 'Chauffage', 'WiFi gratuit',
        'Bureau', 'Coffre-fort', 'Minibar', 'Téléphone', 'Réveil',
        'Armoire / Penderie', 'Linge de maison', 'Serviettes',
    ],
    'Salle de bains': [
        'Douche', 'Baignoire', 'Toilettes privées', 'Sèche-cheveux',
        'Articles de toilette', 'Peignoir', 'Chaussons', 'Bidet',
    ],
    'Vues & Extérieur': [
        'Vue sur mer', 'Vue sur montagne', 'Vue sur jardin', 'Vue sur piscine',
        'Balcon', 'Terrasse', 'Jardin privé',
    ],
    'Repas & Boissons': [
        'Bouilloire électrique', 'Machine à café', 'Micro-ondes',
        'Réfrigérateur', 'Coin cuisine', 'Table à manger',
    ],
}

const CARTES_ACCEPTEES = [
    { key: 'visa', label: 'Visa' },
    { key: 'mastercard', label: 'Mastercard' },
    { key: 'amex', label: 'American Express' },
    { key: 'maestro', label: 'Maestro' },
    { key: 'unionpay', label: 'UnionPay' },
    { key: 'cash', label: 'Espèces' },
    { key: 'virement', label: 'Virement bancaire' },
    { key: 'cheque', label: 'Chèque' },
]

const DOCS_REQUIS = [
    { key: 'registreCommerce', label: 'Registre de commerce', desc: "Document officiel d'immatriculation de votre entreprise", required: false },
    { key: 'patente', label: 'Patente / Taxe professionnelle', desc: 'Attestation de patente en cours de validité', required: false },
    { key: 'cin', label: 'CIN du gérant', desc: 'Carte d\'identité nationale du responsable légal', required: false },
    { key: 'rib', label: 'RIB bancaire', desc: 'Relevé d\'identité bancaire pour les virements', required: false },
    { key: 'licenceHotel', label: 'Licence hôtelière', desc: 'Autorisation d\'exploitation hôtelière délivrée par le ministère', required: false },
    { key: 'assurance', label: 'Attestation d\'assurance', desc: "Assurance responsabilité civile de l'établissement", required: false },
]

const DOCS_AGENCE = [
    { key: 'registreCommerce', label: 'Registre de commerce', desc: "Document officiel d'immatriculation", required: false },
    { key: 'licenceVoyage', label: 'Licence de voyage', desc: 'Agrément délivré par le ministère du tourisme', required: false },
    { key: 'cin', label: 'CIN du directeur', desc: 'Carte d\'identité nationale du directeur', required: false },
    { key: 'rib', label: 'RIB bancaire', desc: 'Relevé d\'identité bancaire', required: false },
    { key: 'assurance', label: 'Attestation d\'assurance', desc: 'Assurance responsabilité civile professionnelle', required: false },
]

// ─── Champ ajout personnalisé ──────────────────────────────
const AddCustomField = ({ placeholder, onAdd }) => {
    const [val, setVal] = useState('')
    const handleAdd = () => {
        if (!val.trim()) return
        onAdd(val.trim())
        setVal('')
    }
    return (
        <div className="flex gap-2 mt-2">
            <input type="text" placeholder={placeholder}
                   value={val} onChange={e => setVal(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                   className="flex-1 px-3 py-2 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
            <button type="button" onClick={handleAdd}
                    className="px-4 py-2 rounded-xl text-white text-sm font-medium transition"
                    style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                + Ajouter
            </button>
        </div>
    )
}

// ─── Composant Section ─────────────────────────────────────
const Section = ({ number, title, desc, status, children, onToggle, isOpen }) => {
    const icons = {
        done: <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Check size={20} /></div>,
        pending: <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}><span className="font-bold">{number}</span></div>,
        locked: <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-400 shrink-0"><span className="font-bold">{number}</span></div>,
    }
    return (
        <div className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
            status === 'done' ? 'border-green-200' : isOpen ? 'border-[#66CAD8] shadow-lg' : 'border-gray-200'
        }`}>
            <button type="button" onClick={onToggle} disabled={status === 'locked'}
                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50 transition disabled:cursor-not-allowed">
                {icons[status]}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Étape {number}</span>
                        {status === 'done' && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Complété</span>}
                        {status === 'locked' && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={10}/> Disponible après l'étape précédente</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                </div>
                {status !== 'locked' && (
                    isOpen ? <ChevronUp size={20} className="text-gray-400 shrink-0"/> : <ChevronDown size={20} className="text-gray-400 shrink-0"/>
                )}
            </button>
            {isOpen && <div className="border-t border-gray-100 p-6">{children}</div>}
        </div>
    )
}

// ─── Compteur +/- ─────────────────────────────────────────
const Counter = ({ value, onChange, min = 0, max = 99 }) => (
    <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#66CAD8] transition disabled:opacity-40">
            <Minus size={14} />
        </button>
        <span className="w-8 text-center font-bold text-gray-900">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#66CAD8] transition disabled:opacity-40">
            <Plus size={14} />
        </button>
    </div>
)

// ─── Upload Document ───────────────────────────────────────
const DocUpload = ({ doc, file, onChange }) => (
    <div className={`border-2 rounded-xl p-4 transition-all ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-[#66CAD8]'}`}>
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{doc.label}</p>
                    {doc.required ? <span className="text-xs text-red-500 font-medium">*Obligatoire</span> : <span className="text-xs text-gray-400">Optionnel</span>}
                </div>
                <p className="text-xs text-gray-500 mb-3">{doc.desc}</p>
                {file ? (
                    <div className="flex items-center gap-2 text-green-700">
                        <Check size={14} />
                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                        <button type="button" onClick={() => onChange(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                ) : (
                    <label className="cursor-pointer">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => onChange(e.target.files[0])} />
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#66CAD8] hover:text-[#66CAD8] transition w-fit">
                            <Upload size={14} /> Choisir un fichier
                        </div>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 5MB</p>
                    </label>
                )}
            </div>
            {file && <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />}
        </div>
    </div>
)

// ─── PAGE PRINCIPALE ───────────────────────────────────────
export default function CompleteProfile() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const roleFromUrl = searchParams.get('role')
    const prenomFromUrl = searchParams.get('prenom')
    const effectiveRole = roleFromUrl || user?.role
    const effectivePrenom = prenomFromUrl || user?.prenom
    const isHotel = effectiveRole === 'HEBERGEMENT_ADMIN' || effectiveRole === 'HEBERGEMENT_STAFF'

    const photoInputRef = useRef(null)

    const [openSection, setOpenSection] = useState(1)
    const [sectionStatus, setSectionStatus] = useState({ 1:'done', 2:'pending', 3:'locked', 4:'locked', 5:'locked' })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [toast, setToast] = useState(null)

    // Section 2 — Chambres
    const [chambres, setChambres] = useState([])
    const [showAddChambre, setShowAddChambre] = useState(false)
    const [customTypeChambre, setCustomTypeChambre] = useState(false)
    const [customLitsLabels, setCustomLitsLabels] = useState([]) // {key, label, dim}
    const [customEquipBain, setCustomEquipBain] = useState([])
    const [customEquipCats, setCustomEquipCats] = useState({}) // {cat: [items]}

    const [currentChambre, setCurrentChambre] = useState({
        type: '', nbChambres: 1,
        lits: { simple:0, double:1, kingSize:0, grandKing:0, superKing:0 },
        capacite: 2, superficie: '', fumeurs: false,
        salleBainPrivee: true, equipSalleBain: [], equipChambre: [], tarif: '',
    })

    // Section 3 — Photos
    const [photos, setPhotos] = useState([])
    const [photoPreviews, setPhotoPreviews] = useState([])

    // Section 4 — Paiements
    const [paiement, setPaiement] = useState({
        cartesAcceptees: [],
        nomFacturation: 'hotel',
        nomGerant: '', nomHotel: '', nomEntreprise: '',
        memeAdresse: true, adresseFacturation: '',
        identifiantClassement: '', infosImportantes: '',
    })

    // Section 5 — Documents & IBAN
    const [documents, setDocuments] = useState({})
    const [infosFinancieres, setInfosFinancieres] = useState({ iban: '', nomBanque: '', nomTitulaire: '' })

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const toggleEquip = (category, item) => {
        setCurrentChambre(prev => {
            const cur = prev.equipChambre || []
            return { ...prev, equipChambre: cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item] }
        })
    }

    const toggleEquipBain = (item) => {
        setCurrentChambre(prev => {
            const cur = prev.equipSalleBain || []
            return { ...prev, equipSalleBain: cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item] }
        })
    }

    const toggleCarte = (key) => {
        setPaiement(prev => ({
            ...prev,
            cartesAcceptees: prev.cartesAcceptees.includes(key)
                ? prev.cartesAcceptees.filter(k => k !== key)
                : [...prev.cartesAcceptees, key]
        }))
    }

    const addCustomLit = (label) => {
        const key = 'custom_' + Date.now()
        setCustomLitsLabels(prev => [...prev, { key, label, dim: 'Personnalisé' }])
        setCurrentChambre(p => ({ ...p, lits: { ...p.lits, [key]: 0 } }))
    }

    const addCustomEquipBain = (item) => {
        setCustomEquipBain(prev => [...prev, item])
    }

    const addCustomEquipCat = (cat, item) => {
        setCustomEquipCats(prev => ({ ...prev, [cat]: [...(prev[cat] || []), item] }))
    }

    const saveChambre = () => {
        if (!currentChambre.type || !currentChambre.tarif) {
            showToast('Veuillez remplir le type de chambre et le tarif.', 'error')
            return
        }
        setChambres(prev => [...prev, { ...currentChambre, id: Date.now() }])
        setCurrentChambre({ type:'', nbChambres:1, lits:{simple:0,double:1,kingSize:0,grandKing:0,superKing:0}, capacite:2, superficie:'', fumeurs:false, salleBainPrivee:true, equipSalleBain:[], equipChambre:[], tarif:'' })
        setShowAddChambre(false)
        setCustomTypeChambre(false)
        showToast('Chambre ajoutée avec succès !')
    }

    const handlePhotoAdd = (e) => {
        const files = Array.from(e.target.files)
        const newPhotos = [...photos, ...files].slice(0, 20)
        setPhotos(newPhotos)
        setPhotoPreviews(newPhotos.map(f => URL.createObjectURL(f)))
    }

    const removePhoto = (idx) => {
        setPhotos(prev => prev.filter((_, i) => i !== idx))
        setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
    }

    const validateSection = (n) => {
        if (n === 2) {
            if (!isHotel || chambres.length > 0) {
                setSectionStatus(prev => ({ ...prev, 2:'done', 3:'pending' }))
                setOpenSection(3)
                showToast('Chambres enregistrées !')
            } else {
                showToast('Ajoutez au moins une chambre.', 'error')
            }
        } else if (n === 3) {
            if (photos.length >= 5) {
                setSectionStatus(prev => ({ ...prev, 3:'done', 4:'pending' }))
                setOpenSection(4)
                showToast('Photos enregistrées !')
            } else {
                showToast('Ajoutez au moins 5 photos.', 'error')
            }
        } else if (n === 4) {
            if (paiement.cartesAcceptees.length === 0) {
                showToast('Sélectionnez au moins un mode de paiement.', 'error')
                return
            }
            setSectionStatus(prev => ({ ...prev, 4:'done', 5:'pending' }))
            setOpenSection(5)
            showToast('Informations de paiement enregistrées !')
        }
    }

    const handleSubmit = async () => {
        if (!infosFinancieres.iban) {
            showToast('Veuillez saisir votre IBAN.', 'error')
            return
        }
        setLoading(true)
        try {
            const response = await hebergementApi.completeProfile({ chambres, photos, documents, infosFinancieres, paiement })
            if (response.data?.success) {
                setSectionStatus(prev => ({ ...prev, 5: 'done' }))
                setSubmitted(true)
            } else {
                showToast(response.data?.message || "Erreur lors de l'envoi.", 'error')
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de l\'envoi. Réessayez.', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4"
                 style={{ background: 'linear-gradient(135deg, #10182A, #1D2252)' }}>
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-white"
                         style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                        <Check size={44} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Dossier soumis avec succès !</h2>
                    <p className="text-gray-500 text-sm mb-8">
                        Notre équipe va examiner votre dossier sous <strong>24 à 48h</strong>. Vous recevrez un email de confirmation.
                    </p>
                    <button onClick={() => navigate('/login')}
                            className="w-full py-3.5 rounded-xl text-white font-bold hover:shadow-lg transition"
                            style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                        Aller à la connexion
                    </button>
                </div>
            </div>
        )
    }

    const doneCount = Object.values(sectionStatus).filter(s => s === 'done').length

    // Toutes les options de lits (fixes + personnalisées)
    const allLits = [...TYPES_LITS, ...customLitsLabels]
    // Équipements salle de bains (fixes + personnalisés)
    const allEquipBain = [...EQUIP_CHAMBRE['Salle de bains'], ...customEquipBain]

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: '#F8FAFC' }}>

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.type === 'error' ? <AlertCircle size={16}/> : <Check size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="cursor-pointer inline-block mb-4" onClick={() => navigate('/')}>
                        <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-10 mx-auto"
                             onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML=`<div style="font-size:26px;font-weight:900;color:#1D2252">LUX<span style="color:#66CAD8">TECH</span></div>` }} />
                    </div>
                    <div className="bg-white border border-blue-200 rounded-2xl p-4 text-left flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 mb-1">Complétez votre dossier partenaire</p>
                            <p className="text-gray-600 text-sm">Bienvenue <strong>{effectivePrenom}</strong> ! Complétez les 5 étapes ci-dessous pour soumettre votre dossier.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Progression du dossier</span>
                            <span className="text-sm font-bold" style={{ color: '#66CAD8' }}>{doneCount}/5 étapes</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                                 style={{ width: `${(doneCount / 5) * 100}%`, background: 'linear-gradient(90deg, #66CAD8, #5D2E8B)' }} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">

                    {/* ── SECTION 1 ── */}
                    <Section number={1} title="Infos sur l'hébergement"
                             desc="Nom, adresse, équipements généraux — déjà renseignés lors de votre inscription."
                             status={sectionStatus[1]} isOpen={openSection === 1}
                             onToggle={() => setOpenSection(openSection === 1 ? null : 1)}>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-green-800 text-sm">Informations enregistrées</p>
                                <p className="text-green-700 text-xs">Nom, adresse, ville, équipements et services complétés lors de l'inscription.</p>
                            </div>
                        </div>
                    </Section>

                    {/* ── SECTION 2 — Chambres ── */}
                    <Section number={2} title={isHotel ? "Chambres & Logements" : "Configuration agence"}
                             desc={isHotel ? "Ajoutez vos types de chambres, lits, capacité et tarifs." : "Configurez les services de votre agence."}
                             status={sectionStatus[2]} isOpen={openSection === 2}
                             onToggle={() => setOpenSection(openSection === 2 ? null : 2)}>
                        {isHotel ? (
                            <div className="space-y-4">
                                {chambres.length > 0 && (
                                    <div className="space-y-3">
                                        {chambres.map((c) => (
                                            <div key={c.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                                    <BedDouble size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{c.type}</p>
                                                    <p className="text-gray-500 text-xs">{c.nbChambres} chambre(s) · {c.capacite} personnes · {c.tarif} MAD/nuit</p>
                                                </div>
                                                <button type="button" onClick={() => setChambres(prev => prev.filter(x => x.id !== c.id))} className="text-red-400 hover:text-red-600 transition">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showAddChambre ? (
                                    <div className="border-2 border-[#66CAD8] rounded-2xl p-5 space-y-5">
                                        <h4 className="font-bold text-gray-900">Nouvelle chambre</h4>

                                        {/* Type de chambre */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de chambre <span className="text-red-500">*</span></label>
                                            <select
                                                value={customTypeChambre ? '__custom__' : currentChambre.type}
                                                onChange={e => {
                                                    if (e.target.value === '__custom__') {
                                                        setCustomTypeChambre(true)
                                                        setCurrentChambre(p => ({...p, type: ''}))
                                                    } else {
                                                        setCustomTypeChambre(false)
                                                        setCurrentChambre(p => ({...p, type: e.target.value}))
                                                    }
                                                }}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm bg-white appearance-none">
                                                <option value="">Sélectionnez un type</option>
                                                {TYPES_CHAMBRE.map(t => <option key={t} value={t}>{t}</option>)}
                                                <option value="__custom__">✏️ Saisir un type personnalisé...</option>
                                            </select>
                                            {customTypeChambre && (
                                                <input type="text" placeholder="Ex: Suite Royale, Bungalow, Villa..."
                                                       value={currentChambre.type}
                                                       onChange={e => setCurrentChambre(p => ({...p, type: e.target.value}))}
                                                       className="mt-2 w-full px-4 py-3 border-2 border-[#66CAD8] rounded-xl focus:outline-none text-sm transition"
                                                       autoFocus/>
                                            )}
                                        </div>

                                        {/* Nombre de chambres */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Combien de chambres de ce type ?</label>
                                            <Counter value={currentChambre.nbChambres} onChange={v => setCurrentChambre(p => ({...p, nbChambres:v}))} min={1} max={500} />
                                        </div>

                                        {/* Types de lits */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Types de lits disponibles</label>
                                            <div className="space-y-3">
                                                {allLits.map(l => (
                                                    <div key={l.key} className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{l.label}</p>
                                                            <p className="text-gray-400 text-xs">{l.dim}</p>
                                                        </div>
                                                        <Counter value={currentChambre.lits[l.key] || 0} onChange={v => setCurrentChambre(p => ({...p, lits:{...p.lits, [l.key]:v}}))} max={10} />
                                                    </div>
                                                ))}
                                            </div>
                                            <AddCustomField placeholder="Ajouter un type de lit personnalisé..." onAdd={addCustomLit} />
                                        </div>

                                        {/* Capacité */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Capacité maximale (personnes)</label>
                                            <Counter value={currentChambre.capacite} onChange={v => setCurrentChambre(p => ({...p, capacite:v}))} min={1} max={20} />
                                        </div>

                                        {/* Superficie */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (optionnel)</label>
                                            <div className="flex gap-2">
                                                <input type="number" placeholder="Ex: 25" value={currentChambre.superficie} onChange={e => setCurrentChambre(p => ({...p, superficie:e.target.value}))}
                                                       className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm" />
                                                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-600 font-medium">m²</div>
                                            </div>
                                        </div>

                                        {/* Fumeurs */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Autorisation de fumer</label>
                                            <div className="flex gap-3">
                                                {[{v:false, l:'Non-fumeur'}, {v:true, l:'Fumeur'}].map(opt => (
                                                    <button key={String(opt.v)} type="button" onClick={() => setCurrentChambre(p => ({...p, fumeurs:opt.v}))}
                                                            className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition ${currentChambre.fumeurs === opt.v ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-200 text-gray-600'}`}>
                                                        {opt.l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Salle de bains */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Salle de bains</label>
                                            <div className="flex gap-3 mb-3">
                                                {[{v:true, l:'Privative'}, {v:false, l:'Partagée'}].map(opt => (
                                                    <button key={String(opt.v)} type="button" onClick={() => setCurrentChambre(p => ({...p, salleBainPrivee:opt.v}))}
                                                            className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition ${currentChambre.salleBainPrivee === opt.v ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-200 text-gray-600'}`}>
                                                        {opt.l}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {allEquipBain.map(item => {
                                                    const sel = currentChambre.equipSalleBain?.includes(item)
                                                    return (
                                                        <button key={item} type="button" onClick={() => toggleEquipBain(item)}
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition text-left ${sel ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-200 text-gray-600'}`}>
                                                            {sel && <Check size={10} style={{color:'#66CAD8'}}/>}{item}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            <AddCustomField placeholder="Ajouter un équipement salle de bains..." onAdd={addCustomEquipBain} />
                                        </div>

                                        {/* Équipements chambre */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Équipements de la chambre</label>
                                            {Object.entries(EQUIP_CHAMBRE).filter(([k]) => k !== 'Salle de bains').map(([cat, items]) => {
                                                const allItems = [...items, ...(customEquipCats[cat] || [])]
                                                return (
                                                    <div key={cat} className="mb-4">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{cat}</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {allItems.map(item => {
                                                                const sel = currentChambre.equipChambre?.includes(item)
                                                                return (
                                                                    <button key={item} type="button" onClick={() => toggleEquip(cat, item)}
                                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition text-left ${sel ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-200 text-gray-600'}`}>
                                                                        {sel && <Check size={10} style={{color:'#66CAD8'}}/>}{item}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                        <AddCustomField placeholder={`Ajouter un équipement ${cat.toLowerCase()}...`} onAdd={(item) => addCustomEquipCat(cat, item)} />
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Tarif */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tarif par nuit <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <input type="number" placeholder="Ex: 450" value={currentChambre.tarif} onChange={e => setCurrentChambre(p => ({...p, tarif:e.target.value}))}
                                                       className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm" />
                                                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600">MAD</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => { setShowAddChambre(false); setCustomTypeChambre(false) }} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 transition">Annuler</button>
                                            <button type="button" onClick={saveChambre} className="flex-1 py-3 rounded-xl text-white font-bold transition hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>Enregistrer la chambre</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setShowAddChambre(true)}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#66CAD8] hover:text-[#66CAD8] transition font-medium">
                                        <Plus size={18} /> Ajouter {chambres.length > 0 ? 'une autre chambre' : 'une chambre'}
                                    </button>
                                )}
                                {chambres.length > 0 && !showAddChambre && (
                                    <button type="button" onClick={() => validateSection(2)}
                                            className="w-full py-4 rounded-xl text-white font-bold transition hover:shadow-lg flex items-center justify-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                                        Valider les chambres <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                                    Pour une agence, configurez les détails de vos services dans votre espace agence après validation.
                                </div>
                                <button type="button" onClick={() => validateSection(2)} className="w-full py-4 rounded-xl text-white font-bold transition hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                                    Continuer <ArrowRight size={18} className="inline ml-1" />
                                </button>
                            </div>
                        )}
                    </Section>

                    {/* ── SECTION 3 — Photos ── */}
                    <Section number={3} title="Photos de l'établissement"
                             desc="Ajoutez au moins 5 photos de votre établissement pour attirer plus de clients."
                             status={sectionStatus[3]} isOpen={openSection === 3}
                             onToggle={() => sectionStatus[3] !== 'locked' && setOpenSection(openSection === 3 ? null : 3)}>
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-sm text-amber-700">
                                <Info size={16} className="shrink-0 mt-0.5"/>
                                <span>Les établissements avec au moins 10 photos reçoivent 3x plus de réservations. Maximum 20 photos.</span>
                            </div>
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {photoPreviews.map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                            <img src={src} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                                            {i === 0 && <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-lg">Photo principale</div>}
                                        </div>
                                    ))}
                                    {photos.length < 20 && (
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#66CAD8] transition gap-1">
                                            <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                                            <Plus size={20} className="text-gray-400" />
                                            <span className="text-xs text-gray-400">Ajouter</span>
                                        </label>
                                    )}
                                </div>
                            )}
                            {photos.length === 0 && (
                                <label className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-[#66CAD8] transition">
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                        <Camera size={28} className="text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-700">Cliquez pour ajouter des photos</p>
                                        <p className="text-sm text-gray-400 mt-1">JPG, PNG — Max 10MB par photo</p>
                                    </div>
                                </label>
                            )}
                            <span className={`text-sm font-medium ${photos.length >= 5 ? 'text-green-600' : 'text-amber-600'}`}>
                                {photos.length}/20 photos {photos.length < 5 && `(min. 5 requises)`}
                            </span>
                            {photos.length >= 5 && (
                                <button type="button" onClick={() => validateSection(3)}
                                        className="w-full py-4 rounded-xl text-white font-bold transition hover:shadow-lg flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                                    Valider les photos <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </Section>

                    {/* ── SECTION 4 — Paiements ── */}
                    <Section number={4} title="Paiements & Facturation"
                             desc="Modes de paiement acceptés et informations de facturation."
                             status={sectionStatus[4]} isOpen={openSection === 4}
                             onToggle={() => sectionStatus[4] !== 'locked' && setOpenSection(openSection === 4 ? null : 4)}>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <CreditCard size={18} style={{color:'#66CAD8'}}/> Modes de paiement acceptés <span className="text-red-500 text-sm">*</span>
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {CARTES_ACCEPTEES.map(carte => {
                                        const sel = paiement.cartesAcceptees.includes(carte.key)
                                        return (
                                            <button key={carte.key} type="button" onClick={() => toggleCarte(carte.key)}
                                                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition ${sel ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-200 text-gray-600'}`}>
                                                {sel && <Check size={12} style={{color:'#66CAD8'}}/>}
                                                <span className="truncate">{carte.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3">Adresse de facturation</h4>
                                <button type="button" onClick={() => setPaiement(p => ({...p, memeAdresse: !p.memeAdresse}))}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 text-sm transition mb-3">
                                    <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                                         style={paiement.memeAdresse ? {background:'#66CAD8', borderColor:'#66CAD8'} : {borderColor:'#D1D5DB'}}>
                                        {paiement.memeAdresse && <Check size={11} className="text-white"/>}
                                    </div>
                                    <span className="text-gray-700">Même adresse que l'établissement</span>
                                </button>
                                {!paiement.memeAdresse && (
                                    <input type="text" placeholder="Adresse de facturation complète"
                                           value={paiement.adresseFacturation}
                                           onChange={e => setPaiement(p => ({...p, adresseFacturation: e.target.value}))}
                                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <Hash size={18} style={{color:'#66CAD8'}}/> Identifiant de classement
                                </h4>
                                <input type="text" placeholder="Ex: CL-2024-XXXXX"
                                       value={paiement.identifiantClassement}
                                       onChange={e => setPaiement(p => ({...p, identifiantClassement: e.target.value}))}
                                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition" />
                            </div>
                            <button type="button" onClick={() => validateSection(4)}
                                    className="w-full py-4 rounded-xl text-white font-bold transition hover:shadow-lg flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                                Valider les informations de paiement <ArrowRight size={18} />
                            </button>
                        </div>
                    </Section>

                    {/* ── SECTION 5 — Documents ── */}
                    <Section number={5} title="Documents légaux & Informations bancaires"
                             desc="Uploadez vos documents et renseignez votre IBAN."
                             status={sectionStatus[5]} isOpen={openSection === 5}
                             onToggle={() => sectionStatus[5] !== 'locked' && setOpenSection(openSection === 5 ? null : 5)}>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Documents</h4>
                                <p className="text-sm text-gray-500 mb-4">Tous les documents sont optionnels. PDF, JPG, PNG — Max 5MB</p>
                                <div className="space-y-3">
                                    {(isHotel ? DOCS_REQUIS : DOCS_AGENCE).map(doc => (
                                        <DocUpload key={doc.key} doc={doc}
                                                   file={documents[doc.key]}
                                                   onChange={file => setDocuments(prev => ({ ...prev, [doc.key]: file }))} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Informations bancaires</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IBAN <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="MA64 XXXX XXXX XXXX XXXX XXXX XX"
                                               value={infosFinancieres.iban}
                                               onChange={e => setInfosFinancieres(p => ({...p, iban:e.target.value}))}
                                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition font-mono" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
                                            <input type="text" placeholder="Ex: Attijariwafa Bank"
                                                   value={infosFinancieres.nomBanque}
                                                   onChange={e => setInfosFinancieres(p => ({...p, nomBanque:e.target.value}))}
                                                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du titulaire</label>
                                            <input type="text" placeholder="Nom sur le compte"
                                                   value={infosFinancieres.nomTitulaire}
                                                   onChange={e => setInfosFinancieres(p => ({...p, nomTitulaire:e.target.value}))}
                                                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" onClick={handleSubmit} disabled={loading}
                                    className="w-full py-4 rounded-xl text-white font-bold transition-all hover:shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                                    style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252, #5D2E8B)' }}>
                                {loading ? (
                                    <><RefreshCw size={18} className="animate-spin"/> Envoi en cours...</>
                                ) : (
                                    <><Check size={20} /> Soumettre mon dossier pour validation</>
                                )}
                            </button>
                        </div>
                    </Section>

                </div>
            </div>
        </div>
    )
}
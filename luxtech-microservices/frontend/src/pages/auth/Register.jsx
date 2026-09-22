import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    Eye, EyeOff, Check, ChevronRight, ChevronLeft,
    Building2, Handshake, Mail, User, Phone, Lock,
    MapPin, Star, Map, FileText, RefreshCw
} from 'lucide-react'
import axios from '../../api/axios'

const TOTAL_STEPS = 9

const VILLES_MAROC = [
    'Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir',
    'Meknès','Oujda','Kénitra','Tétouan','Safi','El Jadida',
    'Beni Mellal','Nador','Settat','Laâyoune','Errachidia','Dakhla',
]

const EQUIPEMENTS = [
    'Piscine','WiFi gratuit','Parking','Restaurant','Bar',
    'Salle de sport','Spa','Climatisation','Réception 24h/24',
    'Navette aéroport','Terrasse','Jardin','Ascenseur',
    'Chambres non-fumeurs','Chambres familiales','Jacuzzi',
]

const SERVICES_LIST = [
    { key: 'petitDejeuner', label: 'Petit-déjeuner inclus' },
    { key: 'parking',       label: 'Parking disponible' },
    { key: 'transfert',     label: 'Transfert aéroport' },
    { key: 'roomService',   label: 'Room service' },
]

// ── Barre de progression ──────────────────────────────────
const StepBar = ({ current }) => {
    const steps = [
        { n:1, label:'Type' }, { n:2, label:'Héberg.' }, { n:3, label:'Email' }, { n:4, label:'Vérif.' },
        { n:5, label:'Coordonnées' }, { n:6, label:'Mot de passe' },
        { n:7, label:'Localisation' }, { n:8, label:'Établissement' }, { n:9, label:'Confirmation' },
    ]
    return (
        <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto pb-2">
            {steps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                    <div className="flex flex-col items-center gap-1 min-w-[36px]">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                             style={current >= s.n
                                 ? { background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)', color: 'white' }
                                 : { background: '#F3F4F6', color: '#9CA3AF' }}>
                            {current > s.n ? <Check size={12} /> : s.n}
                        </div>
                        <span className={`text-[9px] hidden sm:block text-center leading-tight ${current === s.n ? 'font-bold text-[#1D2252]' : 'text-gray-400'}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className="w-5 sm:w-7 h-0.5 mb-4 mx-0.5"
                             style={{ background: current > s.n ? 'linear-gradient(90deg,#66CAD8,#5D2E8B)' : '#E5E7EB' }} />
                    )}
                </div>
            ))}
        </div>
    )
}

// ── Boutons nav ───────────────────────────────────────────
const NavButtons = ({ step, onBack, onNext, nextLabel='Continuer', loading=false, disabled=false }) => (
    <div className="flex gap-3 mt-8">
        {step > 1 && (
            <button type="button" onClick={onBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-[#66CAD8] transition">
                <ChevronLeft size={18}/> Retour
            </button>
        )}
        <button type="button" onClick={onNext} disabled={disabled || loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
            {loading
                ? <><RefreshCw size={16} className="animate-spin"/> Envoi...</>
                : <>{nextLabel} <ChevronRight size={18}/></>
            }
        </button>
    </div>
)

// ── Types d'hébergement ───────────────────────────────────
const TYPES_HEBERGEMENT = [
    { key: 'hotel',     label: 'Hôtel',               desc: 'Établissement hôtelier classé' },
    { key: 'auberge',   label: 'Auberge',              desc: 'Auberge de jeunesse ou de campagne' },
    { key: 'camping',   label: 'Camping',              desc: 'Terrain de camping et caravaning' },
    { key: 'ferme',     label: 'Ferme',                desc: 'Hébergement en milieu rural' },
    { key: 'gite',      label: 'Gîte',                 desc: 'Gîte rural ou urbain' },
    { key: 'maison',    label: "Maison d'hôtes",       desc: "Chambre chez l'habitant" },
    { key: 'pension',   label: 'Pension',              desc: 'Pension de famille' },
    { key: 'relais',    label: 'Relais',               desc: 'Relais routier ou de poste' },
    { key: 'residence', label: 'Résidence hôtelière',  desc: 'Appartements meublés touristiques' },
    { key: 'riad',      label: 'Riad',                 desc: 'Maison traditionnelle marocaine' },
]

// ── ÉTAPE 1 — Type de compte ──────────────────────────────
const Step1 = ({ data, setData, onNext }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quel est votre profil ?</h2>
        <p className="text-gray-500 mb-8">Choisissez le type de compte que vous souhaitez créer sur LuxTech.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
                { key:'HEBERGEMENT_ADMIN', icon:Building2, title:'Hébergement touristique', desc:"Hôtel, Auberge, Gîte, Riad, Camping...", features:['Gestion des chambres','PMS intégré','Channel Manager','Facturation'] },
                { key:'AGENCY_ADMIN', icon:Handshake, title:'Agence de voyage', desc:'Agence de voyages, Tour-opérateur...', features:["Réseau d'hôtels",'Réservations groupées','Commissions','CRM'] },
            ].map(t => {
                const Icon = t.icon; const active = data.role === t.key
                return (
                    <button key={t.key} type="button" onClick={() => setData({...data, role:t.key, typeHebergement:''})}
                            className={`relative p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md ${active?'border-[#66CAD8] shadow-lg':'border-gray-200'}`}>
                        {active && <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{background:'#66CAD8'}}><Check size={13}/></div>}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                             style={active?{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}:{background:'#F3F4F6'}}>
                            <Icon size={26} className={active?'text-white':'text-gray-400'}/>
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${active?'text-[#1D2252]':'text-gray-800'}`}>{t.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">{t.desc}</p>
                        <ul className="space-y-1">
                            {t.features.map((f,i) => <li key={i} className="flex items-center gap-2 text-xs text-gray-600"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:'#66CAD8'}}/>{f}</li>)}
                        </ul>
                    </button>
                )
            })}
        </div>
        <NavButtons step={1} onNext={onNext} disabled={!data.role}/>
    </div>
)

// ── ÉTAPE 2 — Type d'hébergement (uniquement si HEBERGEMENT_ADMIN) ──
const Step1b = ({ data, setData, onNext, onBack }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Type d'hébergement</h2>
        <p className="text-gray-500 mb-8">Sélectionnez le type d'établissement que vous gérez.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPES_HEBERGEMENT.map(t => {
                const active = data.typeHebergement === t.key
                return (
                    <button key={t.key} type="button" onClick={() => setData({...data, typeHebergement: t.key})}
                            className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${active?'border-[#66CAD8] shadow-lg':'border-gray-200 hover:border-gray-300'}`}>
                        {active && <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{background:'#66CAD8'}}><Check size={11}/></div>}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                             style={active?{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}:{background:'#F3F4F6'}}>
                            <Building2 size={18} className={active?'text-white':'text-gray-400'}/>
                        </div>
                        <div>
                            <p className={`font-semibold text-sm ${active?'text-[#1D2252]':'text-gray-800'}`}>{t.label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{t.desc}</p>
                        </div>
                    </button>
                )
            })}
        </div>
        <NavButtons step={2} onBack={onBack} onNext={onNext} disabled={!data.typeHebergement}/>
    </div>
)

// ── ÉTAPE 2 — Email ───────────────────────────────────────
const Step2 = ({ data, setData, onNext, onBack, loading, error }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Créez votre compte partenaire</h2>
        <p className="text-gray-500 mb-8">Entrez votre adresse e-mail. Nous vous enverrons un code de vérification.</p>
        {error && <div className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail <span className="text-red-500">*</span></label>
            <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" required autoFocus placeholder="vous@entreprise.ma"
                       value={data.email} onChange={e => setData({...data, email:e.target.value})}
                       className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
            </div>
            <p className="text-xs text-gray-400 mt-2">Un code à 6 chiffres vous sera envoyé à cette adresse.</p>
        </div>
        <NavButtons step={2} onBack={onBack} onNext={onNext} loading={loading} nextLabel="Envoyer le code"
                    disabled={!data.email || !data.email.includes('@')}/>
    </div>
)

// ── ÉTAPE 3 — Vérification code ───────────────────────────
const Step3 = ({ data, setData, onNext, onBack, loading, error, onResend }) => {
    const inputs = useRef([])
    const code = (data.verificationCode || '      ').split('')

    const handleChange = (val, idx) => {
        const d = val.replace(/\D/,'').slice(0,1)
        const c = [...code]; c[idx] = d || ' '
        setData({...data, verificationCode: c.join('')})
        if (d && idx < 5) inputs.current[idx+1]?.focus()
    }
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !code[idx]?.trim() && idx > 0) inputs.current[idx-1]?.focus()
    }
    const handlePaste = (e) => {
        const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6).padEnd(6,' ')
        setData({...data, verificationCode: p})
        inputs.current[Math.min(p.trim().length,5)]?.focus()
        e.preventDefault()
    }

    return (
        <div>
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                     style={{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}}>
                    <Mail size={28}/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez votre e-mail</h2>
                <p className="text-gray-500 text-sm">Code envoyé à <strong className="text-[#1D2252]">{data.email}</strong></p>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200 text-center">{error}</div>}
            <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
                {[0,1,2,3,4,5].map(i => (
                    <input key={i} ref={el => inputs.current[i]=el}
                           type="text" maxLength={1} inputMode="numeric"
                           value={code[i]?.trim()||''}
                           onChange={e => handleChange(e.target.value,i)}
                           onKeyDown={e => handleKeyDown(e,i)}
                           className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition"
                           style={{borderColor: code[i]?.trim() ? '#66CAD8':'#E5E7EB', color:'#1D2252'}}/>
                ))}
            </div>
            <p className="text-center text-sm text-gray-500 mb-2">
                Vous n'avez pas reçu le code ?{' '}
                <button type="button" onClick={onResend} className="font-semibold hover:underline" style={{color:'#66CAD8'}}>Renvoyer</button>
            </p>
            <NavButtons step={3} onBack={onBack} onNext={onNext} loading={loading} nextLabel="Vérifier"
                        disabled={(data.verificationCode||'').trim().length < 6}/>
        </div>
    )
}

// ── ÉTAPE 4 — Coordonnées ─────────────────────────────────
const Step4 = ({ data, setData, onNext, onBack }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos coordonnées</h2>
        <p className="text-gray-500 mb-8">Votre nom complet et votre numéro de téléphone.</p>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                    <input type="text" required autoFocus placeholder="Prénom"
                           value={data.prenom} onChange={e => setData({...data, prenom:e.target.value})}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="Nom"
                           value={data.nom} onChange={e => setData({...data, nom:e.target.value})}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 px-3 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-600 shrink-0">
                        🇲🇦 +212
                    </div>
                    <input type="tel" placeholder="6 00 00 00 00" maxLength={10}
                           value={data.telephone}
                           onChange={e => setData({...data, telephone:e.target.value.replace(/\D/g,'')})}
                           className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none text-sm transition ${
                               data.telephone && data.telephone.length !== 10
                                   ? 'border-red-300 focus:border-red-400'
                                   : 'border-gray-200 focus:border-[#66CAD8]'
                           }`}/>
                </div>
                {data.telephone && data.telephone.length !== 10 && (
                    <p className="text-xs text-red-500 mt-1">Le numéro doit contenir exactement 10 chiffres.</p>
                )}
            </div>
        </div>
        <NavButtons step={4} onBack={onBack} onNext={onNext}
                    disabled={!data.prenom || !data.nom || !data.telephone || data.telephone.length !== 10}/>
    </div>
)

// ── ÉTAPE 5 — Mot de passe ────────────────────────────────
const Step5 = ({ data, setData, onNext, onBack }) => {
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const strength = pwd => {
        let s=0
        if ((pwd||'').length>=8) s++
        if (/[A-Z]/.test(pwd||'')) s++
        if (/[0-9]/.test(pwd||'')) s++
        if (/[^A-Za-z0-9]/.test(pwd||'')) s++
        return s
    }
    const s = strength(data.password)
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un mot de passe</h2>
            <p className="text-gray-500 mb-8">Au moins 8 caractères, dont 1 majuscule et 1 chiffre.</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type={showPass?'text':'password'} required placeholder="Saisissez un mot de passe"
                               value={data.password} onChange={e => setData({...data, password:e.target.value})}
                               className="w-full pl-9 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                        <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                        </button>
                    </div>
                    {data.password && (
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                {[1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i<=s?['bg-red-400','bg-orange-400','bg-yellow-400','bg-green-500'][s-1]:'bg-gray-200'}`}/>)}
                            </div>
                            <p className={`text-xs ${s<=1?'text-red-500':s<=2?'text-orange-500':s<=3?'text-yellow-600':'text-green-600'}`}>
                                Force : {['Trop court','Faible','Moyen','Bon','Excellent'][s]||''}
                            </p>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type={showConfirm?'text':'password'} required placeholder="Confirmez votre mot de passe"
                               value={data.confirmPassword} onChange={e => setData({...data, confirmPassword:e.target.value})}
                               className={`w-full pl-9 pr-11 py-3 border-2 rounded-xl focus:outline-none text-sm transition ${data.confirmPassword&&data.password!==data.confirmPassword?'border-red-300':'border-gray-200 focus:border-[#66CAD8]'}`}/>
                        <button type="button" onClick={()=>setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showConfirm?<EyeOff size={16}/>:<Eye size={16}/>}
                        </button>
                    </div>
                    {data.confirmPassword&&data.password!==data.confirmPassword && <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>}
                </div>
            </div>
            <NavButtons step={5} onBack={onBack} onNext={onNext}
                        disabled={!data.password||data.password.length<8||data.password!==data.confirmPassword}/>
        </div>
    )
}

// ── ÉTAPE 6 — Localisation ────────────────────────────────
const Step6 = ({ data, setData, onNext, onBack }) => {
    const [tab, setTab] = useState('manual')
    const [adresseMap, setAdresseMap] = useState('')
    const mapRef = useRef(null)
    const mapInstance = useRef(null)

    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`)
            const data = await res.json()
            if (data.display_name) {
                setAdresseMap(data.display_name)
                setData(d => ({...d, adresse: data.display_name})) // ✅ ajouter cette ligne
            }        } catch (_) {}
    }

    useEffect(() => {
        if (tab !== 'map' || mapInstance.current) return
        const loadMap = async () => {
            if (!window.L) {
                const link = document.createElement('link')
                link.rel = 'stylesheet'
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
                document.head.appendChild(link)
                await new Promise((res, rej) => {
                    const script = document.createElement('script')
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
                    script.onload = res; script.onerror = rej
                    document.head.appendChild(script)
                })
            }
            if (!mapRef.current) return
            const L = window.L
            const lat = data.lat || 33.5731; const lng = data.lng || -7.5898
            const map = L.map(mapRef.current).setView([lat, lng], 13)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map)
            const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
            marker.bindPopup('📍 Votre établissement').openPopup()
            marker.on('dragend', () => {
                const p = marker.getLatLng()
                setData(d => ({...d, lat:p.lat, lng:p.lng}))
                reverseGeocode(p.lat, p.lng)
            })
            map.on('click', e => {
                marker.setLatLng(e.latlng)
                setData(d => ({...d, lat:e.latlng.lat, lng:e.latlng.lng}))
                reverseGeocode(e.latlng.lat, e.latlng.lng)
            })
            mapInstance.current = map
        }
        loadMap()
    }, [tab])

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Où se trouve votre établissement ?</h2>
            <p className="text-gray-500 mb-6">Indiquez l'adresse ou placez le repère sur la carte.</p>
            <div className="flex border-b border-gray-200 mb-6">
                {[{key:'manual',label:'Saisie manuelle',icon:FileText},{key:'map',label:'Carte interactive',icon:Map}].map(t => {
                    const Icon = t.icon
                    return (
                        <button key={t.key} type="button" onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${tab===t.key?'border-[#66CAD8] text-[#1D2252]':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <Icon size={16}/>{t.label}
                        </button>
                    )
                })}
            </div>
            {tab === 'manual' && (
                <div className="space-y-4">
                    <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600 flex items-center gap-2">
                        🇲🇦 Maroc
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <select required value={data.ville} onChange={e => setData({...data, ville:e.target.value})}
                                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm appearance-none bg-white">
                                <option value="">Sélectionnez une ville</option>
                                {VILLES_MAROC.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Nom de la rue et numéro"
                               value={data.adresse} onChange={e => setData({...data, adresse:e.target.value})}
                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (ligne 2)</label>
                            <input type="text" placeholder="Appartement, suite..."
                                   value={data.adresse2} onChange={e => setData({...data, adresse2:e.target.value})}
                                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                            <input type="text" placeholder="Ex: 20000"
                                   value={data.codePostal} onChange={e => setData({...data, codePostal:e.target.value})}
                                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                        </div>
                    </div>
                </div>
            )}
            {tab === 'map' && (
                <div>
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-start gap-2">
                        <MapPin size={16} className="shrink-0 mt-0.5"/>
                        <span>Cliquez sur la carte ou déplacez le repère pour indiquer l'emplacement exact de votre établissement.</span>
                    </div>
                    <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border-2 border-gray-200" style={{height:'360px'}}/>
                    {data.lat && data.lng && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin size={14} style={{color:'#66CAD8', flexShrink:0}}/>
                                <span className="font-medium">Coordonnées :</span>
                                <span className="text-gray-500">{data.lat?.toFixed(5)}, {data.lng?.toFixed(5)}</span>
                            </div>
                            {adresseMap && (
                                <div className="flex items-start gap-2 text-sm text-gray-700">
                                    <MapPin size={14} style={{color:'#5D2E8B', flexShrink:0}} className="mt-0.5"/>
                                    <span><span className="font-medium">Adresse :</span> <span className="text-gray-500">{adresseMap}</span></span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            <NavButtons step={6} onBack={onBack} onNext={onNext}
                        disabled={tab==='manual' && (!data.ville || !data.adresse)}/>
        </div>
    )
}

// ── ÉTAPE 7 — Établissement ───────────────────────────────
const Step7 = ({ data, setData, onNext, onBack }) => {
    const isHebergement = data.role === 'HEBERGEMENT_ADMIN'
    const [newEquip, setNewEquip] = useState('')
    const [newService, setNewService] = useState('')

    const toggleEquip = e => {
        const cur = data.equipements||[]
        setData({...data, equipements: cur.includes(e)?cur.filter(x=>x!==e):[...cur,e]})
    }
    const toggleService = key => setData({...data, services:{...(data.services||{}), [key]:!data.services?.[key]}})

    const addEquip = () => {
        if (!newEquip.trim()) return
        const cur = data.equipements||[]
        if (!cur.includes(newEquip.trim())) {
            setData({...data, equipements:[...cur, newEquip.trim()]})
        }
        setNewEquip('')
    }

    const addService = () => {
        if (!newService.trim()) return
        const key = 'custom_' + Date.now()
        setData({...data,
            services:{...(data.services||{}), [key]: true},
            servicesCustom:{...(data.servicesCustom||{}), [key]: newService.trim()}
        })
        setNewService('')
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isHebergement ? "Dites-nous en plus sur votre établissement" : "Dites-nous en plus sur votre agence"}
            </h2>
            <p className="text-gray-500 mb-6">Ces informations seront visibles sur la plateforme LuxTech.</p>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isHebergement?"Nom de l'établissement":"Nom de l'agence"} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" required autoFocus
                           placeholder={isHebergement?'Ex: Hôtel Atlas Casablanca':'Ex: Atlas Travel Agency'}
                           value={data.nomEtablissement} onChange={e => setData({...data, nomEtablissement:e.target.value})}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone de l'établissement</label>
                    <input type="tel" placeholder="+212 5 22 00 00 00"
                           value={data.telephoneEtablissement} onChange={e => setData({...data, telephoneEtablissement:e.target.value})}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                </div>
                {isHebergement && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'étoiles</label>
                        <div className="flex gap-2 flex-wrap">
                            {['N/A','1','2','3','4','5'].map(v => (
                                <button key={v} type="button" onClick={() => setData({...data, etoiles:v})}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${data.etoiles===v?'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]':'border-gray-200 text-gray-600'}`}>
                                    {v==='N/A'?'N/A':<>{v} <Star size={12} fill={data.etoiles===v?'#f59e0b':'none'} className={data.etoiles===v?'text-amber-400':'text-gray-400'}/></>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {isHebergement && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Équipements proposés</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                            {[...EQUIPEMENTS, ...(data.equipements||[]).filter(e => !EQUIPEMENTS.includes(e))].map(e => {
                                const sel = (data.equipements||[]).includes(e)
                                return (
                                    <button key={e} type="button" onClick={() => toggleEquip(e)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all text-left ${sel?'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]':'border-gray-200 text-gray-600'}`}>
                                        {sel && <Check size={11} style={{color:'#66CAD8'}}/>}{e}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Ajouter un équipement personnalisé..."
                                   value={newEquip} onChange={e => setNewEquip(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEquip())}
                                   className="flex-1 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            <button type="button" onClick={addEquip}
                                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium transition"
                                    style={{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}}>
                                + Ajouter
                            </button>
                        </div>
                    </div>
                )}
                {isHebergement && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Services inclus</label>
                        <div className="space-y-2 mb-3">
                            {SERVICES_LIST.map(s => (
                                <button key={s.key} type="button" onClick={() => toggleService(s.key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all text-left ${data.services?.[s.key]?'border-[#66CAD8] bg-[#66CAD8]/10':'border-gray-200'}`}>
                                    <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                                         style={data.services?.[s.key]?{background:'#66CAD8',borderColor:'#66CAD8'}:{borderColor:'#D1D5DB'}}>
                                        {data.services?.[s.key] && <Check size={11} className="text-white"/>}
                                    </div>
                                    <span className={data.services?.[s.key]?'text-[#1D2252] font-medium':'text-gray-600'}>{s.label}</span>
                                </button>
                            ))}
                            {/* Services personnalisés */}
                            {Object.entries(data.servicesCustom||{}).map(([key, label]) => (
                                <button key={key} type="button" onClick={() => toggleService(key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all text-left ${data.services?.[key]?'border-[#66CAD8] bg-[#66CAD8]/10':'border-gray-200'}`}>
                                    <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                                         style={data.services?.[key]?{background:'#66CAD8',borderColor:'#66CAD8'}:{borderColor:'#D1D5DB'}}>
                                        {data.services?.[key] && <Check size={11} className="text-white"/>}
                                    </div>
                                    <span className={data.services?.[key]?'text-[#1D2252] font-medium':'text-gray-600'}>{label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Ajouter un service personnalisé..."
                                   value={newService} onChange={e => setNewService(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
                                   className="flex-1 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            <button type="button" onClick={addService}
                                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium transition"
                                    style={{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}}>
                                + Ajouter
                            </button>
                        </div>
                    </div>
                )}
                {!isHebergement && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de licence de voyage</label>
                        <input type="text" placeholder="Ex: AGV-2024-XXXXX"
                               value={data.licenceVoyage} onChange={e => setData({...data, licenceVoyage:e.target.value})}
                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                    </div>
                )}
            </div>
            <NavButtons step={7} onBack={onBack} onNext={onNext} disabled={!data.nomEtablissement}/>
        </div>
    )
}

// ── ÉTAPE 8 — Confirmation ────────────────────────────────
const Step8 = ({ data, onBack, onSubmit, loading, error }) => {
    const [cgu, setCgu] = useState(false)
    const isHebergement = data.role === 'HEBERGEMENT_ADMIN'

    const sections = [
        { n:1, title:'Type de compte', items:[
                {label:'Profil', value: isHebergement ? '🏨 Hébergement touristique' : '✈️ Agence de voyage'},
                ...(isHebergement && data.typeHebergement ? [{
                    label: 'Type d\'hébergement',
                    value: TYPES_HEBERGEMENT.find(t => t.key === data.typeHebergement)?.label || data.typeHebergement
                }] : []),
            ]},
        { n:2, title:'Informations personnelles', items:[
                {label:'Nom complet', value:`${data.prenom} ${data.nom}`},
                {label:'Email', value:data.email},
                {label:'Téléphone', value:data.telephone?`+212 ${data.telephone}`:'—'},
            ]},
        { n:3, title:'Localisation', items:[
                {label:'Ville', value:data.ville||'—'},
                {label:'Adresse', value:data.adresse||'—'},
                ...(data.lat?[{label:'Coordonnées GPS', value:`${data.lat?.toFixed(4)}, ${data.lng?.toFixed(4)}`}]:[]),
            ]},
        { n:4, title: isHebergement ? "Infos établissement" : "Infos agence", items:[
                {label: isHebergement ? "Nom de l'établissement" : "Nom de l'agence", value: data.nomEtablissement},
                ...(isHebergement ? [{label:'Étoiles', value: data.etoiles || 'N/A'}] : []),
                ...(isHebergement && data.equipements?.length ? [{
                    label:'Équipements',
                    value:`${data.equipements.slice(0,3).join(', ')}${data.equipements.length>3 ? ` +${data.equipements.length-3}` : ''}`
                }] : []),
                ...(!isHebergement && data.licenceVoyage ? [{label:'Licence', value: data.licenceVoyage}] : []),
            ]},
    ]

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Récapitulatif</h2>
            <p className="text-gray-500 mb-6">Vérifiez vos informations avant de continuer.</p>
            {error && <div className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>}
            <div className="space-y-3 mb-5">
                {sections.map(s => (
                    <div key={s.n} className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                                 style={{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}}>
                                <Check size={12}/>
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">Étape {s.n} — {s.title}</span>
                        </div>
                        <div className="px-4 py-3 divide-y divide-gray-50">
                            {s.items.map((item,i) => (
                                <div key={i} className="flex items-center justify-between py-1.5">
                                    <span className="text-gray-500 text-xs">{item.label}</span>
                                    <span className="font-medium text-gray-900 text-xs text-right max-w-[60%]">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-5 flex items-start gap-3">
                <span className="text-xl">📋</span>
                <div>
                    <p className="font-semibold text-blue-800 text-sm">Étape suivante — Compléter votre dossier</p>
                    <p className="text-blue-600 text-xs mt-0.5">
                        Après la création de votre compte, vous devrez compléter votre dossier :
                        chambres, photos et documents légaux avant la validation par notre équipe.
                    </p>
                </div>
            </div>

            <button type="button" onClick={() => setCgu(!cgu)}
                    className="w-full flex items-start gap-3 mb-6 text-left">
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                     style={cgu?{background:'#66CAD8',borderColor:'#66CAD8'}:{borderColor:'#D1D5DB'}}>
                    {cgu && <Check size={11} className="text-white"/>}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    En créant un compte, j'accepte les{' '}
                    <a href="#" className="hover:underline" style={{color:'#66CAD8'}} onClick={e=>e.stopPropagation()}>conditions générales</a>{' '}
                    et la{' '}
                    <a href="#" className="hover:underline" style={{color:'#66CAD8'}} onClick={e=>e.stopPropagation()}>charte de confidentialité</a> de LuxTech.
                </p>
            </button>

            <NavButtons step={8} onBack={onBack} onNext={onSubmit}
                        nextLabel="Créer mon compte et continuer" loading={loading} disabled={!cgu}/>
        </div>
    )
}

// ── PAGE PRINCIPALE ───────────────────────────────────────
export default function Register() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    const [data, setData] = useState({
        role:'', typeHebergement:'', email:'', verificationCode:'',
        prenom:'', nom:'', telephone:'',
        password:'', confirmPassword:'',
        ville:'', adresse:'', adresse2:'', codePostal:'', lat:null, lng:null,
        nomEtablissement:'', telephoneEtablissement:'', etoiles:'N/A',
        equipements:[], services:{}, licenceVoyage:'',
    })

    const next = () => { setErrors({}); setStep(s=>Math.min(s+1,TOTAL_STEPS)); window.scrollTo(0,0) }
    const back = () => { setErrors({}); setStep(s=>Math.max(s-1,1)); window.scrollTo(0,0) }

    const sendCode = async () => {
        setLoading(true); setErrors({})
        try {
            await axios.post('/auth/send-verification-code', { email: data.email })
        } catch (_) {}
        finally { setLoading(false); next() }
    }

    const verifyCode = async () => {
        setLoading(true); setErrors({})
        try {
            const res = await axios.post('/auth/verify-code', {
                email: data.email,
                code: data.verificationCode?.trim()
            })
            if (res.data?.valid === true) {
                next()
            } else {
                setErrors({ code: 'Code invalide ou expiré. Veuillez réessayer.' })
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Code invalide ou expiré. Veuillez réessayer.'
            setErrors({ code: msg })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        setLoading(true); setErrors({})
        try {
            const res = await axios.post('/auth/register', {
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone ? `+212${data.telephone}` : undefined,
                password: data.password,
                role: data.role,
                nomEtablissement: data.nomEtablissement,
                typeHebergement: data.typeHebergement || undefined,
                ville: data.ville,
                adresse: data.adresse,
                codePostal: data.codePostal,
                lat: data.lat,
                lng: data.lng,
                etoiles: data.etoiles !== 'N/A' ? Number(data.etoiles) : undefined,
                equipements: data.equipements,
                services: data.services,
                licenceVoyage: data.licenceVoyage || undefined,
                telephoneEtablissement: data.telephoneEtablissement || undefined,
            })

            if (res.data?.data) {
                localStorage.setItem('user', JSON.stringify(res.data.data))
            }

            // Sauvegarde du brouillon d'inscription — récupéré par CompleteProfile
            // pour ne pas perdre ces données lors de la création de l'Hebergement
            localStorage.setItem('registrationDraft', JSON.stringify({
                adresse: data.adresse,
                codePostal: data.codePostal,
                telephone: data.telephone ? `+212${data.telephone}` : undefined,
                etoiles: data.etoiles !== 'N/A' ? Number(data.etoiles) : undefined,
                lat: data.lat,
                lng: data.lng,
                equipements: data.equipements,
                services: data.services,
                servicesCustom: data.servicesCustom,
            }))

            setSuccess(true)
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }
    // ── Page succès ───────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4"
                 style={{background:'linear-gradient(135deg,#10182A 0%,#1D2252 100%)'}}>
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white"
                         style={{background:'linear-gradient(135deg,#66CAD8,#5D2E8B)'}}>
                        <Check size={36}/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
                    <p className="text-gray-600 mb-6">
                        Bonjour <strong>{data.prenom}</strong> ! Votre compte a été créé avec succès.
                        Il vous reste à compléter votre dossier pour soumettre votre demande de validation.
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-3">
                        <p className="font-semibold text-gray-700 text-sm mb-3">📋 Étapes suivantes :</p>
                        {[
                            { n:'1', label:'Infos de base', status:'done' },
                            { n:'2', label:'Chambres & logements', status:'pending' },
                            { n:'3', label:"Photos de l'établissement", status:'pending' },
                            { n:'4', label:'Paiements & Facturation', status:'pending' },
                            { n:'5', label:'Documents légaux & infos bancaires', status:'pending' },
                        ].map(item => (
                            <div key={item.n} className="flex items-center gap-3">
                                {item.status === 'done'
                                    ? <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0" style={{background:'#10b981'}}><Check size={12}/></div>
                                    : <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 shrink-0 font-bold">{item.n}</div>
                                }
                                <span className={`text-sm ${item.status === 'done' ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => navigate(`/complete-profile?role=${data.role}&prenom=${data.prenom}`)}
                                className="w-full py-4 rounded-xl text-white font-bold transition hover:shadow-lg flex items-center justify-center gap-2"
                                style={{background:'linear-gradient(135deg,#66CAD8,#1D2252,#5D2E8B)'}}>
                            Compléter mon dossier →
                        </button>
                        <button onClick={() => navigate('/login')}
                                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-[#66CAD8] transition">
                            Continuer plus tard (se connecter)
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8 px-4"
             style={{background:'linear-gradient(135deg,#f8fafc 0%,#f0f9ff 50%,#faf5ff 100%)'}}>
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="cursor-pointer inline-block mb-4" onClick={() => navigate('/')}>
                        <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-10 mx-auto"
                             onError={e => {
                                 e.target.style.display='none'
                                 e.target.parentElement.innerHTML=`<div style="font-size:26px;font-weight:900;color:#1D2252">LUX<span style="color:#66CAD8">TECH</span></div>`
                             }}/>
                    </div>
                    <p className="text-gray-600 font-medium">Inscription partenaire</p>
                </div>
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                    <StepBar current={step}/>
                    {step===1 && <Step1 data={data} setData={setData} onNext={next}/>}
                    {step===2 && data.role==='HEBERGEMENT_ADMIN' && <Step1b data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===2 && data.role==='AGENCY_ADMIN' && <Step2 data={data} setData={setData} onNext={sendCode} onBack={back} loading={loading} error={errors.email}/>}
                    {step===3 && data.role==='HEBERGEMENT_ADMIN' && <Step2 data={data} setData={setData} onNext={sendCode} onBack={back} loading={loading} error={errors.email}/>}
                    {step===3 && data.role==='AGENCY_ADMIN' && <Step3 data={data} setData={setData} onNext={verifyCode} onBack={back} loading={loading} error={errors.code} onResend={sendCode}/>}
                    {step===4 && data.role==='HEBERGEMENT_ADMIN' && <Step3 data={data} setData={setData} onNext={verifyCode} onBack={back} loading={loading} error={errors.code} onResend={sendCode}/>}
                    {step===4 && data.role==='AGENCY_ADMIN' && <Step4 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===5 && data.role==='HEBERGEMENT_ADMIN' && <Step4 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===5 && data.role==='AGENCY_ADMIN' && <Step5 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===6 && data.role==='HEBERGEMENT_ADMIN' && <Step5 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===6 && data.role==='AGENCY_ADMIN' && <Step6 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===7 && data.role==='HEBERGEMENT_ADMIN' && <Step6 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===7 && data.role==='AGENCY_ADMIN' && <Step7 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===8 && data.role==='HEBERGEMENT_ADMIN' && <Step7 data={data} setData={setData} onNext={next} onBack={back}/>}
                    {step===8 && data.role==='AGENCY_ADMIN' && <Step8 data={data} onBack={back} onSubmit={handleSubmit} loading={loading} error={errors.submit}/>}
                    {step===9 && <Step8 data={data} onBack={back} onSubmit={handleSubmit} loading={loading} error={errors.submit}/>}
                </div>
                <p className="text-center text-sm text-gray-500 mt-6">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-semibold hover:underline" style={{color:'#66CAD8'}}>
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}
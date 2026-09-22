import { useState, useEffect } from 'react'
import {
    Settings, Globe, CreditCard, Percent, Building2,
    RefreshCw, Save, CheckCircle, AlertTriangle,
    FileText, Clock
} from 'lucide-react'
import axios from '../../api/axios'
// import { useTranslation } from 'react-i18next'
import i18n from '../../i18n/index.js'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const applyLanguage = (lang) => {
    i18n.changeLanguage(lang)
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
}

const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
            className="relative w-11 h-6 rounded-full transition-all duration-300"
            style={{ background: checked ? 'linear-gradient(135deg, #66CAD8, #1D2252)' : '#e5e7eb' }}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`}/>
    </button>
)

const Section = ({ icon: Icon, title, color, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: color }}>
                <Icon size={15}/>
            </div>
            {title}
        </h3>
        {children}
    </div>
)

const Field = ({ label, desc, children }) => (
    <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {desc && <p className="text-xs text-gray-400 mb-1">{desc}</p>}
        {children}
    </div>
)

export default function AdminParametres() {
    // useTranslation remplace par i18n direct
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const [general, setGeneral] = useState({
        nomPlateforme: 'LuxTech PMS',
        slogan: 'Votre partenaire hotelier au Maroc',
        email: 'contact@luxtech.ma',
        telephone: '+212 5XX-XXXXXX',
        adresse: 'Casablanca, Maroc',
        siteWeb: 'https://luxtech.ma',
        langue: 'fr',
        fuseau: 'Africa/Casablanca',
        devise: 'MAD',
        dateFormat: 'DD/MM/YYYY',
    })

    const [finance, setFinance] = useState({
        commissionHotel: '5',
        commissionAgence: '8',
        tvaRate: '20',
        fraisService: '2',
        delaiPaiement: '30',
        montantMinReversement: '500',
        plafondCredit: '50000',
        modePaiement: 'virement',
        periodiciteFacturation: 'mensuelle',
    })

    const [reservation, setReservation] = useState({
        delaiAnnulation: '48',
        delaiConfirmation: '24',
        avanceMinimum: '20',
        dureeMinSejour: '1',
        checkInHeure: '14:00',
        checkOutHeure: '12:00',
        reservationAutoApprove: false,
        notifPartenaire: true,
        notifClient: true,
        modificationAuto: false,
    })

    const [plateforme, setPlateforme] = useState({
        maintenanceMode: false,
        inscriptionOuverte: true,
        validationAuto: false,
        afficherPrix: true,
        modeCatalogue: false,
        apiPublique: false,
        backupAuto: true,
        debugMode: false,
        frequenceBackup: 'daily',
        retentionDonnees: '365',
    })

    useEffect(() => { fetchParametres() }, [])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchParametres = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/auth/admin/parametres')
            const data = res.data || {}
            const lang = data['general.langue'] || 'fr'

            setGeneral(prev => ({
                ...prev,
                nomPlateforme: data['general.nomPlateforme'] || prev.nomPlateforme,
                slogan:        data['general.slogan']        || prev.slogan,
                email:         data['general.email']         || prev.email,
                telephone:     data['general.telephone']     || prev.telephone,
                adresse:       data['general.adresse']       || prev.adresse,
                siteWeb:       data['general.siteWeb']       || prev.siteWeb,
                langue:        lang,
                fuseau:        data['general.fuseau']        || prev.fuseau,
                devise:        data['general.devise']        || prev.devise,
                dateFormat:    data['general.dateFormat']    || prev.dateFormat,
            }))

            applyLanguage(lang)

            setFinance(prev => ({
                ...prev,
                commissionHotel:        data['finance.commissionHotel']        || prev.commissionHotel,
                commissionAgence:       data['finance.commissionAgence']       || prev.commissionAgence,
                tvaRate:                data['finance.tvaRate']                || prev.tvaRate,
                fraisService:           data['finance.fraisService']           || prev.fraisService,
                delaiPaiement:          data['finance.delaiPaiement']          || prev.delaiPaiement,
                montantMinReversement:  data['finance.montantMinReversement']  || prev.montantMinReversement,
                plafondCredit:          data['finance.plafondCredit']          || prev.plafondCredit,
                modePaiement:           data['finance.modePaiement']           || prev.modePaiement,
                periodiciteFacturation: data['finance.periodiciteFacturation'] || prev.periodiciteFacturation,
            }))

            setReservation(prev => ({
                ...prev,
                delaiAnnulation:        data['reservation.delaiAnnulation']        || prev.delaiAnnulation,
                delaiConfirmation:      data['reservation.delaiConfirmation']      || prev.delaiConfirmation,
                avanceMinimum:          data['reservation.avanceMinimum']          || prev.avanceMinimum,
                dureeMinSejour:         data['reservation.dureeMinSejour']         || prev.dureeMinSejour,
                checkInHeure:           data['reservation.checkInHeure']           || prev.checkInHeure,
                checkOutHeure:          data['reservation.checkOutHeure']          || prev.checkOutHeure,
                reservationAutoApprove: data['reservation.reservationAutoApprove'] === 'true',
                notifPartenaire:        data['reservation.notifPartenaire']        !== 'false',
                notifClient:            data['reservation.notifClient']            !== 'false',
                modificationAuto:       data['reservation.modificationAuto']       === 'true',
            }))

            setPlateforme(prev => ({
                ...prev,
                maintenanceMode:    data['plateforme.maintenanceMode']    === 'true',
                inscriptionOuverte: data['plateforme.inscriptionOuverte'] !== 'false',
                validationAuto:     data['plateforme.validationAuto']     === 'true',
                afficherPrix:       data['plateforme.afficherPrix']       !== 'false',
                modeCatalogue:      data['plateforme.modeCatalogue']      === 'true',
                apiPublique:        data['plateforme.apiPublique']        === 'true',
                backupAuto:         data['plateforme.backupAuto']         !== 'false',
                debugMode:          data['plateforme.debugMode']          === 'true',
                frequenceBackup:    data['plateforme.frequenceBackup']    || prev.frequenceBackup,
                retentionDonnees:   data['plateforme.retentionDonnees']   || prev.retentionDonnees,
            }))
        } catch (err) {
            console.error('Erreur chargement:', err)
            showToast('Erreur lors du chargement.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload = {}
            Object.entries(general).forEach(([k, v]) => { payload[`general.${k}`] = String(v) })
            Object.entries(finance).forEach(([k, v]) => { payload[`finance.${k}`] = String(v) })
            Object.entries(reservation).forEach(([k, v]) => { payload[`reservation.${k}`] = String(v) })
            Object.entries(plateforme).forEach(([k, v]) => { payload[`plateforme.${k}`] = String(v) })

            await axios.put('/auth/admin/parametres', payload)
            applyLanguage(general.langue)
            showToast(i18n.t('action_reussie'))
        } catch (err) {
            console.error('Erreur sauvegarde:', err)
            showToast(i18n.t('erreur'), 'error')
        } finally {
            setSaving(false)
        }
    }

    const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition bg-white"

    const tabs = [
        { key: 'general',     label: 'General',      icon: Settings },
        { key: 'finance',     label: 'Finance',       icon: CreditCard },
        { key: 'reservation', label: 'Reservations',  icon: Clock },
        { key: 'plateforme',  label: 'Plateforme',    icon: Globe },
    ]

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <RefreshCw size={28} className="animate-spin mx-auto text-gray-300 mb-3"/>
                <p className="text-gray-500">{i18n.t('chargement')}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{i18n.t('parametres')}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Configuration generale de la plateforme LuxTech</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchParametres}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#66CAD8] transition">
                        <RefreshCw size={15}/> {i18n.t('actualiser')}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252)' }}>
                        {saving ? <RefreshCw size={15} className="animate-spin"/> : <Save size={15}/>}
                        {i18n.t('sauvegarder')}
                    </button>
                </div>
            </div>

            <div className="flex gap-1 border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const active = activeTab === tab.key
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                                    active ? 'border-[#66CAD8] text-[#1D2252]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}>
                            <Icon size={15}/> {tab.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'general' && (
                <div className="space-y-4">
                    <Section icon={Building2} title="Informations de la plateforme"
                             color="linear-gradient(135deg, #66CAD8, #1D2252)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'nomPlateforme', label: 'Nom de la plateforme', type: 'text' },
                                { key: 'slogan',        label: 'Slogan',               type: 'text' },
                                { key: 'email',         label: 'Email de contact',     type: 'email' },
                                { key: 'telephone',     label: 'Telephone',            type: 'text' },
                                { key: 'adresse',       label: 'Adresse',              type: 'text' },
                                { key: 'siteWeb',       label: 'Site web',             type: 'text' },
                            ].map(f => (
                                <Field key={f.key} label={f.label}>
                                    <input type={f.type} value={general[f.key]}
                                           onChange={e => setGeneral(p => ({ ...p, [f.key]: e.target.value }))}
                                           className={inputClass}/>
                                </Field>
                            ))}
                        </div>
                    </Section>

                    <Section icon={Globe} title="Localisation et Format"
                             color="linear-gradient(135deg, #5D2E8B, #1D2252)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Langue par defaut" desc="Le changement s'applique immediatement">
                                <select value={general.langue}
                                        onChange={e => {
                                            setGeneral(p => ({ ...p, langue: e.target.value }))
                                            applyLanguage(e.target.value)
                                        }}
                                        className={inputClass}>
                                    <option value="fr">Francais</option>
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                            </Field>
                            <Field label="Fuseau horaire">
                                <select value={general.fuseau}
                                        onChange={e => setGeneral(p => ({ ...p, fuseau: e.target.value }))}
                                        className={inputClass}>
                                    <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                                    <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </Field>
                            <Field label="Devise">
                                <select value={general.devise}
                                        onChange={e => setGeneral(p => ({ ...p, devise: e.target.value }))}
                                        className={inputClass}>
                                    <option value="MAD">MAD - Dirham marocain</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="USD">USD - Dollar americain</option>
                                </select>
                            </Field>
                            <Field label="Format de date">
                                <select value={general.dateFormat}
                                        onChange={e => setGeneral(p => ({ ...p, dateFormat: e.target.value }))}
                                        className={inputClass}>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </Field>
                        </div>
                    </Section>
                </div>
            )}

            {activeTab === 'finance' && (
                <div className="space-y-4">
                    <Section icon={Percent} title="Commissions et Taxes"
                             color="linear-gradient(135deg, #66CAD8, #5D2E8B)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'commissionHotel',  label: 'Commission hotels (%)',  desc: 'Taux sur chaque reservation hotel' },
                                { key: 'commissionAgence', label: 'Commission agences (%)', desc: 'Taux sur chaque reservation agence' },
                                { key: 'tvaRate',          label: 'TVA (%)',                desc: 'Taxe sur la valeur ajoutee' },
                                { key: 'fraisService',     label: 'Frais de service (%)',   desc: 'Frais additionnels par transaction' },
                            ].map(f => (
                                <Field key={f.key} label={f.label} desc={f.desc}>
                                    <input type="number" min="0" max="100" value={finance[f.key]}
                                           onChange={e => setFinance(p => ({ ...p, [f.key]: e.target.value }))}
                                           className={inputClass}/>
                                </Field>
                            ))}
                        </div>
                    </Section>

                    <Section icon={CreditCard} title="Paiements et Reversements"
                             color="linear-gradient(135deg, #1D2252, #5D2E8B)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Delai de paiement (jours)">
                                <input type="number" value={finance.delaiPaiement}
                                       onChange={e => setFinance(p => ({ ...p, delaiPaiement: e.target.value }))}
                                       className={inputClass}/>
                            </Field>
                            <Field label="Montant minimum reversement (MAD)">
                                <input type="number" value={finance.montantMinReversement}
                                       onChange={e => setFinance(p => ({ ...p, montantMinReversement: e.target.value }))}
                                       className={inputClass}/>
                            </Field>
                            <Field label="Plafond credit agences (MAD)">
                                <input type="number" value={finance.plafondCredit}
                                       onChange={e => setFinance(p => ({ ...p, plafondCredit: e.target.value }))}
                                       className={inputClass}/>
                            </Field>
                            <Field label="Mode de paiement par defaut">
                                <select value={finance.modePaiement}
                                        onChange={e => setFinance(p => ({ ...p, modePaiement: e.target.value }))}
                                        className={inputClass}>
                                    <option value="virement">Virement bancaire</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="carte">Carte bancaire</option>
                                    <option value="especes">Especes</option>
                                </select>
                            </Field>
                            <Field label="Periodicite facturation">
                                <select value={finance.periodiciteFacturation}
                                        onChange={e => setFinance(p => ({ ...p, periodiciteFacturation: e.target.value }))}
                                        className={inputClass}>
                                    <option value="hebdomadaire">Hebdomadaire</option>
                                    <option value="mensuelle">Mensuelle</option>
                                    <option value="trimestrielle">Trimestrielle</option>
                                </select>
                            </Field>
                        </div>
                    </Section>
                </div>
            )}

            {activeTab === 'reservation' && (
                <div className="space-y-4">
                    <Section icon={Clock} title="Delais et Horaires"
                             color="linear-gradient(135deg, #66CAD8, #1D2252)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'delaiAnnulation',   label: 'Delai annulation (heures)',   type: 'number' },
                                { key: 'delaiConfirmation', label: 'Delai confirmation (heures)', type: 'number' },
                                { key: 'avanceMinimum',     label: 'Avance minimum (%)',          type: 'number' },
                                { key: 'dureeMinSejour',    label: 'Duree min sejour (nuits)',    type: 'number' },
                                { key: 'checkInHeure',      label: 'Heure check-in',              type: 'time' },
                                { key: 'checkOutHeure',     label: 'Heure check-out',             type: 'time' },
                            ].map(f => (
                                <Field key={f.key} label={f.label}>
                                    <input type={f.type} value={reservation[f.key]}
                                           onChange={e => setReservation(p => ({ ...p, [f.key]: e.target.value }))}
                                           className={inputClass}/>
                                </Field>
                            ))}
                        </div>
                    </Section>

                    <Section icon={Settings} title="Comportement"
                             color="linear-gradient(135deg, #5D2E8B, #1D2252)">
                        <div className="space-y-4">
                            {[
                                { key: 'reservationAutoApprove', label: 'Approbation automatique',    desc: 'Approuver automatiquement les reservations' },
                                { key: 'notifPartenaire',        label: 'Notifier le partenaire',     desc: 'Notification a chaque reservation' },
                                { key: 'notifClient',            label: 'Notifier le client',         desc: 'Confirmation envoyee au client' },
                                { key: 'modificationAuto',       label: 'Modifications automatiques', desc: 'Permettre les modifications sans validation' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <Toggle checked={reservation[item.key]}
                                            onChange={v => setReservation(p => ({ ...p, [item.key]: v }))}/>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            )}

            {activeTab === 'plateforme' && (
                <div className="space-y-4">
                    {plateforme.maintenanceMode && (
                        <div className="rounded-2xl p-4 flex items-center gap-4"
                             style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                            <AlertTriangle size={22} className="text-white shrink-0"/>
                            <div>
                                <p className="font-bold text-white">Mode maintenance active</p>
                                <p className="text-sm text-red-200">La plateforme est inaccessible aux utilisateurs.</p>
                            </div>
                        </div>
                    )}

                    <Section icon={Globe} title="Modes d acces"
                             color="linear-gradient(135deg, #66CAD8, #1D2252)">
                        <div className="space-y-4">
                            {[
                                { key: 'maintenanceMode',    label: 'Mode maintenance',        desc: 'Desactiver temporairement la plateforme' },
                                { key: 'inscriptionOuverte', label: 'Inscriptions ouvertes',   desc: 'Permettre les nouvelles inscriptions' },
                                { key: 'validationAuto',     label: 'Validation automatique',  desc: 'Approuver automatiquement les inscriptions' },
                                { key: 'afficherPrix',       label: 'Afficher les prix',       desc: 'Visible aux non connectes' },
                                { key: 'modeCatalogue',      label: 'Mode catalogue',          desc: 'Consultation sans reservation' },
                                { key: 'apiPublique',        label: 'API publique',            desc: 'Acces API sans authentification' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <Toggle checked={plateforme[item.key]}
                                            onChange={v => setPlateforme(p => ({ ...p, [item.key]: v }))}/>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section icon={FileText} title="Donnees et Sauvegardes"
                             color="linear-gradient(135deg, #5D2E8B, #1D2252)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <Field label="Frequence des sauvegardes">
                                <select value={plateforme.frequenceBackup}
                                        onChange={e => setPlateforme(p => ({ ...p, frequenceBackup: e.target.value }))}
                                        className={inputClass}>
                                    <option value="hourly">Toutes les heures</option>
                                    <option value="daily">Quotidienne</option>
                                    <option value="weekly">Hebdomadaire</option>
                                </select>
                            </Field>
                            <Field label="Retention des donnees (jours)">
                                <input type="number" value={plateforme.retentionDonnees}
                                       onChange={e => setPlateforme(p => ({ ...p, retentionDonnees: e.target.value }))}
                                       className={inputClass}/>
                            </Field>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: 'backupAuto', label: 'Sauvegarde automatique', desc: 'Sauvegardes automatiques de la base de donnees' },
                                { key: 'debugMode',  label: 'Mode debug',             desc: 'Logs detailles (desactiver en production)' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <Toggle checked={plateforme[item.key]}
                                            onChange={v => setPlateforme(p => ({ ...p, [item.key]: v }))}/>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            )}

            <div className="flex justify-end pb-4">
                <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #66CAD8, #1D2252)' }}>
                    {saving ? <RefreshCw size={15} className="animate-spin"/> : <Save size={15}/>}
                    {i18n.t('sauvegarder')}
                </button>
            </div>
        </div>
    )
}
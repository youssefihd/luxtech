import { useState, useEffect, useCallback } from 'react'
import {
    CreditCard, Check, RefreshCw, AlertTriangle, XCircle, Clock,
    Sparkles, Zap, Crown, X
} from 'lucide-react'
import { hebergementAxios, paymentAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const PLANS = [
    { key: 'BASIQUE', label: 'Basique', prix: 299, icon: Sparkles, color: '#2563eb', bg: '#dbeafe',
        features: ['Jusqu\'à 20 chambres', 'Support par email', 'Rapports de base'] },
    { key: 'PREMIUM', label: 'Premium', prix: 599, icon: Zap, color: PURPLE, bg: '#f3e8ff',
        features: ['Chambres illimitées', 'Support prioritaire', 'Rapports avancés', 'Channel Manager'] },
    { key: 'ENTREPRISE', label: 'Entreprise', prix: 999, icon: Crown, color: '#d97706', bg: '#fef3c7',
        features: ['Tout Premium inclus', 'Support dédié 24/7', 'API personnalisée', 'Multi-établissements'] },
]

const STATUT_CONFIG = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-100 text-amber-700', icon: Clock, dot: '#d97706' },
    ACTIF:      { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700', icon: Check, dot: '#059669' },
    ANNULE:     { label: 'Annulé',     cls: 'bg-red-100 text-red-600', icon: XCircle, dot: '#dc2626' },
    EXPIRE:     { label: 'Expiré',     cls: 'bg-gray-100 text-gray-500', icon: AlertTriangle, dot: '#6b7280' },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ConfirmModal = ({ isOpen, plan, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(plan.key) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !plan) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: plan.bg }}>
                        <plan.icon size={26} style={{ color: plan.color }}/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Souscrire au plan {plan.label}</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {fmt(plan.prix)} / mois — Votre demande sera enregistrée en attente de validation.
                    </p>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const CancelModal = ({ isOpen, abonnement, onConfirm, onClose }) => {
    const [processing, setProcessing] = useState(false)
    const handleConfirm = async () => {
        setProcessing(true)
        try { await onConfirm(abonnement.id) }
        finally { setProcessing(false) }
    }
    if (!isOpen || !abonnement) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <XCircle size={26} className="text-red-600"/>
                    </div>
                    <h2 className="text-lg font-black text-gray-900">Annuler l'abonnement</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Cette action annulera votre abonnement {PLANS.find(p => p.key === abonnement.plan)?.label}. Vous repasserez au mode commission.
                    </p>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Retour
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                            className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                        {processing ? <RefreshCw size={15} className="animate-spin mx-auto"/> : "Confirmer l'annulation"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HebergementSubscriptions() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [abonnements, setAbonnements] = useState([])
    const [abonnementActif, setAbonnementActif] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [confirmPlan, setConfirmPlan] = useState(null)
    const [cancelTarget, setCancelTarget] = useState(null)
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
                const [listRes, actifRes] = await Promise.all([
                    paymentAxios.get(`/payment/abonnements/hotel/${h.id}`).catch(() => null),
                    paymentAxios.get(`/payment/abonnements/hotel/${h.id}/actif`).catch(() => null),
                ])
                setAbonnements(listRes?.data?.data || [])
                setAbonnementActif(actifRes?.data?.data || null)
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [userId])

    useEffect(() => { fetchData() }, [fetchData])

    const enAttente = abonnements.find(a => a.statut === 'EN_ATTENTE')

    const handleSouscrire = async (planKey) => {
        try {
            await paymentAxios.post('/payment/abonnements', { hotelId: hebergement.id, plan: planKey })
            showToast('Demande envoyée ! En attente de validation.')
            setConfirmPlan(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    const handleValider = async (id) => {
        try {
            await paymentAxios.post(`/payment/abonnements/${id}/valider`)
            showToast('Abonnement validé et activé !')
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    const handleAnnuler = async (id) => {
        try {
            await paymentAxios.post(`/payment/abonnements/${id}/annuler`)
            showToast('Abonnement annulé.')
            setCancelTarget(null)
            await fetchData(true)
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur.', 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <RefreshCw size={28} className="animate-spin" style={{ color: CYAN }}/>
            </div>
        )
    }

    return (
        <div className="space-y-5 max-w-5xl mx-auto">

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
                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Opérations</p>
                        <h1 className="text-2xl font-black text-white">Abonnements</h1>
                        <p className="text-white/60 text-sm mt-1">
                            Mode actuel : <span className="font-bold text-white">{abonnementActif ? 'Abonnement' : 'Commission'}</span>
                        </p>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition border border-white/20 disabled:opacity-50 shrink-0">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                        Actualiser
                    </button>
                </div>
            </div>

            {abonnementActif ? (
                <div className="rounded-2xl p-6 border-2" style={{ background: 'linear-gradient(135deg, #d1fae5, #dbeafe)', borderColor: '#a7f3d0' }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
                                <Check size={22} className="text-white"/>
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900">
                                    Abonnement {PLANS.find(p => p.key === abonnementActif.plan)?.label} actif
                                </h3>
                                <p className="text-sm text-gray-600">Valide jusqu'au {fmtDate(abonnementActif.dateExpiration)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-2xl font-black text-gray-900">{fmt(abonnementActif.prix)}</p>
                                <p className="text-xs text-gray-500">par mois</p>
                            </div>
                            <button onClick={() => setCancelTarget(abonnementActif)}
                                    className="px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            ) : enAttente ? (
                <div className="rounded-2xl p-6 border-2 border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-3">
                        <Clock size={22} className="text-amber-600 shrink-0"/>
                        <div>
                            <p className="font-bold text-amber-800">
                                Demande d'abonnement {PLANS.find(p => p.key === enAttente.plan)?.label} en attente de validation
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">{fmt(enAttente.prix)} / mois</p>
                        </div>
                        <button onClick={() => handleValider(enAttente.id)}
                                className="ml-auto px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:shadow-lg transition"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            Valider maintenant
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl p-5 border-2 border-gray-200 bg-gray-50 flex items-center gap-3">
                    <CreditCard size={20} className="text-gray-400 shrink-0"/>
                    <p className="text-sm text-gray-600">
                        Vous êtes actuellement en mode <strong>Commission</strong> — une commission est prélevée sur chaque réservation.
                        Choisissez un plan ci-dessous pour passer en abonnement mensuel fixe.
                    </p>
                </div>
            )}

            {!abonnementActif && !enAttente && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PLANS.map(plan => {
                        const Icon = plan.icon
                        return (
                            <div key={plan.key} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: plan.bg }}>
                                    <Icon size={22} style={{ color: plan.color }}/>
                                </div>
                                <h3 className="text-lg font-black text-gray-900">{plan.label}</h3>
                                <p className="text-3xl font-black mt-2" style={{ color: plan.color }}>
                                    {fmt(plan.prix)}<span className="text-sm text-gray-400 font-medium"> /mois</span>
                                </p>
                                <div className="space-y-2 mt-4 mb-6">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Check size={14} style={{ color: plan.color }} className="shrink-0"/>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setConfirmPlan(plan)}
                                        className="w-full py-3 rounded-2xl text-white font-black text-sm transition hover:shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${plan.color}, ${NAVY})` }}>
                                    Choisir ce plan
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Historique des abonnements</h2>
                </div>
                {abonnements.length === 0 ? (
                    <div className="p-12 text-center">
                        <CreditCard size={32} className="mx-auto text-gray-200 mb-3"/>
                        <p className="text-gray-500 font-medium text-sm">Aucun abonnement pour le moment</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Plan', 'Montant', 'Statut', 'Date début', 'Date fin'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {abonnements.map(a => {
                                const cfg = STATUT_CONFIG[a.statut] || { label: a.statut, cls: 'bg-gray-100 text-gray-600' }
                                const planInfo = PLANS.find(p => p.key === a.plan)
                                return (
                                    <tr key={a.id} className="hover:bg-gray-50/80 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={14} className="text-gray-400"/>
                                                <span className="text-sm font-bold text-gray-900">{planInfo?.label || a.plan}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{fmt(a.prix)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{fmtDate(a.dateDebut)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{fmtDate(a.dateExpiration)}</td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal isOpen={!!confirmPlan} plan={confirmPlan} onConfirm={handleSouscrire} onClose={() => setConfirmPlan(null)}/>
            <CancelModal isOpen={!!cancelTarget} abonnement={cancelTarget} onConfirm={handleAnnuler} onClose={() => setCancelTarget(null)}/>
        </div>
    )
}
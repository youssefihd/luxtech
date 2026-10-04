import { useState } from 'react'
import { X, FileText, CheckCircle, AlertTriangle, XCircle, User, Calendar, CreditCard, Clock3, Download, Loader } from 'lucide-react'
import { bookingAxios } from '../../api/axios'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const STATUT_CONFIG = {
    PAYEE:               { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: CheckCircle,   label: 'Payée' },
    PARTIELLEMENT_PAYEE: { bg: 'bg-blue-100',     text: 'text-blue-700',   Icon: Clock3,         label: 'Partiellement payée' },
    IMPAYEE:              { bg: 'bg-amber-100',   text: 'text-amber-700',   Icon: AlertTriangle,  label: 'Impayée' },
    ANNULEE:               { bg: 'bg-red-100',     text: 'text-red-700',     Icon: XCircle,        label: 'Annulée' },
}

const fmt = (v) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(Number(v) || 0)

const fmtDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }
    catch { return '—' }
}

const fmtShort = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }
    catch { return '—' }
}

const FactureViewModal = ({ facture, reservation, onClose }) => {
    const [downloading, setDownloading] = useState(false)

    if (!facture) return null

    const st = STATUT_CONFIG[facture.statut] || { bg: 'bg-gray-100', text: 'text-gray-600', Icon: AlertTriangle, label: facture.statut }
    const { Icon: StatIcon } = st

    const total      = Number(facture.montantTotal) || 0
    const ht         = Number(facture.montantHt) || 0
    const tva        = Number(facture.montantTva) || 0
    const commission = Number(facture.montantCommission) || 0
    const paye       = Number(reservation?.montantPaye) || 0
    const reste      = Math.max(0, total - paye)
    const pct        = total > 0 ? Math.min(100, Math.round((paye / total) * 100)) : 0

    const handleDownload = async () => {
        setDownloading(true)
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
        } catch (err) {
            console.error(err)
            alert('Erreur lors du téléchargement du PDF.')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 rounded-t-3xl overflow-hidden z-10"
                     style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <FileText size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Facture</p>
                                <h2 className="text-lg font-black text-white">{facture.numeroFacture}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">

                    {/* Statut */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${st.bg}`}>
                        <StatIcon size={14} className={st.text}/>
                        <span className={`text-sm font-bold ${st.text}`}>{st.label}</span>
                    </div>

                    {/* Client & Réservation */}
                    {reservation && (
                        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                                <User size={11}/> Client & Réservation
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs">Client</p>
                                    <p className="font-bold text-gray-900">{reservation.clientNom} {reservation.clientPrenom || ''}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Email</p>
                                    <p className="text-gray-700 text-xs truncate">{reservation.clientEmail || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">N° Réservation</p>
                                    <p className="font-bold text-gray-900 font-mono text-xs">{reservation.numeroReservation}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Chambre</p>
                                    <p className="font-bold text-gray-900">{reservation.chambreNumero || `#${reservation.chambreId}` || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Arrivée</p>
                                    <p className="font-bold text-gray-900">{fmtShort(reservation.dateArrivee)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Départ</p>
                                    <p className="font-bold text-gray-900">{fmtShort(reservation.dateDepart)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates facture */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                            <Calendar size={11}/> Dates
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400 text-xs">Date facture</p>
                                <p className="font-bold text-gray-900">{fmtDate(facture.dateFacture)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Échéance</p>
                                <p className="font-bold text-gray-900">{fmtDate(facture.dateEcheance)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Détail financier */}
                    <div className="rounded-2xl border-2 p-4 space-y-2"
                         style={{ borderColor: `${CYAN}30`, background: `${CYAN}08` }}>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                            <CreditCard size={11}/> Détail financier
                        </p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Montant HT</span>
                            <span className="font-semibold text-gray-700">{fmt(ht)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">TVA (20%)</span>
                            <span className="font-semibold text-gray-700">{fmt(tva)}</span>
                        </div>
                        {commission > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Commission</span>
                                <span className="font-semibold text-gray-700">{fmt(commission)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
                            <span className="font-black text-gray-900">Total TTC</span>
                            <span className="font-black text-gray-900 text-base">{fmt(total)}</span>
                        </div>
                    </div>

                    {/* Paiement */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Mode de paiement</span>
                            <span className="font-bold text-gray-900">{{ ESPECE: 'Espèces', CARTE: 'Carte', CHEQUE: 'Chèque', VIREMENT: 'Virement' }[facture.methodePaiement] || 'Non renseigné'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Progression du paiement</span>
                            <span className="font-bold text-gray-900">{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                                 style={{ width: `${pct}%`, background: pct >= 100 ? '#059669' : `linear-gradient(90deg, ${CYAN}, ${NAVY})` }}/>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="text-sm font-bold text-gray-900">{fmt(total)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Payé</p>
                                <p className="text-sm font-bold text-emerald-600">{fmt(paye)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Restant</p>
                                <p className="text-sm font-bold text-orange-500">{fmt(reste)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Type de facture</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                            {facture.typeFacture || '—'}
                        </span>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Fermer
                    </button>
                    <button onClick={handleDownload} disabled={downloading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {downloading ? <Loader size={15} className="animate-spin"/> : <Download size={15}/>}
                        Télécharger PDF
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FactureViewModal

import { useCallback, useEffect, useState } from 'react'
import { Download, FileText, RefreshCw } from 'lucide-react'
import { agencyAxios } from '../../api/axios'

const money = value => `${Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`

export default function AgencyInvoices() {
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [downloading, setDownloading] = useState(null)
    const [methods, setMethods] = useState({})
    const [paying, setPaying] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const response = await agencyAxios.get('/booking/agency/factures')
            setInvoices(response.data?.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Impossible de charger les factures.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const download = async invoice => {
        setDownloading(invoice.id)
        try {
            const response = await agencyAxios.get(`/booking/agency/factures/${invoice.id}/pdf`, { responseType: 'blob' })
            const url = URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = url
            link.download = `${invoice.numeroFacture || 'facture'}.pdf`
            link.click()
            URL.revokeObjectURL(url)
        } catch {
            setError('Le téléchargement de cette facture a échoué.')
        } finally {
            setDownloading(null)
        }
    }

    const pay = async invoice => {
        const methode = methods[invoice.id]
        if (!methode) return
        setPaying(invoice.id)
        setError('')
        try {
            await agencyAxios.post(`/booking/agency/factures/${invoice.id}/paiement`, { methode })
            await load()
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Le paiement de la facture a échoué.')
        } finally {
            setPaying(null)
        }
    }

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Factures agence</h1>
                    <p className="mt-1 text-sm text-gray-500">Factures liées aux réservations de votre agence.</p>
                </div>
                <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
                </button>
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {loading ? <p className="p-10 text-center text-sm text-gray-500">Chargement des factures…</p>
                    : invoices.length === 0 ? <div className="p-12 text-center"><FileText className="mx-auto mb-3 text-gray-300" size={36} /><p className="font-medium text-gray-800">Aucune facture pour le moment</p><p className="mt-1 text-sm text-gray-500">Les factures apparaîtront ici après vos réservations.</p></div>
                        : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Facture</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Échéance</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Mode</th><th className="px-5 py-3 text-right">Montant</th><th className="px-5 py-3 text-right">PDF</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">{invoices.map(invoice => <tr key={invoice.id}>
                                <td className="px-5 py-4 font-medium text-gray-900">{invoice.numeroFacture}</td>
                                <td className="px-5 py-4 text-gray-600">{invoice.dateFacture || '—'}</td>
                                <td className="px-5 py-4 text-gray-600">{invoice.dateEcheance || '—'}</td>
                                <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{invoice.statut || '—'}</span></td>
                                <td className="px-5 py-4 text-gray-600">
                                    {invoice.statut === 'PAYEE' ? invoice.methodePaiement || '—' : <div className="flex items-center gap-2">
                                        <select aria-label={`Mode de paiement pour ${invoice.numeroFacture}`} value={methods[invoice.id] || ''} onChange={event => setMethods(current => ({ ...current, [invoice.id]: event.target.value }))} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs">
                                            <option value="">Mode…</option><option value="ESPECE">Espèces</option><option value="CARTE">Carte</option><option value="CHEQUE">Chèque</option><option value="VIREMENT">Virement</option>
                                        </select>
                                        <button onClick={() => pay(invoice)} disabled={!methods[invoice.id] || paying === invoice.id || invoice.statut === 'ANNULEE'} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{paying === invoice.id ? '…' : 'Régler'}</button>
                                    </div>}
                                </td>
                                <td className="px-5 py-4 text-right font-semibold text-gray-900">{money(invoice.montantTotal)}</td>
                                <td className="px-5 py-4 text-right"><button onClick={() => download(invoice)} disabled={downloading === invoice.id} aria-label={`Télécharger ${invoice.numeroFacture}`} className="rounded-lg p-2 text-[#4B8794] hover:bg-cyan-50 disabled:opacity-50"><Download size={17} /></button></td>
                            </tr>)}</tbody>
                        </table></div>}
            </div>
        </section>
    )
}


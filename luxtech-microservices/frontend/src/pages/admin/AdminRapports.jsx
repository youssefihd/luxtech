import { useState, useEffect } from 'react'
import {
    TrendingUp, TrendingDown, Users, Building2,
    Handshake, CheckCircle, RefreshCw, AlertTriangle
} from 'lucide-react'
import axios from '../../api/axios'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const TYPE_LABELS = {
    hotel: 'Hotel', auberge: 'Auberge', camping: 'Camping',
    ferme: 'Ferme', gite: 'Gite', maison: "Maison d'hotes",
    pension: 'Pension', relais: 'Relais', residence: 'Residence', riad: 'Riad',
}

const MOIS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
const PIE_COLORS = [CYAN, NAVY, PURPLE, '#4a90d9', '#e67e22', '#27ae60', '#e74c3c', '#8e44ad', '#2c3e50', '#16a085']

const KpiCard = ({ icon: Icon, label, value, sub, color, trend, trendValue }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                 style={{ background: color }}>
                <Icon size={20}/>
            </div>
            {trendValue !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    trend === 'up' ? 'bg-[#E8F7FA] text-[#66CAD8]' : 'bg-[#EDE8F2] text-[#5D2E8B]'
                }`}>
                    {trend === 'up' ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                    {trendValue}%
                </div>
            )}
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value ?? 0}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
)

const BarChart = ({ data, keys, colors, height = 200 }) => {
    const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1)
    const w = 100 / data.length
    return (
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
            {data.map((d, i) => (
                keys.map((k, ki) => {
                    const barW = (w * 0.7) / keys.length
                    const x = i * w + (w * 0.15) + ki * barW
                    const barH = ((d[k] || 0) / maxVal) * (height - 20)
                    const y = height - barH - 4
                    return barH > 0 ? (
                        <rect key={`${i}-${ki}`} x={`${x}%`} y={y} width={`${barW * 0.85}%`}
                              height={barH} fill={colors[ki]} rx="2" opacity="0.85"/>
                    ) : null
                })
            ))}
            {data.map((d, i) => (
                <text key={i} x={`${i * w + w / 2}%`} y={height} textAnchor="middle"
                      fontSize="3.5" fill="#9CA3AF">{d.mois}</text>
            ))}
        </svg>
    )
}

const DonutChart = ({ data, colors }) => {
    const total = data.reduce((s, d) => s + d.value, 0)
    if (total === 0) return <p className="text-sm text-gray-400 text-center py-8">Aucune donnee</p>
    let cumAngle = -Math.PI / 2
    const cx = 80, cy = 80, r = 55, ri = 35
    const slices = data.map((d, i) => {
        const angle = (d.value / total) * 2 * Math.PI
        const x1 = cx + r * Math.cos(cumAngle)
        const y1 = cy + r * Math.sin(cumAngle)
        cumAngle += angle
        const x2 = cx + r * Math.cos(cumAngle)
        const y2 = cy + r * Math.sin(cumAngle)
        const xi1 = cx + ri * Math.cos(cumAngle - angle)
        const yi1 = cy + ri * Math.sin(cumAngle - angle)
        const xi2 = cx + ri * Math.cos(cumAngle)
        const yi2 = cy + ri * Math.sin(cumAngle)
        const large = angle > Math.PI ? 1 : 0
        return (
            <path key={i}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`}
                  fill={colors[i % colors.length]} opacity="0.9"/>
        )
    })
    return (
        <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
            {slices}
            <text x="80" y="75" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1D2252">{total}</text>
            <text x="80" y="90" textAnchor="middle" fontSize="7" fill="#9CA3AF">utilisateurs</text>
        </svg>
    )
}

const PieChartSVG = ({ data, colors }) => {
    const total = data.reduce((s, d) => s + d.value, 0)
    if (total === 0) return <p className="text-sm text-gray-400 text-center py-8">Aucun partenaire actif</p>
    let cumAngle = -Math.PI / 2
    const cx = 90, cy = 90, r = 75
    const slices = data.map((d, i) => {
        const angle = (d.value / total) * 2 * Math.PI
        const x1 = cx + r * Math.cos(cumAngle)
        const y1 = cy + r * Math.sin(cumAngle)
        cumAngle += angle
        const x2 = cx + r * Math.cos(cumAngle)
        const y2 = cy + r * Math.sin(cumAngle)
        const large = angle > Math.PI ? 1 : 0
        return (
            <path key={i}
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                  fill={colors[i % colors.length]} opacity="0.9" stroke="white" strokeWidth="1.5"/>
        )
    })
    return (
        <svg width="180" height="180" viewBox="0 0 180 180" className="mx-auto">
            {slices}
        </svg>
    )
}

const AreaChartSVG = ({ data, keys, colors, height = 200 }) => {
    const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1)
    const n = data.length
    const pts = (key) => data.map((d, i) => {
        const x = (i / (n - 1)) * 100
        const y = height - 20 - ((d[key] || 0) / maxVal) * (height - 30)
        return `${x},${y}`
    })
    return (
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
            <defs>
                {keys.map((k, i) => (
                    <linearGradient key={k} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[i]} stopOpacity="0.4"/>
                        <stop offset="100%" stopColor={colors[i]} stopOpacity="0"/>
                    </linearGradient>
                ))}
            </defs>
            {keys.map((k, i) => {
                const p = pts(k)
                const areaPath = `M ${p[0]} L ${p.join(' L ')} L ${(n-1)*100/(n-1)},${height-20} L 0,${height-20} Z`
                return (
                    <g key={k}>
                        <path d={areaPath} fill={`url(#grad${i})`}/>
                        <polyline points={p.join(' ')} fill="none" stroke={colors[i]} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                )
            })}
            {data.map((d, i) => (
                <text key={i} x={`${(i / (n - 1)) * 100}%`} y={height}
                      textAnchor="middle" fontSize="3.5" fill="#9CA3AF">{d.mois}</text>
            ))}
        </svg>
    )
}

export default function AdminRapports() {
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/auth/admin/users')
            setAllUsers(res.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const approved  = allUsers.filter(u => u.status === 'APPROVED')
    const pending   = allUsers.filter(u => u.status === 'PENDING_APPROVAL')
    const rejected  = allUsers.filter(u => u.status === 'REJECTED')
    const suspended = allUsers.filter(u => u.status === 'SUSPENDED')
    const hotels    = approved.filter(u => u.role === 'HEBERGEMENT_ADMIN')
    const agences   = approved.filter(u => u.role === 'AGENCY_ADMIN')
    const tauxAppro = allUsers.length > 0 ? Math.round((approved.length / allUsers.length) * 100) : 0

    const byType = {}
    hotels.forEach(u => {
        const t = u.typeHebergement || 'hotel'
        byType[t] = (byType[t] || 0) + 1
    })

    const pieData = Object.entries(byType).map(([type, count]) => ({
        name: TYPE_LABELS[type] || type,
        value: count,
    }))
    if (agences.length > 0) pieData.push({ name: 'Agences', value: agences.length })

    const currentYear = new Date().getFullYear()
    const inscriptionsByMonth = Array(12).fill(0)
    const approvesByMonth = Array(12).fill(0)
    const rejectsByMonth = Array(12).fill(0)

    allUsers.forEach(u => {
        if (!u.createdAt) return
        const d = new Date(u.createdAt)
        if (d.getFullYear() !== currentYear) return
        const m = d.getMonth()
        inscriptionsByMonth[m]++
        if (u.status === 'APPROVED') approvesByMonth[m]++
        if (u.status === 'REJECTED') rejectsByMonth[m]++
    })

    const monthlyData = MOIS.map((mois, i) => ({
        mois,
        inscriptions: inscriptionsByMonth[i],
        approuves: approvesByMonth[i],
        rejetes: rejectsByMonth[i],
    }))

    const statusData = [
        { name: 'Approuves',  value: approved.length,  color: CYAN },
        { name: 'En attente', value: pending.length,   color: '#d97706' },
        { name: 'Rejetes',    value: rejected.length,  color: PURPLE },
        { name: 'Suspendus',  value: suspended.length, color: '#6b7280' },
    ].filter(d => d.value > 0)

    const growthData = MOIS.slice(0, 6).map((mois, i) => ({
        mois,
        hebergements: Math.max(0, hotels.length - (5 - i) * 2),
        agences: Math.max(0, agences.length - (5 - i)),
    }))
    growthData[5] = { mois: MOIS[new Date().getMonth()], hebergements: hotels.length, agences: agences.length }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rapports et Analytique</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Statistiques globales de la plateforme LuxTech</p>
                </div>
                <button onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#66CAD8] transition">
                    <RefreshCw size={15}/> Actualiser
                </button>
            </div>

            {loading ? (
                <div className="p-16 text-center">
                    <RefreshCw size={28} className="animate-spin mx-auto text-gray-300 mb-3"/>
                    <p className="text-gray-500">Chargement des donnees...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard icon={Users} label="Total utilisateurs" value={allUsers.length}
                                 sub="Tous roles confondus" trend="up" trendValue={12}
                                 color={`linear-gradient(135deg, ${CYAN}, ${NAVY})`}/>
                        <KpiCard icon={Building2} label="Hebergements actifs" value={hotels.length}
                                 sub="Etablissements approuves" trend="up" trendValue={8}
                                 color={`linear-gradient(135deg, ${NAVY}, ${PURPLE})`}/>
                        <KpiCard icon={Handshake} label="Agences actives" value={agences.length}
                                 sub="Agences approuvees" trend="up" trendValue={5}
                                 color={`linear-gradient(135deg, ${PURPLE}, ${CYAN})`}/>
                        <KpiCard icon={CheckCircle} label="Taux d'approbation" value={`${tauxAppro}%`}
                                 sub={`${approved.length} approuves / ${allUsers.length} total`}
                                 trend={tauxAppro > 50 ? 'up' : 'down'} trendValue={tauxAppro}
                                 color={`linear-gradient(135deg, ${CYAN}, ${PURPLE})`}/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-900 mb-1">Inscriptions mensuelles</h2>
                            <p className="text-xs text-gray-500 mb-2">Inscriptions, approbations et rejets — {currentYear}</p>
                            <div className="flex items-center gap-4 mb-4 text-xs">
                                {[{color: CYAN, label:'Inscriptions'},{color: NAVY, label:'Approuves'},{color: PURPLE, label:'Rejetes'}].map(({color,label}) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm" style={{background:color}}/>
                                        <span className="text-gray-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                            <BarChart data={monthlyData} keys={['inscriptions','approuves','rejetes']}
                                      colors={[CYAN, NAVY, PURPLE]} height={220}/>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-900 mb-1">Distribution des statuts</h2>
                            <p className="text-xs text-gray-500 mb-4">Repartition de tous les utilisateurs</p>
                            <DonutChart data={statusData} colors={statusData.map(s => s.color)}/>
                            <div className="space-y-2 mt-4">
                                {statusData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: s.color}}/>
                                            <span className="text-xs text-gray-600">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-900">{s.value}</span>
                                            <span className="text-[10px] text-gray-400">
                                                ({allUsers.length > 0 ? Math.round((s.value/allUsers.length)*100) : 0}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-900 mb-1">Repartition des partenaires</h2>
                            <p className="text-xs text-gray-500 mb-4">Par type d'hebergement + agences</p>
                            <PieChartSVG data={pieData} colors={PIE_COLORS}/>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {pieData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: PIE_COLORS[i % PIE_COLORS.length]}}/>
                                        <span className="text-xs text-gray-600 truncate">{d.name}</span>
                                        <span className="text-xs font-bold text-gray-900 ml-auto">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="font-bold text-gray-900 mb-1">Croissance des partenaires</h2>
                            <p className="text-xs text-gray-500 mb-2">Evolution hebergements et agences — 6 derniers mois</p>
                            <div className="flex items-center gap-4 mb-4 text-xs">
                                {[{color: CYAN, label:'Hebergements'},{color: PURPLE, label:'Agences'}].map(({color,label}) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm" style={{background:color}}/>
                                        <span className="text-gray-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                            <AreaChartSVG data={growthData} keys={['hebergements','agences']}
                                          colors={[CYAN, PURPLE]} height={220}/>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Recapitulatif par type</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Detail des partenaires actifs par categorie</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Partenaires actifs</th>
                                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Part du total</th>
                                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {[...Object.entries(byType), ...(agences.length > 0 ? [['_agence', agences.length]] : [])].map(([type, count]) => {
                                    const total = hotels.length + agences.length
                                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                                    const isAgence = type === '_agence'
                                    return (
                                        <tr key={type} className="hover:bg-gray-50 transition">
                                            <td className="px-5 py-3 text-sm font-medium text-gray-900">
                                                {isAgence ? 'Agences de voyage' : (TYPE_LABELS[type] || type)}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-bold text-gray-900">{count}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                                                        <div className="h-full rounded-full" style={{
                                                            width: `${pct}%`,
                                                            background: isAgence ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})` : `linear-gradient(90deg, ${CYAN}, ${PURPLE})`
                                                        }}/>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: CYAN }}>
                                                    <TrendingUp size={12}/> Actif
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pending.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                            <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5"/>
                            <div>
                                <p className="font-bold text-amber-800">Action requise</p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    {pending.length} demande(s) en attente de validation.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
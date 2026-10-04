import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
    Calendar, ChevronLeft, ChevronRight, Check, X,
    Info, RefreshCw, Bed, Users, Star, Search,
    CheckCircle, AlertTriangle, User, CreditCard,
    XCircle, ArrowRight, Moon, TrendingUp, Home, Sparkles
} from 'lucide-react'
import { hebergementAxios, bookingAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const WEEK_DAYS   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const SOURCE_MAP = {
    interne: 'DIRECT',
    booking: 'BOOKING_ENGINE',
    airbnb: 'CHANNEL_MANAGER',
    agence: 'AGENCE',
    site_web: 'DIRECT',
}

const normalize   = (d) => { const n=new Date(d); n.setHours(0,0,0,0); return n }
const isPast      = (d) => normalize(d) < normalize(new Date())
const isToday     = (d) => normalize(d).toDateString() === normalize(new Date()).toDateString()
const formatDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—'
const formatShort = (d) => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}) : '—'
const formatInput = (d) => { if(!d) return ''; const dt=new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}` }
const formatMoney = (a) => new Intl.NumberFormat('fr-MA',{style:'currency',currency:'MAD',minimumFractionDigits:0}).format(a||0)
const fmtHeure = (h) => h ? h.slice(0, 5) : null

// ── Wizard Steps (horizontal top bar) ────────────────────
const WizardSteps = ({ selectedType, selectedRange }) => {
    const steps = [
        { id:1, label:'Choisir le type', icon:'🏨', done:!!selectedType,  active:!selectedType },
        { id:2, label:'Sélectionner les dates', icon:'📅', done:!!selectedRange, active:!!selectedType&&!selectedRange },
        { id:3, label:'Confirmer',       icon:'✅', done:false,            active:!!selectedRange },
    ]
    return (
        <div className="flex items-center gap-0">
            {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                    <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all duration-300 ${
                        s.done   ? 'text-emerald-600' :
                            s.active ? 'text-white' : 'text-gray-400'
                    } ${s.active ? 'rounded-xl shadow-md' : ''}`}
                         style={s.active ? {background:`linear-gradient(135deg,${CYAN},${NAVY})`} : {}}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 border-2 ${
                            s.done   ? 'bg-emerald-500 border-emerald-500 text-white' :
                                s.active ? 'bg-white/20 border-white/40 text-white' :
                                    'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                            {s.done ? <Check size={11}/> : s.id}
                        </span>
                        <span className="hidden md:block">{s.label}</span>
                    </div>
                    {i < steps.length-1 && (
                        <ChevronRight size={14} className={s.done ? 'text-emerald-300 mx-1' : 'text-gray-200 mx-1'}/>
                    )}
                </div>
            ))}
        </div>
    )
}

// ── Room Type Selector — Style horizontal tabs ────────────
const RoomTypeSelector = memo(({ roomTypes, selectedType, onSelect }) => {
    const [search, setSearch] = useState('')
    const filtered = search.trim()
        ? roomTypes.filter(t=>t.nom.toLowerCase().includes(search.toLowerCase()))
        : roomTypes

    if (!roomTypes.length) return (
        <div className="flex items-center justify-center h-full gap-2 text-gray-400">
            <RefreshCw size={16} className="animate-spin"/>
            <span className="text-sm font-medium">Chargement...</span>
        </div>
    )

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Types de chambre</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{filtered.length} disponible{filtered.length>1?'s':''}</p>
                </div>
            </div>

            <div className="relative mb-4">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"/>
                <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                       placeholder="Rechercher un type..."
                       className="w-full pl-8 pr-8 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#66CAD8] focus:bg-white placeholder-gray-300 font-medium transition"/>
                {search && <button onClick={()=>setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12}/></button>}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto flex-1" style={{scrollbarWidth:'none'}}>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-300 py-8">
                        <Search size={20} className="opacity-40"/>
                        <p className="text-xs font-medium">Aucun résultat</p>
                    </div>
                ) : filtered.map(type => {
                    const isSelected = selectedType?.id === type.id
                    const pct = type.nombreChambres > 0
                        ? Math.round((type.chambresDisponibles/type.nombreChambres)*100) : 0
                    const statusColor = type.chambresDisponibles===0 ? '#ef4444' : pct<=30 ? '#f59e0b' : '#22c55e'
                    const full = type.chambresDisponibles === 0

                    return (
                        <button key={type.id} onClick={()=>!full&&onSelect(type)}
                                className={`relative w-full text-left rounded-2xl p-4 border-2 transition-all duration-300 ${
                                    isSelected
                                        ? 'border-transparent shadow-lg'
                                        : full
                                            ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md cursor-pointer'
                                }`}
                                style={isSelected ? {background:`linear-gradient(135deg,${NAVY},${PURPLE})`} : {}}>

                            {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                    <Check size={11} className="text-white"/>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-blue-50'}`}>
                                    <Bed className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-blue-500'}`}/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`font-black text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{type.nom}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                                    {type.chambresDisponibles||0} / {type.nombreChambres||0} libres
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    full ? 'bg-red-100 text-red-600' :
                                        pct<=30 ? 'bg-amber-100 text-amber-600' :
                                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {full ? 'COMPLET' : `${pct}%`}
                                </span>
                            </div>

                            <div className={`h-1 rounded-full overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                                <div className="h-full rounded-full transition-all duration-700"
                                     style={{width:`${pct}%`, backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : statusColor}}/>
                            </div>
                        </button>
                    )
                })}
            </div>

            {selectedType && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="rounded-xl p-3 text-center" style={{background:`${CYAN}10`, border:`1.5px solid ${CYAN}25`}}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type sélectionné</p>
                        <p className="font-black text-sm" style={{color:NAVY}}>{selectedType.nom}</p>
                    </div>
                </div>
            )}
        </div>
    )
})

// ── Calendar Grid — style épuré ───────────────────────────
const CalendarGrid = memo(({
                               chambres, reservations, onDateRangeSelect, isLoading,
                               currentDate, onPrevMonth, onNextMonth, onToday,
                               checkIn, checkOut, isSelectingCheckOut,
                               onCheckInChange, onCheckOutChange, onSelectingChange
                           }) => {
    const [hover, setHover] = useState(null)
    const [tooltipDate, setTooltipDate] = useState(null)

    const calendarDays = useMemo(() => {
        const y=currentDate.getFullYear(), m=currentDate.getMonth()
        const firstDay=new Date(y,m,1).getDay()
        const daysInMonth=new Date(y,m+1,0).getDate()
        const prevLast=new Date(y,m,0).getDate()
        const days=[]
        for(let i=firstDay-1; i>=0; i--) days.push({date:new Date(y,m-1,prevLast-i),isCurrentMonth:false})
        for(let i=1; i<=daysInMonth; i++) days.push({date:new Date(y,m,i),isCurrentMonth:true})
        const rem=days.length%7===0?0:7-days.length%7
        for(let i=1; i<=rem; i++) days.push({date:new Date(y,m+1,i),isCurrentMonth:false})
        return days
    }, [currentDate])

    // Réservations actives ce jour-là — annulées / no-show exclues (elles ne bloquent plus rien)
    const getResForDate = useCallback((date) => {
        if(!reservations?.length) return []
        const d=normalize(date)
        return reservations.filter(r=>{
            if (r.status === 'ANNULEE' || r.status === 'NO_SHOW') return false
            const s=normalize(r.dateArrivee||r.date_arrivee||0)
            const e=normalize(r.dateDepart||r.date_depart||0)
            return d>=s && d<e
        })
    }, [reservations])

    const getAvail = useCallback((date) => {
        if(!chambres?.length) return 0
        const occ=new Set(getResForDate(date).map(r=>r.chambreId||r.chambre_id)).size
        return Math.max(0, chambres.length-occ)
    }, [chambres, getResForDate])

    const getArrivals   = useCallback((d) => reservations?.filter(r=>r.status!=='ANNULEE'&&normalize(r.dateArrivee||r.date_arrivee||0).toDateString()===normalize(d).toDateString())||[], [reservations])
    const getDepartures = useCallback((d) => reservations?.filter(r=>r.status!=='ANNULEE'&&normalize(r.dateDepart||r.date_depart||0).toDateString()===normalize(d).toDateString())||[], [reservations])

    const isInHover = useCallback((date) => {
        if(!checkIn||!isSelectingCheckOut||!hover) return false
        return normalize(date)>normalize(checkIn) && normalize(date)<normalize(hover)
    }, [checkIn, isSelectingCheckOut, hover])

    const checkRangeAvail = useCallback((start,end) => {
        const c=new Date(normalize(start))
        while(c<normalize(end)) { if(getAvail(c)===0) return false; c.setDate(c.getDate()+1) }
        return true
    }, [getAvail])

    const handleClick = useCallback((day) => {
        if(!day.isCurrentMonth||isPast(day.date)||getAvail(day.date)===0) return
        const clicked=new Date(day.date)
        const sameCI=checkIn&&normalize(clicked).toDateString()===normalize(checkIn).toDateString()
        const sameCO=checkOut&&normalize(clicked).toDateString()===normalize(checkOut).toDateString()
        if(sameCI||sameCO){onCheckInChange(null);onCheckOutChange(null);onSelectingChange(false);return}
        if(!checkIn||(checkIn&&checkOut)){onCheckInChange(clicked);onCheckOutChange(null);onSelectingChange(true)}
        else if(isSelectingCheckOut){
            if(clicked<checkIn){onCheckInChange(clicked);onCheckOutChange(null);return}
            if(!checkRangeAvail(checkIn,clicked)){alert('⚠️ Certaines dates ne sont pas disponibles.');return}
            onCheckOutChange(clicked);onSelectingChange(false)
            const nights=Math.max(1,Math.ceil((clicked-checkIn)/86400000))
            onDateRangeSelect({checkIn,checkOut:clicked,nights})
        }
    }, [checkIn,checkOut,isSelectingCheckOut,getAvail,checkRangeAvail,onDateRangeSelect,onCheckInChange,onCheckOutChange,onSelectingChange])

    return (
        <div className="flex flex-col h-full relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2" style={{color:CYAN}}/>
                        <p className="text-sm font-bold text-gray-600">Mise à jour...</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-none">
                <button onClick={onPrevMonth}
                        className="w-9 h-9 rounded-xl border-2 border-gray-100 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition">
                    <ChevronLeft size={16} className="text-gray-500"/>
                </button>

                <div className="text-center">
                    <h3 className="text-xl font-black text-gray-900">
                        {MONTH_NAMES[currentDate.getMonth()]}
                        <span className="text-gray-400 font-light ml-2">{currentDate.getFullYear()}</span>
                    </h3>
                    {isSelectingCheckOut && checkIn && (
                        <div className="flex items-center gap-2 mt-1 justify-center">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
                            <p className="text-xs text-amber-600 font-semibold">
                                Arrivée : {formatShort(checkIn)} — Choisissez le départ
                            </p>
                            <button onClick={()=>{onCheckInChange(null);onCheckOutChange(null);onSelectingChange(false)}}
                                    className="text-[10px] text-gray-400 hover:text-gray-600 underline">annuler</button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onToday}
                            className="text-xs px-3 py-2 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:border-[#66CAD8] hover:text-[#1D2252] transition">
                        Aujourd'hui
                    </button>
                    <button onClick={onNextMonth}
                            className="w-9 h-9 rounded-xl border-2 border-gray-100 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition">
                        <ChevronRight size={16} className="text-gray-500"/>
                    </button>
                </div>
            </div>

            {/* Légende */}
            <div className="flex items-center gap-5 px-6 py-2 bg-gray-50/50 border-b border-gray-100 flex-none flex-wrap">
                {[
                    {color:'#059669', label:'Occupée (check-in)'},
                    {color:'#dc2626', label:'Complet'},
                    {color:'#fecaca', label:'Réservée', border:true},
                    {color:CYAN,      label:'Départ'},
                    {color:`${CYAN}25`, label:'Séjour', border:true},
                    {color:'#fef3c7', label:"Auj.", border:true},
                ].map(l=>(
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{background:l.color, border:l.border?'1px solid #e2e8f0':'none'}}/>
                        <span className="text-[10px] text-gray-400 font-semibold">{l.label}</span>
                    </div>
                ))}
                {checkIn && checkOut && (
                    <div className="ml-auto flex items-center gap-2 text-xs font-bold" style={{color:NAVY}}>
                        <Moon size={12} style={{color:CYAN}}/>
                        {Math.max(1,Math.ceil((new Date(checkOut)-new Date(checkIn))/86400000))} nuits sélectionnées
                    </div>
                )}
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 flex-none">
                {WEEK_DAYS.map(d=>(
                    <div key={d} className="py-2 text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</span>
                    </div>
                ))}
            </div>

            {/* Grille */}
            <div className="grid grid-cols-7 flex-1" style={{gridAutoRows:'1fr'}}>
                {calendarDays.map((day, i) => {
                    const avail=getAvail(day.date)
                    const past=isPast(day.date)
                    const today=isToday(day.date)
                    const dn=normalize(day.date)
                    const isCI=checkIn&&dn.toDateString()===normalize(checkIn).toDateString()
                    const isCO=checkOut&&dn.toDateString()===normalize(checkOut).toDateString()
                    const inRange=!!(checkIn&&checkOut&&dn>normalize(checkIn)&&dn<normalize(checkOut))
                    const inHover=isInHover(day.date)
                    const arrivals=getArrivals(day.date)
                    const departures=getDepartures(day.date)
                    const res=getResForDate(day.date)

                    const isOccupiedToday = day.isCurrentMonth && !past && res.some(r => r.status === 'CHECKIN')
                    const isReservedToday = day.isCurrentMonth && !past && !isOccupiedToday && res.some(r => r.status === 'CONFIRMEE' || r.status === 'EN_ATTENTE')
                    const full = avail===0 && day.isCurrentMonth && !past
                    const isArrivalCheckin = arrivals.some(r => r.status === 'CHECKIN')

                    let bg='white', textColor='#475569', cursor='pointer', border='transparent', opacity=1
                    if(!day.isCurrentMonth){ bg='#f8fafc'; textColor='#cbd5e1'; cursor='default' }
                    else if(past){ bg='#f8fafc'; textColor='#cbd5e1'; cursor='not-allowed'; opacity=0.6 }
                    else if(isCI){ bg='linear-gradient(135deg,#34d399,#10b981)'; textColor='white'; cursor='pointer' }
                    else if(isCO){ bg=`linear-gradient(135deg,${CYAN},${NAVY})`; textColor='white'; cursor='pointer' }
                    else if(isOccupiedToday){ bg='linear-gradient(135deg,#34d399,#059669)'; textColor='white'; cursor='pointer' }
                    else if(isReservedToday && full){ bg='linear-gradient(135deg,#f87171,#dc2626)'; textColor='white'; cursor='not-allowed' }
                    else if(isReservedToday){ bg='#fee2e2'; textColor='#b91c1c' }
                    else if(full){ bg='#fff1f2'; textColor='#fda4af'; cursor='not-allowed' }
                    else if(inRange){ bg=`${CYAN}18`; textColor=NAVY; border=`${CYAN}40` }
                    else if(inHover){ bg=`${CYAN}10`; textColor=NAVY }
                    else if(today){ bg='#fffbeb'; textColor='#92400e'; border='#fcd34d' }
                    else if(avail<=2){ bg='#fff7ed'; textColor='#c2410c' }

                    const solidHighlight = isCI||isCO||isOccupiedToday||(isReservedToday&&full)
                    const showTooltip = tooltipDate && normalize(tooltipDate).toDateString()===dn.toDateString() && day.isCurrentMonth

                    return (
                        <div key={i}
                             onClick={()=>handleClick(day)}
                             onMouseEnter={()=>{setHover(day.date);setTooltipDate(day.date)}}
                             onMouseLeave={()=>{setHover(null);setTooltipDate(null)}}
                             className="relative border-b border-r border-gray-100 transition-all duration-150 flex flex-col"
                             style={{background:bg, cursor, opacity, boxShadow:border!=='transparent'?`inset 0 0 0 1.5px ${border}`:undefined}}>

                            <div className="flex items-start justify-between p-1.5">
                                <span className={`text-sm font-black leading-none ${today&&!solidHighlight&&!isReservedToday?'w-6 h-6 rounded-full flex items-center justify-center bg-amber-400 text-white text-[11px]':''}`}
                                      style={{color: today&&!solidHighlight&&!isReservedToday ? undefined : textColor}}>
                                    {day.date.getDate()}
                                </span>
                                {day.isCurrentMonth && !past && !full && (
                                    <span className={`text-[9px] font-black px-1 py-0.5 rounded-md leading-none ${
                                        solidHighlight ? 'bg-white/25 text-white' :
                                            avail<=2 ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-600'
                                    }`}>{avail}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-0.5 px-1.5 pb-1 flex-1">
                                {isReservedToday && full && day.isCurrentMonth && (
                                    <div className="flex items-center gap-0.5">
                                        <XCircle size={9} className="text-white/70 shrink-0"/>
                                        <span className="text-[9px] font-bold text-white/90">Complet</span>
                                    </div>
                                )}
                                {full && !isReservedToday && !isOccupiedToday && day.isCurrentMonth && (
                                    <div className="flex items-center gap-0.5">
                                        <XCircle size={9} className="text-red-300 shrink-0"/>
                                        <span className="text-[9px] font-bold text-red-300">Complet</span>
                                    </div>
                                )}
                                {isOccupiedToday && day.isCurrentMonth && (
                                    <div className="flex items-center gap-0.5">
                                        <CheckCircle size={9} className="text-white shrink-0"/>
                                        <span className="text-[9px] font-black text-white">
                                            {isArrivalCheckin ? 'Check-in fait' : 'Occupée'}
                                        </span>
                                    </div>
                                )}
                                {isReservedToday && !full && day.isCurrentMonth && (
                                    <div className="flex items-center gap-0.5">
                                        <AlertTriangle size={9} className="text-red-500 shrink-0"/>
                                        <span className="text-[9px] font-black text-red-600">Réservée</span>
                                    </div>
                                )}
                                {day.isCurrentMonth && arrivals.length>0 && !isOccupiedToday && (
                                    <div className={`text-[9px] font-bold truncate flex items-center gap-0.5 ${solidHighlight?'text-white/80':isReservedToday?'text-red-700':'text-emerald-600'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${solidHighlight?'bg-white/60':isReservedToday?'bg-red-500':'bg-emerald-400'}`}/>
                                        {arrivals.length} IN
                                    </div>
                                )}
                                {day.isCurrentMonth && departures.length>0 && (
                                    <div className={`text-[9px] font-bold truncate flex items-center gap-0.5 ${solidHighlight?'text-white/80':'text-blue-600'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${solidHighlight?'bg-white/60':'bg-blue-400'}`}/>
                                        {departures.length} OUT
                                    </div>
                                )}
                            </div>

                            {isCI && <div className="absolute bottom-0.5 left-0 right-0 text-center"><span className="text-[7px] font-black text-white/80 uppercase">Arrivée</span></div>}
                            {isCO && <div className="absolute bottom-0.5 left-0 right-0 text-center"><span className="text-[7px] font-black text-white/80 uppercase">Départ</span></div>}

                            {showTooltip && res.length>0 && (
                                <div className="absolute left-full top-0 ml-2 z-30 w-52 rounded-2xl bg-white border border-gray-100 shadow-2xl p-3 pointer-events-none"
                                     style={{boxShadow:'0 20px 40px rgba(0,0,0,0.15)'}}>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">{formatDate(day.date)}</p>
                                    <div className="space-y-1.5">
                                        {res.map((r,ri)=>{
                                            const isRA = r.status==='CHECKIN'
                                            const isArr = normalize(r.dateArrivee||r.date_arrivee||0).toDateString()===dn.toDateString()
                                            const isDep = normalize(r.dateDepart||r.date_depart||0).toDateString()===dn.toDateString()
                                            const label = isRA
                                                ? (isArr ? 'Arrivé (check-in fait)' : 'En séjour (occupée)')
                                                : isDep ? 'Départ prévu' : isArr ? 'Arrivée prévue' : 'Réservée (non arrivée)'
                                            const dotBg = isRA ? 'bg-emerald-500' : isDep ? 'bg-blue-100' : 'bg-red-100'
                                            const iconColor = isRA ? 'text-white' : isDep ? 'text-blue-600' : 'text-red-600'
                                            return (
                                                <div key={ri} className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${dotBg}`}>
                                                        <User size={9} className={iconColor}/>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-[10px] font-bold truncate ${isRA?'text-emerald-700':isDep?'text-blue-700':'text-red-700'}`}>{r.clientNom||r.client_nom||'Client'}</p>
                                                        <p className="text-[9px] text-gray-400">{label}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-[9px] text-gray-400 font-semibold">Disponibles</span>
                                        <span className="text-[10px] font-black" style={{color:avail===0?'#ef4444':avail<=2?'#f59e0b':'#22c55e'}}>{avail}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

// ── Reservation Modal ─────────────────────────────────────
const ReservationModal = ({ isOpen, onClose, dateRange, chambres, onSubmit }) => {
    const [form, setForm] = useState({
        clientNom:'', clientPrenom:'', clientEmail:'', clientTelephone:'',
        clientPays:'Maroc', chambreId:'', nombrePersonnes:1,
        notes:'', source:'interne', montantTotal:'', avance:'', methodePaiement:''
    })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    const selectedChambre = useMemo(()=>chambres.find(c=>String(c.id)===String(form.chambreId)), [chambres, form.chambreId])
    const montantAuto = useMemo(()=>{
        if (!selectedChambre) return 0
        const prixEffectif = selectedChambre.prixNuitee ?? selectedChambre.prixBase
        return prixEffectif && dateRange?.nights ? prixEffectif * dateRange.nights : 0
    }, [selectedChambre, dateRange])

    useEffect(()=>{ if(isOpen){ setError(''); setForm(p=>({...p, chambreId:chambres[0]?.id||'', montantTotal:''})) } }, [isOpen, chambres])
    useEffect(()=>{ if(montantAuto>0) setForm(p=>({...p, montantTotal:String(montantAuto)})) }, [montantAuto])

    const F = (field) => ({value:form[field], onChange:e=>setForm(p=>({...p,[field]:e.target.value}))})

    const handleSubmit = async () => {
        if(!form.clientNom.trim()){setError('Le nom du client est obligatoire');return}
        if(!form.clientEmail.trim()){setError("L'email du client est obligatoire");return}
        if(!form.chambreId){setError('Veuillez sélectionner une chambre');return}
        if(Number(form.avance)>0 && !form.methodePaiement){setError('Veuillez choisir une mÃ©thode de paiement de l’avance');return}
        setProcessing(true)
        try { await onSubmit({...form, dateArrivee:formatInput(dateRange?.checkIn), dateDepart:formatInput(dateRange?.checkOut), montantTotal:form.montantTotal||montantAuto}) }
        catch (err) { setError(err.message || 'Erreur lors de la création') }
        finally { setProcessing(false) }
    }

    if(!isOpen||!dateRange) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm py-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden border border-gray-100">
                <div className="relative p-6 overflow-hidden" style={{background:`linear-gradient(135deg,${NAVY},${PURPLE})`}}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Calendar size={15} className="text-white"/>
                                </div>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Nouvelle réservation</p>
                            </div>
                            <h2 className="text-xl font-black text-white">Confirmer la réservation</h2>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                                    <div className="text-center">
                                        <p className="text-[10px] text-white/50 font-semibold uppercase">Arrivée</p>
                                        <p className="text-sm font-black text-white">{formatShort(dateRange.checkIn)}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-white/40 shrink-0"/>
                                    <div className="text-center">
                                        <p className="text-[10px] text-white/50 font-semibold uppercase">Départ</p>
                                        <p className="text-sm font-black text-white">{formatShort(dateRange.checkOut)}</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/20"/>
                                    <div className="flex items-center gap-1">
                                        <Moon size={12} className="text-white/60"/>
                                        <p className="text-sm font-black text-white">{dateRange.nights}</p>
                                        <p className="text-[10px] text-white/50">nuit{dateRange.nights>1?'s':''}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={16} className="text-white"/>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 font-medium"><AlertTriangle size={14}/>{error}</div>}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Informations client</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Nom *</label><input {...F('clientNom')} placeholder="Nom du client" className={ic}/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Prénom</label><input {...F('clientPrenom')} placeholder="Prénom" className={ic}/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Email *</label><input type="email" {...F('clientEmail')} placeholder="email@exemple.com" className={ic}/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Téléphone</label><input {...F('clientTelephone')} placeholder="+212 6XX XXXXXX" className={ic}/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Pays</label><select {...F('clientPays')} className={ic}><option value="Maroc">Maroc</option><option value="France">France</option><option value="Espagne">Espagne</option><option value="Autre">Autre</option></select></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Personnes</label><input type="number" min="1" {...F('nombrePersonnes')} className={ic}/></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Détails du séjour</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                                    Chambre {chambres.length===0&&<span className="text-red-400">— Aucune disponible pour ces dates</span>}
                                </label>
                                <select {...F('chambreId')} className={ic}>
                                    <option value="">Sélectionner...</option>
                                    {chambres.map(c=>{
                                        const prixEffectif = c.prixNuitee ?? c.prixBase
                                        return <option key={c.id} value={c.id}>Chambre {c.numero} {prixEffectif?`— ${prixEffectif} MAD/nuit`:''}</option>
                                    })}
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Source</label><select {...F('source')} className={ic}><option value="interne">Réservation directe</option><option value="booking">Booking.com</option><option value="airbnb">Airbnb</option><option value="agence">Agence</option><option value="site_web">Site web</option></select></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Montant {montantAuto>0&&<span className="text-[#66CAD8]">Auto: {montantAuto}</span>}</label><input type="number" min="0" {...F('montantTotal')} placeholder={String(montantAuto||'0')} className={ic}/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1.5">Avance (MAD)</label><input type="number" min="0" {...F('avance')} placeholder="0" className={ic}/></div>
                            {Number(form.avance)>0 && <div><label className="block text-xs font-bold text-gray-500 mb-1.5">MÃ©thode de paiement *</label><select {...F('methodePaiement')} className={ic}><option value="">Choisir...</option><option value="ESPECE">EspÃ¨ces</option><option value="CARTE">Carte</option><option value="CHEQUE">ChÃ¨que</option><option value="VIREMENT">Virement</option></select></div>}
                            <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1.5">Notes</label><textarea rows={2} {...F('notes')} placeholder="Demandes spéciales..." className={ic}/></div>
                        </div>
                    </div>
                    {Number(form.montantTotal||montantAuto)>0 && (
                        <div className="rounded-2xl p-4" style={{background:`${CYAN}10`,border:`1.5px solid ${CYAN}30`}}>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Total ({dateRange.nights} nuit{dateRange.nights>1?'s':''})</span><span className="font-black text-gray-900">{formatMoney(form.montantTotal||montantAuto)}</span></div>
                                {Number(form.avance) > 0 && <><div className="flex justify-between text-sm"><span className="text-gray-500">Acompte</span><span className="font-bold text-emerald-600">{formatMoney(form.avance)}</span></div><div className="flex justify-between text-sm border-t border-gray-200 pt-2"><span className="font-bold text-gray-600">Reste</span><span className="font-black text-orange-500">{formatMoney((Number(form.montantTotal)||montantAuto)-Number(form.avance))}</span></div></>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} disabled={processing} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">Annuler</button>
                    <button onClick={handleSubmit} disabled={processing||chambres.length===0}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{background:`linear-gradient(135deg,${CYAN},${NAVY})`}}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Confirmer</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Service Modal — recherche client existant / client externe ──
const ServiceModal = ({ isOpen, services, reservations, hotelId, onSubmit, onClose }) => {
    const [clientType, setClientType] = useState('existant')
    const [searchClient, setSearchClient] = useState('')
    const [form, setForm] = useState({
        serviceId: '', reservationId: '', clientNom: '', clientEmail: '', clientTelephone: '',
        serviceDate: '', serviceHeure: '', quantite: 1, notes: ''
    })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setSearchClient('')
            setClientType('existant')
            setForm({
                serviceId: services[0]?.id || '',
                reservationId: '',
                clientNom: '', clientEmail: '', clientTelephone: '',
                serviceDate: new Date().toISOString().slice(0, 10),
                serviceHeure: '', quantite: 1, notes: ''
            })
        }
    }, [isOpen, services])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })
    const selectedService = useMemo(() => services.find(s => String(s.id) === String(form.serviceId)), [services, form.serviceId])
    const prixEstime = selectedService ? Number(selectedService.prix) * Number(form.quantite || 1) : 0

    const filteredReservations = useMemo(() => {
        const q = searchClient.toLowerCase()
        return reservations.filter(r =>
            !q || (r.clientNom || '').toLowerCase().includes(q) || (r.numeroReservation || '').toLowerCase().includes(q)
        ).slice(0, 8)
    }, [reservations, searchClient])

    const selectedReservation = useMemo(() =>
            reservations.find(r => String(r.id) === String(form.reservationId))
        , [reservations, form.reservationId])

    const handleSubmit = async () => {
        if (!form.serviceId) { setError('Veuillez sélectionner un service'); return }
        if (!form.serviceDate) { setError('La date est obligatoire'); return }
        if (clientType === 'existant' && !form.reservationId) { setError('Veuillez sélectionner un client'); return }
        if (clientType === 'externe' && !form.clientNom.trim()) { setError('Le nom du client est obligatoire'); return }
        setProcessing(true)
        try {
            await onSubmit({
                serviceId: Number(form.serviceId),
                hotelId,
                reservationId: clientType === 'existant' ? Number(form.reservationId) : null,
                clientNom: clientType === 'externe' ? form.clientNom.trim() : null,
                clientEmail: clientType === 'externe' ? form.clientEmail || null : null,
                clientTelephone: clientType === 'externe' ? form.clientTelephone || null : null,
                serviceDate: form.serviceDate,
                serviceHeure: form.serviceHeure || null,
                quantite: Number(form.quantite) || 1,
                notes: form.notes || null,
            })
        } catch (err) {
            setError(err.message || 'Erreur lors de la création')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null

    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Nouvelle</p>
                                <h2 className="text-lg font-black text-white">Réservation de service</h2>
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
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Service *</label>
                        <select {...F('serviceId')} className={ic}>
                            <option value="">Sélectionner...</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.nom} — {formatMoney(s.prix)}</option>)}
                        </select>
                        {services.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1"><AlertTriangle size={12}/> Aucun service actif dans le catalogue</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Type de client</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setClientType('existant')}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                        clientType === 'existant' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                    }`}>
                                <Home size={14}/> Client de l'hôtel
                            </button>
                            <button type="button" onClick={() => setClientType('externe')}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                        clientType === 'externe' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                    }`}>
                                <Users size={14}/> Client externe
                            </button>
                        </div>
                    </div>

                    {clientType === 'existant' ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Rechercher un client / réservation</label>
                            <div className="relative mb-2">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Nom ou n° réservation..."
                                       value={searchClient} onChange={e => setSearchClient(e.target.value)}
                                       className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-gray-50"/>
                            </div>
                            {selectedReservation ? (
                                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-[#66CAD8] bg-[#66CAD8]/5">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedReservation.clientNom} {selectedReservation.clientPrenom}</p>
                                        <p className="text-xs text-gray-400 font-mono">{selectedReservation.numeroReservation}</p>
                                    </div>
                                    <button onClick={() => setForm(p => ({ ...p, reservationId: '' }))} className="text-gray-400 hover:text-red-500">
                                        <X size={16}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="max-h-40 overflow-y-auto space-y-1.5">
                                    {filteredReservations.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-3">Aucun résultat</p>
                                    ) : filteredReservations.map(r => (
                                        <button key={r.id} type="button"
                                                onClick={() => { setForm(p => ({ ...p, reservationId: r.id })); setSearchClient('') }}
                                                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-[#66CAD8] hover:bg-gray-50 transition text-left">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{r.clientNom} {r.clientPrenom}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{r.numeroReservation}</p>
                                            </div>
                                            <User size={13} className="text-gray-300"/>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom du client *</label>
                                <input {...F('clientNom')} placeholder="Nom complet" className={ic}/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Email</label>
                                    <input type="email" {...F('clientEmail')} placeholder="email@exemple.com" className={ic}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Téléphone</label>
                                    <input {...F('clientTelephone')} placeholder="+212 6XX XXXXXX" className={ic}/>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Date *</label>
                            <input type="date" {...F('serviceDate')} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Heure</label>
                            <input type="time" {...F('serviceHeure')} className={ic}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Quantité</label>
                            <input type="number" min="1" {...F('quantite')} className={ic}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Notes</label>
                        <textarea rows={2} {...F('notes')} placeholder="Remarques..." className={ic}/>
                    </div>

                    {selectedService && (
                        <div className="rounded-2xl p-4" style={{ background: `${CYAN}10`, border: `1.5px solid ${CYAN}30` }}>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Total estimé</span>
                                <span className="font-black text-gray-900">{formatMoney(prixEstime)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing || services.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Check size={15}/> Ajouter</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════
export default function HebergementCalendrier() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [roomTypes, setRoomTypes]     = useState([])
    const [chambres, setChambres]       = useState([])
    const [reservations, setReservations] = useState([])
    const [services, setServices]       = useState([])
    const [loading, setLoading]           = useState(true)
    const [calendarLoading, setCalendarLoading] = useState(false)
    const [selectedType, setSelectedType]   = useState(null)
    const [selectedRange, setSelectedRange] = useState(null)
    const [currentDate, setCurrentDate]     = useState(new Date())
    const [checkIn, setCheckIn]             = useState(null)
    const [checkOut, setCheckOut]           = useState(null)
    const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false)
    const [showModal, setShowModal]         = useState(false)
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [availableChambres, setAvailableChambres] = useState([])
    const [notification, setNotification]   = useState(null)

    const showNotif = (type, msg) => { setNotification({type,msg}); setTimeout(()=>setNotification(null),4000) }

    const fetchBase = useCallback(async () => {
        setLoading(true)
        try {
            const hebergRes = await hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`).catch(()=>null)
            const h = hebergRes?.data?.data
            setHebergement(h)
            if(h?.id){
                const [typesRes, chambresRes, reservationsRes, servicesRes] = await Promise.all([
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambre-types`).catch(()=>null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/chambres`).catch(()=>null),
                    bookingAxios.get(`/booking/reservations/hotel/${h.id}`).catch(()=>null),
                    hebergementAxios.get(`/hebergement/hebergements/${h.id}/services`).catch(()=>null),
                ])
                const types = typesRes?.data?.data||[]
                const allChambres = chambresRes?.data?.data||[]
                const typesWithAvail = types.map(t=>{
                    const ct=allChambres.filter(c=>c.chambreTypeId===t.id||c.chambreType?.id===t.id)
                    return{...t, nombreChambres:ct.length, chambresDisponibles:ct.filter(c=>c.status==='DISPONIBLE').length}
                })
                setRoomTypes(typesWithAvail)
                setChambres(allChambres)
                setReservations(reservationsRes?.data?.data||[])
                setServices((servicesRes?.data?.data||[]).filter(s=>s.isActive))
            }
        } catch(err){console.error(err)}
        finally{setLoading(false)}
    }, [userId])

    useEffect(()=>{fetchBase()},[fetchBase])

    const chambresOfType = useMemo(()=>{
        if(!selectedType) return []
        return chambres.filter(c=>c.chambreTypeId===selectedType.id||c.chambreType?.id===selectedType.id)
    }, [chambres, selectedType])

    const isChambreFreeForRange = useCallback((chambreId, start, end) => {
        if (!reservations?.length) return true
        const s = normalize(start)
        const e = normalize(end)
        return !reservations.some(r => {
            if (r.status === 'ANNULEE' || r.status === 'NO_SHOW') return false
            if ((r.chambreId ?? r.chambre_id) !== chambreId) return false
            const rs = normalize(r.dateArrivee || r.date_arrivee || 0)
            const re = normalize(r.dateDepart || r.date_depart || 0)
            return s < re && rs < e
        })
    }, [reservations])

    const handleTypeSelect = useCallback((type)=>{
        setSelectedType(type); setSelectedRange(null)
        setCheckIn(null); setCheckOut(null); setIsSelectingCheckOut(false); setAvailableChambres([])
    }, [])

    const handleDateRangeSelect = useCallback((range)=>{
        setSelectedRange(range)
        const dispo = chambresOfType.filter(c =>
            c.status !== 'HORS_SERVICE' &&
            isChambreFreeForRange(c.id, range.checkIn, range.checkOut)
        )
        if(!dispo.length){showNotif('error','Aucune chambre disponible pour ces dates');return}
        setAvailableChambres(dispo); setShowModal(true)
    }, [chambresOfType, isChambreFreeForRange])

    const handleSubmit = async (form) => {
        try {
            const payload = {
                hotelId: hebergement.id,
                chambreId: form.chambreId ? Number(form.chambreId) : null,
                chambreTypeId: selectedType?.id || null,
                clientNom: form.clientNom,
                clientPrenom: form.clientPrenom || '',
                clientEmail: form.clientEmail,
                clientTelephone: form.clientTelephone || '',
                dateArrivee: form.dateArrivee,
                dateDepart: form.dateDepart,
                nbAdultes: Number(form.nombrePersonnes) || 1,
                nbEnfants: 0,
                prixTotal: Number(form.montantTotal) || 0,
                source: SOURCE_MAP[form.source] || 'DIRECT',
                notes: form.notes || '',
            }
            const response = await bookingAxios.post('/booking/reservations/create', payload)
            const reservationId = response?.data?.data?.id
            if (reservationId && Number(form.avance) > 0) {
                await bookingAxios.post(`/booking/reservations/${reservationId}/paiement`, {
                    montant: Number(form.avance), methode: form.methodePaiement
                })
            }
            setShowModal(false); setCheckIn(null); setCheckOut(null); setIsSelectingCheckOut(false); setSelectedRange(null)
            showNotif('success','Réservation créée avec succès !'); await fetchBase()
        } catch(err){ throw new Error(err.response?.data?.message||'Erreur lors de la création') }
    }

    const handleCreateService = async (payload) => {
        try {
            await bookingAxios.post('/booking/reservations-services/create', payload)
            setShowServiceModal(false)
            showNotif('success', 'Service réservé !')
            await fetchBase()
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erreur lors de l\'ajout du service')
        }
    }

    if(loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl" style={{background:`linear-gradient(135deg,${CYAN},${NAVY})`}}>
                <Calendar size={28} className="text-white"/>
            </div>
            <div className="text-center">
                <p className="font-black text-gray-700 text-lg">Calendrier PMS</p>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2 justify-center"><RefreshCw size={13} className="animate-spin"/>Chargement...</p>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden gap-4">

            {notification && (
                <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm border ${
                    notification.type==='success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {notification.type==='success'?<Check size={15}/>:<AlertTriangle size={15}/>}
                    <span className="flex-1">{notification.msg}</span>
                    <button onClick={()=>setNotification(null)} className="opacity-50 hover:opacity-100 text-lg">×</button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between flex-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                         style={{background:`linear-gradient(135deg,${CYAN},${NAVY})`}}>
                        <Calendar className="h-5 w-5"/>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900">Calendrier PMS</h1>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dashboard Opérationnel</p>
                        </div>
                    </div>
                </div>
                <WizardSteps selectedType={selectedType} selectedRange={selectedRange}/>
                <div className="flex items-center gap-2">
                    {selectedType && (
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold"
                             style={{borderColor:`${CYAN}40`,color:NAVY,background:`${CYAN}08`}}>
                            <CheckCircle size={14} style={{color:CYAN}}/>
                            {selectedType.nom}
                        </div>
                    )}
                    <button onClick={() => setShowServiceModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-black transition hover:shadow-md"
                            style={{ borderColor: `${PURPLE}40`, color: PURPLE, background: `${PURPLE}08` }}>
                        <Sparkles size={16}/> Service
                    </button>
                </div>
            </div>

            <div className="flex gap-4 flex-1 overflow-hidden min-h-0">

                <div className="w-60 flex-none bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col overflow-hidden">
                    <RoomTypeSelector roomTypes={roomTypes} selectedType={selectedType} onSelect={handleTypeSelect}/>
                </div>

                <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    {selectedType ? (
                        <CalendarGrid
                            chambres={chambresOfType}
                            reservations={reservations}
                            onDateRangeSelect={handleDateRangeSelect}
                            isLoading={calendarLoading}
                            currentDate={currentDate}
                            onPrevMonth={()=>setCurrentDate(d=>{const n=new Date(d);n.setMonth(n.getMonth()-1);return n})}
                            onNextMonth={()=>setCurrentDate(d=>{const n=new Date(d);n.setMonth(n.getMonth()+1);return n})}
                            onToday={()=>setCurrentDate(new Date())}
                            checkIn={checkIn} checkOut={checkOut}
                            isSelectingCheckOut={isSelectingCheckOut}
                            onCheckInChange={setCheckIn} onCheckOutChange={setCheckOut}
                            onSelectingChange={setIsSelectingCheckOut}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center select-none px-8 text-center">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                                 style={{background:`linear-gradient(135deg,${CYAN}15,${PURPLE}15)`}}>
                                <Calendar size={36} style={{color:CYAN}} className="opacity-50"/>
                            </div>
                            <h2 className="text-lg font-black text-gray-600 mb-1">Sélectionnez un type de chambre</h2>
                            <p className="text-sm text-gray-400 mb-5">dans la sidebar pour afficher le calendrier</p>
                            {roomTypes.length>0 && (
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {roomTypes.map(t=>(
                                        <button key={t.id} onClick={()=>handleTypeSelect(t)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all hover:shadow-md hover:-translate-y-0.5"
                                                style={{borderColor:`${CYAN}40`,color:NAVY,background:`${CYAN}08`}}>
                                            <Bed size={13} style={{color:CYAN}}/>{t.nom}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ReservationModal
                isOpen={showModal&&!!selectedRange}
                onClose={()=>{setShowModal(false);setSelectedRange(null);setCheckIn(null);setCheckOut(null);setIsSelectingCheckOut(false)}}
                dateRange={selectedRange} chambres={availableChambres} onSubmit={handleSubmit}
            />
            <ServiceModal
                isOpen={showServiceModal}
                services={services}
                reservations={reservations}
                hotelId={hebergement?.id}
                onSubmit={handleCreateService}
                onClose={() => setShowServiceModal(false)}
            />
        </div>
    )
}

import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
    Calendar, BedDouble, Users, CreditCard, FileText,
    Zap, RefreshCw, Bell, Users2, CreditCard as Sub,
    Activity, Info, ChevronDown, LogOut, User,
    MessageSquare, Menu, X, Home, Settings, Tag, LayoutDashboard
} from 'lucide-react'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const NAV_ITEMS = [
    {
        label: 'Réservations',
        icon: Calendar,
        children: [
            { label: 'Réservations',  path: '/hotel/reservations', icon: Calendar,     desc: 'Gérer toutes les réservations' },
            { label: 'Calendrier',    path: '/hotel/calendrier',   icon: Calendar,     desc: 'Vue calendrier des séjours' },
        ]
    },
    {
        label: 'Chambres',
        icon: BedDouble,
        children: [
            { label: 'Chambres',           path: '/hotel/chambres',            icon: BedDouble,       desc: 'Gestion des chambres' },
            { label: 'Types de chambres',  path: '/hotel/roomstype',           icon: BedDouble,       desc: 'Catégories et tarifs' },
            { label: 'Services',           path: '/hotel/services',            icon: Settings,        desc: 'Services additionnels' },
            { label: 'Tarifs saisonniers', path: '/hotel/tarifs-saisonniers',  icon: Tag,             desc: 'Prix selon les saisons' },
            { label: 'PMS',                path: '/hotel/pms',                 icon: LayoutDashboard, desc: "Vue d'ensemble chambres" },
        ]
    },
    {
        label: 'Clients',
        icon: Users,
        children: [
            { label: 'Clients',   path: '/hotel/clients',   icon: Users,         desc: 'Base clients' },
            { label: 'Messages',  path: '/hotel/messages',  icon: MessageSquare, desc: 'Messagerie clients' },
        ]
    },
    {
        label: 'Finance',
        icon: CreditCard,
        children: [
            { label: 'Paiements', path: '/hotel/paiements', icon: CreditCard, desc: 'Suivi des paiements' },
            { label: 'Factures',  path: '/hotel/factures',  icon: FileText,   desc: 'Gestion des factures' },
        ]
    },
    {
        label: 'Canaux',
        icon: Zap,
        children: [
            { label: 'Booking Engine',   path: '/hotel/booking-engine',  icon: Zap,        desc: 'Version publique en ligne' },
            { label: 'Channel Manager',  path: '/hotel/channel-manager', icon: RefreshCw,  desc: 'Gestion OTA et synchronisation' },
        ]
    },
    {
        label: 'Opérations',
        icon: Activity,
        children: [
            { label: 'Notifications', path: '/hotel/notifications',  icon: Bell,      desc: 'Alertes système' },
            { label: 'Employés',      path: '/hotel/employees',      icon: Users2,    desc: 'Gestion équipe hôtel' },
            { label: 'Abonnements',   path: '/hotel/subscriptions',  icon: Sub,       desc: 'État et historique' },
            { label: 'Logs activité', path: '/hotel/activity-logs',  icon: Activity,  desc: 'Traçabilité des actions' },
            { label: 'Infos',         path: '/hotel/info',           icon: Info,      desc: 'Informations établissement' },
        ]
    },
]

const DropdownMenu = ({ item, onClose }) => {
    const location = useLocation()
    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="p-2">
                {item.children.map((child, i) => {
                    const Icon = child.icon
                    const active = location.pathname === child.path
                    return (
                        <Link key={i} to={child.path} onClick={onClose}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                                  active ? 'text-white' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                              style={active ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                active ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                <Icon size={15} style={{ color: active ? 'white' : CYAN }}/>
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-800'}`}>{child.label}</p>
                                <p className={`text-xs ${active ? 'text-white/70' : 'text-gray-400'}`}>{child.desc}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default function HebergementLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [activeMenu, setActiveMenu] = useState(null)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const navRef = useRef(null)
    const profileRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) setActiveMenu(null)
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const toggleMenu = (label) => setActiveMenu(prev => prev === label ? null : label)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Navbar ── */}
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="flex items-center h-16 gap-6">
                        {/* Logo */}
                        <Link to="/hotel" className="flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                <Home size={16}/>
                            </div>
                            <span className="font-black text-lg hidden sm:block"
                                  style={{ color: NAVY }}>
                                LUX<span style={{ color: CYAN }}>TECH</span>
                            </span>
                        </Link>

                        {/* Nom établissement */}
                        <div className="hidden lg:block border-l border-gray-200 pl-4">
                            <p className="text-xs text-gray-400">Établissement</p>
                            <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">
                                {user?.nomEtablissement || 'Mon hébergement'}
                            </p>
                        </div>

                        {/* Nav items */}
                        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" ref={navRef}>
                            {NAV_ITEMS.map(item => {
                                const Icon = item.icon
                                const isActive = item.children.some(c => location.pathname.startsWith(c.path))
                                const isOpen = activeMenu === item.label
                                return (
                                    <div key={item.label} className="relative">
                                        <button onClick={() => toggleMenu(item.label)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                                                    isActive || isOpen
                                                        ? 'text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                                style={isActive || isOpen ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                            <Icon size={15}/>
                                            {item.label}
                                            <ChevronDown size={13} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
                                        </button>
                                        {isOpen && <DropdownMenu item={item} onClose={() => setActiveMenu(null)}/>}
                                    </div>
                                )
                            })}
                        </nav>

                        {/* Right */}
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                            {/* Notifications */}
                            <button onClick={() => navigate('/hotel/notifications')}
                                    className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
                                <Bell size={18} className="text-gray-600"/>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                      style={{ background: CYAN }}/>
                            </button>

                            {/* Profil */}
                            <div className="relative" ref={profileRef}>
                                <button onClick={() => setProfileOpen(v => !v)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                        {user?.prenom?.[0]}{user?.nom?.[0]}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-xs font-bold text-gray-800">{user?.prenom} {user?.nom}</p>
                                        <p className="text-[10px] text-gray-400">{user?.role?.replace(/_/g, ' ')}</p>
                                    </div>
                                    <ChevronDown size={13} className="text-gray-400 hidden sm:block"/>
                                </button>
                                {profileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="font-bold text-gray-900 text-sm">{user?.prenom} {user?.nom}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        <button onClick={() => { navigate('/hotel/profil'); setProfileOpen(false) }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                                            <User size={15} className="text-gray-400"/> Mon profil
                                        </button>
                                        <button onClick={() => { navigate('/hotel/info'); setProfileOpen(false) }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                                            <Info size={15} className="text-gray-400"/> Mon établissement
                                        </button>
                                        <div className="border-t border-gray-100"/>
                                        <button onClick={() => { logout(); navigate('/login') }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                                            <LogOut size={15}/> Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <button onClick={() => setMobileOpen(v => !v)}
                                    className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
                                {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white">
                        <div className="max-w-screen-xl mx-auto px-4 py-3 space-y-1">
                            {NAV_ITEMS.map(item => (
                                <div key={item.label}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-3 pb-1">{item.label}</p>
                                    {item.children.map((child, i) => {
                                        const Icon = child.icon
                                        const active = location.pathname === child.path
                                        return (
                                            <Link key={i} to={child.path}
                                                  onClick={() => setMobileOpen(false)}
                                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                                                      active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                                                  }`}
                                                  style={active ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                                <Icon size={15}/> {child.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            ))}
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <button onClick={() => { logout(); navigate('/login') }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition">
                                    <LogOut size={15}/> Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Content ── */}
            <main className="max-w-screen-xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}
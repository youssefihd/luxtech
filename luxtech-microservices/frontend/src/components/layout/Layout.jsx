import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
    LayoutDashboard, Users, Building2, Handshake, Settings, LogOut,
    BedDouble, Calendar, BarChart2, CreditCard, Bell, MessageSquare,
    Globe, Zap, FileText, Tag, ShieldCheck, ChevronDown,
    ChevronRight, Menu, X, Hotel, Compass, Wallet, ClipboardList,
    RefreshCw, Star, Map, Percent, AlertTriangle, Tent, Home,
    TreePine, Landmark, UtensilsCrossed, Train, Building, User
} from 'lucide-react'

const NAVY = '#1D2252'
const CYAN = '#66CAD8'
const PURPLE = '#5D2E8B'

const NavGroup = ({ label, icon: Icon, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen)
    const location = useLocation()
    const isActive = children.some(c => location.pathname.startsWith(c.to))

    return (
        <div>
            <button onClick={() => setOpen(v => !v)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'text-white bg-white/15' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}>
                <Icon size={16} className="shrink-0"/>
                <span className="flex-1 text-left">{label}</span>
                {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
            {open && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                    {children.map(c => <NavLink key={c.to} {...c} sub />)}
                </div>
            )}
        </div>
    )
}

const NavLink = ({ to, label, icon: Icon, sub = false }) => {
    const { pathname } = useLocation()
    const active = sub
        ? pathname === to
        : (pathname === to || (to !== '/admin' && to !== '/hotel' && to !== '/agence' && pathname.startsWith(to)))
    return (
        <Link to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active ? 'text-white shadow-sm' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              style={active ? { background: `linear-gradient(135deg, ${CYAN}55, ${PURPLE}55)` } : {}}>
            {Icon && <Icon size={sub ? 14 : 16} className="shrink-0"/>}
            <span>{label}</span>
        </Link>
    )
}

const NavSeparator = ({ label }) => (
    <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70">{label}</p>
    </div>
)

export default function Layout() {
    const { user, logout, isRole } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const profilePath = isRole('SUPER_ADMIN') ? '/admin/profil'
        : isRole('HEBERGEMENT_ADMIN', 'HEBERGEMENT_STAFF') ? '/hotel/profil'
            : '/agence/profil'

    const adminNav = (
        <>
            <NavSeparator label="Vue generale" />
            <NavLink to="/admin" label="Dashboard" icon={LayoutDashboard} />
            <NavLink to="/admin/users" label="Utilisateurs" icon={Users} />

            <NavSeparator label="Partenaires" />
            <NavGroup label="Hebergements" icon={Building2}>
                {[
                    { to: '/admin/hebergements/hotel',     label: 'Hotels',                icon: Hotel },
                    { to: '/admin/hebergements/riad',      label: 'Riads',                 icon: Star },
                    { to: '/admin/hebergements/maison',    label: "Maisons d'hotes",       icon: Home },
                    { to: '/admin/hebergements/gite',      label: 'Gites',                 icon: TreePine },
                    { to: '/admin/hebergements/auberge',   label: 'Auberges',              icon: Landmark },
                    { to: '/admin/hebergements/camping',   label: 'Campings',              icon: Tent },
                    { to: '/admin/hebergements/ferme',     label: 'Fermes',                icon: Map },
                    { to: '/admin/hebergements/pension',   label: 'Pensions',              icon: UtensilsCrossed },
                    { to: '/admin/hebergements/relais',    label: 'Relais',                icon: Train },
                    { to: '/admin/hebergements/residence', label: 'Residences hotelières', icon: Building },
                ]}
            </NavGroup>
            <NavGroup label="Agences de voyage" icon={Handshake}>
                {[
                    { to: '/admin/agences/receptives', label: 'Agences receptives', icon: Compass },
                    { to: '/admin/agences/emettrices', label: 'Agences emettrices', icon: Globe },
                ]}
            </NavGroup>

            <NavSeparator label="Reservations et Paiements" />
            <NavLink to="/admin/reservations"    label="Reservations"      icon={Calendar} />
            <NavLink to="/admin/paiements"       label="Paiements"         icon={CreditCard} />
            <NavLink to="/admin/commissions"     label="Commissions"       icon={Percent} />
            <NavLink to="/admin/reversements"    label="Reversements"      icon={Wallet} />
            <NavLink to="/admin/factures"        label="Factures"          icon={FileText} />

            <NavSeparator label="Distribution" />
            <NavLink to="/admin/channel-manager" label="Channel Manager"   icon={RefreshCw} />
            <NavLink to="/admin/booking-engine"  label="Booking Engine"    icon={Zap} />
            <NavLink to="/admin/distribution"    label="Canaux de vente"   icon={Globe} />

            <NavSeparator label="Analytique" />
            <NavLink to="/admin/rapports"        label="Rapports"          icon={BarChart2} />
            <NavLink to="/admin/alertes"         label="Alertes et Litiges" icon={AlertTriangle} />

            <NavSeparator label="Configuration" />
            <NavLink to="/admin/notifications"   label="Notifications"     icon={Bell} />
            <NavLink to="/admin/messagerie"      label="Messagerie"        icon={MessageSquare} />
            <NavLink to="/admin/securite"        label="Securite et Acces"  icon={ShieldCheck} />
            <NavLink to="/admin/parametres"      label="Parametres"        icon={Settings} />
        </>
    )

    const hotelNav = (
        <>
            <NavSeparator label="Vue generale" />
            <NavLink to="/hotel" label="Dashboard" icon={LayoutDashboard} />
            <NavSeparator label="Gestion" />
            <NavLink to="/hotel/reservations"    label="Reservations"       icon={Calendar} />
            <NavLink to="/hotel/chambres"        label="Chambres"           icon={BedDouble} />
            <NavLink to="/hotel/disponibilites"  label="Disponibilites"     icon={ClipboardList} />
            <NavSeparator label="Finance" />
            <NavLink to="/hotel/paiements"       label="Paiements"          icon={CreditCard} />
            <NavLink to="/hotel/factures"        label="Factures"           icon={FileText} />
            <NavLink to="/hotel/reversements"    label="Reversements"       icon={Wallet} />
            <NavSeparator label="Distribution" />
            <NavLink to="/hotel/channel-manager" label="Channel Manager"    icon={RefreshCw} />
            <NavLink to="/hotel/tarifs"          label="Tarifs et Promotions" icon={Tag} />
            <NavSeparator label="Analytique" />
            <NavLink to="/hotel/rapports"        label="Rapports"           icon={BarChart2} />
            <NavSeparator label="Mon etablissement" />
            <NavLink to="/hotel/messagerie"      label="Messagerie"         icon={MessageSquare} />
            <NavLink to="/hotel/notifications"   label="Notifications"      icon={Bell} />
            <NavLink to="/hotel/profil"          label="Profil hebergement" icon={Settings} />
        </>
    )

    const agenceNav = (
        <>
            <NavSeparator label="Vue generale" />
            <NavLink to="/agence" label="Dashboard" icon={LayoutDashboard} />
            <NavSeparator label="Reservations" />
            <NavLink to="/agence/recherche"      label="Rechercher des chambres" icon={Compass} />
            <NavLink to="/agence/reservations"   label="Mes reservations"        icon={Calendar} />
            <NavLink to="/agence/clients"        label="Clients"                 icon={Users} />
            <NavSeparator label="Finance" />
            <NavLink to="/agence/factures"       label="Factures"     icon={FileText} />
            <NavLink to="/agence/commissions"    label="Commissions"  icon={Percent} />
            <NavLink to="/agence/paiements"      label="Paiements"    icon={CreditCard} />
            <NavSeparator label="Analytique" />
            <NavLink to="/agence/rapports"       label="Rapports"     icon={BarChart2} />
            <NavSeparator label="Mon agence" />
            <NavLink to="/agence/messagerie"     label="Messagerie"    icon={MessageSquare} />
            <NavLink to="/agence/notifications"  label="Notifications" icon={Bell} />
            <NavLink to="/agence/profil"         label="Mon agence"    icon={Settings} />
        </>
    )

    const nav = isRole('SUPER_ADMIN') ? adminNav
        : isRole('HEBERGEMENT_ADMIN', 'HEBERGEMENT_STAFF') ? hotelNav
            : agenceNav

    const title = isRole('SUPER_ADMIN') ? 'Administration'
        : isRole('HEBERGEMENT_ADMIN', 'HEBERGEMENT_STAFF') ? 'Gestion Hebergement'
            : 'Espace Agence'

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 flex flex-col transition-all duration-300 overflow-hidden`}
                   style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #10182A 100%)` }}>

                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-7"
                             onError={e => {
                                 e.target.style.display = 'none'
                                 e.target.parentElement.innerHTML += `<span style="font-size:18px;font-weight:900;color:white">LUX<span style="color:${CYAN}">TECH</span></span>`
                             }}/>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)}
                            className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
                        <X size={16}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {nav}
                    <div className="h-4"/>
                </div>

                <div className="shrink-0 p-3 border-t border-white/10"
                     style={{ background: `linear-gradient(180deg, transparent, #10182A)` }}>
                    <button onClick={() => navigate(profilePath)}
                            className="w-full flex items-center gap-2 mb-2 px-2 py-2 rounded-xl hover:bg-white/10 transition text-left">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                             style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                            {user?.prenom?.[0]}{user?.nom?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{user?.prenom} {user?.nom}</p>
                            <p className="text-[10px] text-blue-400 truncate">{user?.email}</p>
                        </div>
                        <User size={13} className="text-blue-400 shrink-0"/>
                    </button>
                    <button onClick={() => { logout(); navigate('/login') }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-200 hover:text-white hover:bg-white/10 transition">
                        <LogOut size={14}/> Deconnexion
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition">
                                <Menu size={18} className="text-gray-600"/>
                            </button>
                        )}
                        <h1 className="font-semibold text-gray-800">{title}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white hidden sm:block"
                              style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                            {user?.role?.replace(/_/g, ' ')}
                        </span>

                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileMenuOpen(v => !v)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                     style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                    {user?.prenom?.[0]}{user?.nom?.[0]}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {user?.prenom} {user?.nom}
                                </span>
                                <ChevronDown size={14} className="text-gray-400"/>
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900 text-sm">{user?.prenom} {user?.nom}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <button onClick={() => { navigate(profilePath); setProfileMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        <User size={15} className="text-gray-400"/> Mon profil
                                    </button>
                                    <button onClick={() => { navigate(profilePath + '?tab=securite'); setProfileMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        <ShieldCheck size={15} className="text-gray-400"/> Securite
                                    </button>
                                    <div className="border-t border-gray-100"/>
                                    <button onClick={() => { logout(); navigate('/login') }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                                        <LogOut size={15}/> Deconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard, Users, Building2, Handshake, Calendar,
    MessageSquare, LogOut, ChevronLeft, ChevronRight, Bell
} from 'lucide-react'

export default function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const getNavItems = () => {
        const role = user?.role
        if (role === 'SUPER_ADMIN') {
            return [
                { path: '/admin',               label: 'Dashboard',      icon: LayoutDashboard },
                { path: '/admin/users',          label: 'Utilisateurs',   icon: Users },
                { path: '/admin/hotels',         label: 'Hôtels',         icon: Building2 },
                { path: '/admin/agences',        label: 'Agences',        icon: Handshake },
                { path: '/admin/reservations',   label: 'Réservations',   icon: Calendar },
                { path: '/admin/messages',       label: 'Messages',       icon: MessageSquare },
            ]
        }
        if (role === 'HOTEL_ADMIN' || role === 'HOTEL_STAFF') {
            return [
                { path: '/hotel',               label: 'Dashboard',    icon: LayoutDashboard },
                { path: '/hotel/profile',       label: 'Mon Hôtel',    icon: Building2 },
                { path: '/hotel/chambres',      label: 'Chambres',     icon: Building2 },
                { path: '/hotel/reservations',  label: 'Réservations', icon: Calendar },
                { path: '/hotel/messages',      label: 'Messages',     icon: MessageSquare },
            ]
        }
        return [
            { path: '/agence',               label: 'Dashboard',    icon: LayoutDashboard },
            { path: '/agence/reservations',  label: 'Réservations', icon: Calendar },
            { path: '/agence/profile',       label: 'Mon Agence',   icon: Handshake },
            { path: '/agence/messages',      label: 'Messages',     icon: MessageSquare },
        ]
    }

    const navItems = getNavItems()

    const getTitle = () => {
        if (user?.role === 'SUPER_ADMIN') return 'Administration'
        if (user?.role === 'HOTEL_ADMIN' || user?.role === 'HOTEL_STAFF') return 'Gestion Hôtel'
        return 'Espace Agence'
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>

            {/* ── Sidebar ─────────────────────────────────── */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col shrink-0 transition-all duration-300`}
                   style={{ background: 'linear-gradient(180deg, #1D2252 0%, #10182A 100%)' }}>

                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                    {sidebarOpen && (
                        <div className="cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
                            <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-8 w-auto"
                                 onError={e => {
                                     e.target.style.display = 'none'
                                     e.target.parentElement.innerHTML = `<span style="font-size:20px;font-weight:900;color:white">LUX<span style="color:#66CAD8">TECH</span></span>`
                                 }} />
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10">
                        {sidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
                    </button>
                </div>

                {/* Role badge */}
                {sidebarOpen && (
                    <div className="px-4 py-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: '#66CAD8', color: '#1D2252' }}>
                            {getTitle()}
                        </span>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.icon
                        return (
                            <NavLink key={item.path} to={item.path}
                                     end={item.path === '/admin' || item.path === '/hotel' || item.path === '/agence'}
                                     className={({ isActive }) =>
                                         `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                             isActive
                                                 ? 'text-white'
                                                 : 'text-white/50 hover:text-white hover:bg-white/5'
                                         }`
                                     }
                                     style={({ isActive }) => isActive
                                         ? { background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }
                                         : {}
                                     }>
                                <Icon size={18} className="shrink-0"/>
                                {sidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* User + Logout */}
                <div className="px-2 py-3 border-t border-white/10">
                    {sidebarOpen && user && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                 style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                {user.prenom?.[0]}{user.nom?.[0]}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-medium truncate">{user.prenom} {user.nom}</p>
                                <p className="text-white/40 text-xs truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-red-500/20 transition-all">
                        <LogOut size={18} className="shrink-0"/>
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
                    <h1 className="font-bold text-gray-900">{getTitle()}</h1>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition">
                            <Bell size={16}/>
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                 style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
                                {user?.prenom?.[0]}{user?.nom?.[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.prenom} {user?.nom}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: '#EEF9FB', color: '#66CAD8' }}>
                                {user?.role?.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
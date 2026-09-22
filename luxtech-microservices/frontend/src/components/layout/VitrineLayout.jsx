import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Layout utilisé par toutes les pages vitrine (About, Solutions, Pricing, Contact...)
// Il inclut la Navbar et passe les callbacks login/register

const VitrineLayout = ({ children, onLoginClick, onRegisterClick }) => {
    const navigate  = useNavigate()
    const location  = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const navItems = [
        { label: 'Accueil',   path: '/' },
        { label: 'À Propos',  path: '/about' },
        { label: 'Solutions', path: '/solutions' },
        { label: 'Tarifs',    path: '/pricing' },
        { label: 'Contact',   path: '/contact' },
    ]

    return (
        <>
            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <div className="cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-10 w-auto hover:scale-105 transition-transform"
                                 onError={e => {
                                     e.target.style.display = 'none'
                                     e.target.parentElement.innerHTML = `<span style="font-size:22px;font-weight:900;color:#1D2252">LUX<span style="color:#66CAD8">TECH</span></span>`
                                 }} />
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map(item => (
                                <button key={item.label} onClick={() => navigate(item.path)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            location.pathname === item.path
                                                ? 'text-[#1D2252] bg-blue-50'
                                                : 'text-gray-700 hover:text-[#5D2E8B] hover:bg-gray-100'
                                        }`}>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="hidden md:flex items-center space-x-3">
                            <button onClick={onLoginClick}
                                    className="text-gray-700 hover:text-[#1D2252] font-medium text-sm transition-colors">
                                Connexion
                            </button>
                            <button onClick={onRegisterClick}
                                    className="text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg hover:scale-105 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                                Inscription
                            </button>
                        </div>

                        {/* Mobile */}
                        <button className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                                onClick={() => setMenuOpen(!menuOpen)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile dropdown */}
                    {menuOpen && (
                        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-lg px-4 py-3 space-y-2">
                            {navItems.map(item => (
                                <button key={item.label} onClick={() => { navigate(item.path); setMenuOpen(false) }}
                                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                                    {item.label}
                                </button>
                            ))}
                            <hr className="border-gray-200 my-2" />
                            <button onClick={() => { onLoginClick(); setMenuOpen(false) }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-gray-700 text-sm">
                                Connexion
                            </button>
                            <button onClick={() => { onRegisterClick(); setMenuOpen(false) }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-white text-sm font-medium"
                                    style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                                Inscription
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Contenu de la page */}
            <main className="pt-16">
                {children}
            </main>
        </>
    )
}

export default VitrineLayout

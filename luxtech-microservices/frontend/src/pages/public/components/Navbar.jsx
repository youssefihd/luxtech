import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { NAVY, PURPLE } from './shared'

const Navbar = ({ onLoginClick, onRegisterClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleNavigation = (path) => {
        navigate(path)
        setIsDropdownOpen(false)
    }

    const navItems = [
        { id: 'home', label: 'Accueil', path: '/' },
        { id: 'about', label: 'À Propos', path: '/about' },
        { id: 'solutions', label: 'Solutions', path: '/solutions' },
        { id: 'pricing', label: 'Tarifs', path: '/pricing' },
        { id: 'contact', label: 'Contact', path: '/contact' },
    ]

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div onClick={() => handleNavigation('/')} className="cursor-pointer flex items-center gap-3 group">
                        <img src="/images/Luxtech_logo.png" alt="LuxTech"
                             className="h-12 transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 drop-shadow-lg"
                             onError={e => {
                                 e.target.style.display = 'none'
                                 e.target.parentElement.innerHTML = `<span style="font-size:22px;font-weight:900;color:${NAVY}">LUX<span style="color:#66CAD8">TECH</span></span>`
                             }}/>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => handleNavigation(item.path)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                        location.pathname === item.path ? 'bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    style={location.pathname === item.path ? { color: NAVY } : {}}>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        <button onClick={onLoginClick} className="text-gray-700 hover:opacity-80 font-medium text-sm transition-colors" style={{ color: NAVY }}>
                            Connexion
                        </button>
                        <button onClick={onRegisterClick}
                                className="text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium text-sm"
                                style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                            Inscription
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {isDropdownOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
                        <div className="px-4 py-3 space-y-2">
                            {navItems.map(item => (
                                <button key={item.id} onClick={() => handleNavigation(item.path)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                                            location.pathname === item.path ? 'bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        style={location.pathname === item.path ? { color: NAVY } : {}}>
                                    {item.label}
                                </button>
                            ))}
                            <div className="border-t border-gray-200 my-2"/>
                            <button onClick={() => { onLoginClick(); setIsDropdownOpen(false) }} className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                                Connexion
                            </button>
                            <button onClick={() => { onRegisterClick(); setIsDropdownOpen(false) }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-white"
                                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                                Inscription
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
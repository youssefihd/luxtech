import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const user = await login(form.email, form.password)
            if (user.role === 'SUPER_ADMIN') navigate('/admin')
            else if (user.role === 'HEBERGEMENT_ADMIN' || user.role === 'HEBERGEMENT_STAFF') navigate('/hotel')
            else if (user.role === 'AGENCY_ADMIN' || user.role === 'AGENCY_STAFF') navigate('/agence')
            else navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
             style={{ background: 'linear-gradient(135deg, #10182A 0%, #1D2252 50%, #10182A 100%)' }}>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

                <div className="p-8 text-white text-center"
                     style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                    <div onClick={() => navigate('/')} className="cursor-pointer mb-4">
                        <img src="/images/Luxtech_logo.png" alt="LuxTech" className="h-10 mx-auto"
                             onError={e => {
                                 e.target.style.display = 'none'
                                 e.target.parentElement.innerHTML = `<div style="font-size:28px;font-weight:900;color:white">LUX<span style="color:#66CAD8">TECH</span></div>`
                             }} />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Connexion</h1>
                    <p className="text-white/70 text-sm">Accedez a votre espace LuxTech</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" required placeholder="vous@entreprise.ma"
                                       value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                       className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66CAD8] text-sm transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                                       value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                       className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66CAD8] text-sm transition" />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                                className="w-full py-3.5 rounded-xl text-white font-bold transition-all hover:shadow-lg active:scale-95 disabled:opacity-70"
                                style={{ background: 'linear-gradient(135deg, #1D2252, #5D2E8B)' }}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="font-semibold hover:underline" style={{ color: '#66CAD8' }}>
                            S'inscrire
                        </Link>
                    </p>

                    <p className="mt-2 text-center text-sm text-gray-600">
                        <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs">
                            Retour a l'accueil
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
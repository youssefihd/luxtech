import { createContext, useContext, useState } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    })
    const [token, setToken] = useState(() => localStorage.getItem('token'))

    const login = async (email, password) => {
        const res = await authApi.login({ email, password })
        const { accessToken, user: userData } = res.data.data
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(accessToken)
        setUser(userData)
        return userData
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    const isRole = (...roles) => roles.includes(user?.role)

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isRole }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
import axios from 'axios'

// ── Instance Auth Service (port 8081) ─────────────────────
const instance = axios.create({
    baseURL: 'http://localhost:8081/api',
    headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default instance

export const chatbotAxios = axios.create({
    baseURL: 'http://localhost:8089/api',
    headers: { 'Content-Type': 'application/json' },
})

// ── Instance Hebergement Service (port 8082) ──────────────
export const hebergementAxios = axios.create({
    baseURL: 'http://localhost:8082/api',
    headers: { 'Content-Type': 'application/json' },
})

hebergementAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                const userId = user?.id_utilisateur || user?.id
                if (userId) config.headers['X-User-Id'] = String(userId)
            } catch (_) {}
        }
        return config
    },
    (error) => Promise.reject(error)
)

hebergementAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ── Instance Booking Service (port 8083) ──────────────────
export const bookingAxios = axios.create({
    baseURL: 'http://localhost:8083/api',
    headers: { 'Content-Type': 'application/json' },
})

bookingAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                const userId = user?.id_utilisateur || user?.id
                if (userId) config.headers['X-User-Id'] = String(userId)
            } catch (_) {}
        }
        return config
    },
    (error) => Promise.reject(error)
)

bookingAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ── Instance Notification Service (port 8086) ─────────────
export const notificationAxios = axios.create({
    baseURL: 'http://localhost:8086/api',
    headers: { 'Content-Type': 'application/json' },
})

notificationAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                const userId = user?.id_utilisateur || user?.id
                if (userId) config.headers['X-User-Id'] = String(userId)
            } catch (_) {}
        }
        return config
    },
    (error) => Promise.reject(error)
)

notificationAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)


// ── Instance Message Service (port 8088) ──────────────────
export const messageAxios = axios.create({
    baseURL: 'http://localhost:8088/api',
    headers: { 'Content-Type': 'application/json' },
})

messageAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                const userId = user?.id_utilisateur || user?.id
                if (userId) {
                    const isHebergement = user.role === 'HEBERGEMENT_ADMIN' || user.role === 'HEBERGEMENT_STAFF'
                    const nomAffiche = isHebergement && user.nomEtablissement
                        ? user.nomEtablissement
                        : `${user.prenom || ''} ${user.nom || ''}`.trim()
                    config.headers['X-User-Id']   = String(userId)
                    config.headers['X-User-Nom']  = nomAffiche
                    config.headers['X-User-Role'] = user.role || ''
                }
            } catch (_) {}
        }
        return config
    },
    (error) => Promise.reject(error)
)

messageAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ── Instance Payment Service (port 8084) ──────────────────
export const paymentAxios = axios.create({
    baseURL: 'http://localhost:8084/api',
    headers: { 'Content-Type': 'application/json' },
})

paymentAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                const userId = user?.id_utilisateur || user?.id
                if (userId) config.headers['X-User-Id'] = String(userId)
            } catch (_) {}
        }
        return config
    },
    (error) => Promise.reject(error)
)

paymentAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)
import axios from 'axios'

const GATEWAY_API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const createServiceClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    client.interceptors.request.use(
        (config) => {
            // JWT
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            // User information
            const userStr = localStorage.getItem('user')

            if (userStr) {
                try {
                    const user = JSON.parse(userStr)

                    const userId = user?.id_utilisateur || user?.id

                    if (userId) {
                        config.headers['X-User-Id'] = String(userId)
                    }

                    if (user?.agencyId) {
                        config.headers['X-Agency-Id'] = String(user.agencyId)
                    }

                    if (user?.role) {
                        config.headers['X-User-Role'] = String(user.role)
                    }

                } catch (error) {
                    console.error('Erreur lecture user:', error)
                }
            }

            console.log('API REQUEST:', {
                method: config.method,
                url: `${config.baseURL}${config.url}`,
                agencyId: config.headers['X-Agency-Id'],
                role: config.headers['X-User-Role'],
            })

            return config
        },
        (error) => Promise.reject(error)
    )

    client.interceptors.response.use(
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

    return client
}

export const agencyAxios =
    createServiceClient(GATEWAY_API_URL)

export const publicApiAxios =
    createServiceClient(GATEWAY_API_URL)

export const notificationAxios =
    createServiceClient(GATEWAY_API_URL)

// ── Instance Auth Service (port 8081) ─────────────────────
const instance = axios.create({
    baseURL: GATEWAY_API_URL,
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

export const bookingAxios = axios.create({
    // Route booking calls through the gateway for shared CORS and JWT handling.
    baseURL: GATEWAY_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

bookingAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        const userStr = localStorage.getItem('user')

        if (userStr) {
            try {
                const user = JSON.parse(userStr)

                const userId = user?.id_utilisateur || user?.id
                const role = user?.role || user?.roleUtilisateur

                if (userId) {
                    config.headers['X-User-Id'] = String(userId)
                }

                if (role) {
                    config.headers['X-User-Role'] = String(role)
                }

                console.log('BOOKING REQUEST AUTH:', {
                    userId,
                    role,
                    hasToken: !!token,
                    url: config.url,
                })
            } catch (error) {
                console.error('Invalid user in localStorage:', error)
            }
        }

        return config
    },
    (error) => Promise.reject(error)
)

bookingAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('BOOKING ERROR:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
        })

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

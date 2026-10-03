import axios from './axios'

export const hebergementAdminApi = {
    search: (search = '', signal) => axios.get('/auth/admin/users', {
        params: {
            role: 'HEBERGEMENT_ADMIN',
            search: search.trim() || undefined,
        },
        signal,
    }),
    approve: (id) => axios.put(`/auth/admin/users/${id}/approve`),
    reject: (id) => axios.put(`/auth/admin/users/${id}/reject`),
    suspend: (id) => axios.put(`/auth/admin/users/${id}/suspend`),
}

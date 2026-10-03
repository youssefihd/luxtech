import axios from './axios'

export const agencyAdminApi = {
    register: (data) => axios.post('/auth/register', { ...data, role: 'AGENCY_ADMIN' }),
    search: (search = '', signal) => axios.get('/auth/admin/users', {
        params: {
            role: 'AGENCY_ADMIN',
            search: search.trim() || undefined,
        },
        signal,
    }),
    approve: (id) => axios.put(`/auth/admin/users/${id}/approve`),
    reject: (id) => axios.put(`/auth/admin/users/${id}/reject`),
    suspend: (id) => axios.put(`/auth/admin/users/${id}/suspend`),
}

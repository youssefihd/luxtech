import api from './axios'

export const hebergementapi = {
    // ── Hebergements ──────────────────────────────────────
    create:             d        => api.post('/hebergement/hebergements', d),
    getAll:             ()       => api.get('/hebergement/hebergements'),
    getActive:          ()       => api.get('/hebergement/hebergements/active'),
    getMy:              ()       => api.get('/hebergement/hebergements/my'),
    search:             q        => api.get('/hebergement/hebergements/search', { params: { q } }),
    getById:            id       => api.get(`/hebergement/hebergements/${id}`),
    getByUser:          userId   => api.get(`/hebergement/hebergements/by-user/${userId}`),
    update:             (id, d)  => api.put(`/hebergement/hebergements/${id}`, d),
    approve:            id       => api.post(`/hebergement/hebergements/${id}/approve`),
    suspend:            id       => api.post(`/hebergement/hebergements/${id}/suspend`),

    // ── ChambreTypes ──────────────────────────────────────
    createChambreType:  (hid, d) => api.post(`/hebergement/hebergements/${hid}/chambre-types`, d),
    getChambreTypes:    hid      => api.get(`/hebergement/hebergements/${hid}/chambre-types`),
    deleteChambreType:  id       => api.delete(`/hebergement/chambre-types/${id}`),

    // ── Chambres ──────────────────────────────────────────
    createChambre:      d        => api.post('/hebergement/chambres', d),
    getChambres:        hid      => api.get(`/hebergement/hebergements/${hid}/chambres`),
    updateChambreStatus:(id, s)  => api.patch(`/hebergement/chambres/${id}/status`, null, { params: { status: s } }),

    // ── Complete Profile ───────────────────────────────────
    completeProfile:    (userId, data) => api.post('/hebergement/complete-profile', data, {
        headers: { 'X-User-Id': String(userId), 'Content-Type': 'multipart/form-data' }
    }),
}
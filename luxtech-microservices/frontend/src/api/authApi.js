import axios, { hebergementAxios } from './axios'

export const authApi = {
    register: (data) => axios.post('/auth/register', data),
    login: (data) => axios.post('/auth/login', data),
    logout: () => axios.post('/auth/logout'),
    me: () => axios.get('/auth/me'),
    updateProfile: (data) => axios.put('/auth/profile', data),
}

export const hebergementApi = {
    completeProfile: (data) => {
        const formData = new FormData()
        formData.append('chambres', JSON.stringify(data.chambres || []))
        formData.append('infosFinancieres', JSON.stringify(data.infosFinancieres || {}))

        // ── Envoyer nomEtablissement et ville depuis le user connecté ──
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const nomEtablissement = data.nomEtablissement || user.nomEtablissement || ''
        const ville = data.ville || user.ville || ''
        formData.append('nomEtablissement', nomEtablissement)
        formData.append('ville', ville)

        // ── Brouillon d'inscription (adresse, équipements, services, etc.) ──
        const draft = JSON.parse(localStorage.getItem('registrationDraft') || '{}')
        if (draft.adresse) formData.append('adresse', draft.adresse)
        if (draft.codePostal) formData.append('codePostal', draft.codePostal)
        if (draft.telephone) formData.append('telephone', draft.telephone)
        if (draft.etoiles !== undefined && draft.etoiles !== null) formData.append('etoiles', String(draft.etoiles))
        if (draft.lat !== undefined && draft.lat !== null) formData.append('latitude', String(draft.lat))
        if (draft.lng !== undefined && draft.lng !== null) formData.append('longitude', String(draft.lng))

        if (draft.equipements && draft.equipements.length > 0) {
            formData.append('equipements', draft.equipements.join(', '))
        }

        // Fusionne les services cochés (booléens) avec leurs libellés personnalisés
        if (draft.services) {
            const servicesLabels = {
                petitDejeuner: 'Petit-déjeuner inclus',
                parking: 'Parking disponible',
                transfert: 'Transfert aéroport',
                roomService: 'Room service',
            }
            const activeServices = Object.entries(draft.services)
                .filter(([, active]) => active)
                .map(([key]) => draft.servicesCustom?.[key] || servicesLabels[key] || key)
            if (activeServices.length > 0) {
                formData.append('servicesInclus', activeServices.join(', '))
            }
        }

        if (data.photos && data.photos.length > 0) {
            Array.from(data.photos).forEach((photo) => {
                if (photo instanceof File) {
                    formData.append('photos', photo)
                }
            })
        }

        if (data.documents && Object.keys(data.documents).length > 0) {
            Object.entries(data.documents).forEach(([key, file]) => {
                if (file instanceof File) {
                    formData.append('documents', file, key)
                }
            })
        }

        return hebergementAxios.post('/hebergement/complete-profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }).then((res) => {
            // Nettoyage — uniquement si l'envoi a reussi
            localStorage.removeItem('registrationDraft')
            return res
        })
    },

    getProfile: () => hebergementAxios.get('/hebergement/me'),
}

export const hotelApi = hebergementApi

export default authApi
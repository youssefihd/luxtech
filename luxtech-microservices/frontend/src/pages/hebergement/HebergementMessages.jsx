import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
    MessageSquare, Send, Search, RefreshCw, Plus, X, Check, CheckCheck,
    AlertTriangle, User, Users, Home, Mail, Phone, Inbox, MailOpen, ArrowLeft, LifeBuoy
} from 'lucide-react'
import axios, { hebergementAxios, bookingAxios, messageAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY   = '#1D2252'
const CYAN   = '#66CAD8'
const PURPLE = '#5D2E8B'

const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return "À l'instant"
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDayTime = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

const KPICard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="relative rounded-2xl p-5 border-2 border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: color }}/>
        <div className="relative p-2.5 rounded-xl w-fit mb-3" style={{ background: bg }}>
            <Icon className="h-5 w-5" style={{ color }}/>
        </div>
        <p className="relative text-3xl font-black text-gray-900 mb-0.5">{value ?? 0}</p>
        <p className="relative text-sm text-gray-500 font-medium">{title}</p>
    </div>
)

// ══════════════════════════════════════════════════════════
// ONGLET SUPPORT — fil unique direct avec le super admin
// ══════════════════════════════════════════════════════════

const SupportTab = ({ userId }) => {
    const [supportPartner, setSupportPartner] = useState(null)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [wsConnected, setWsConnected] = useState(false)
    const messagesEndRef = useRef(null)
    const stompRef = useRef(null)
    const subsRef = useRef([])

    useEffect(() => {
        init()
        loadWsLibs().then(() => connectWebSocket())
        return () => disconnectWebSocket()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const init = async () => {
        try {
            const res = await axios.get('/auth/admin/users')
            const supers = (res.data?.data || []).filter(u => u.role === 'SUPER_ADMIN')
            if (supers.length === 0) { setLoading(false); return }

            const boite = await messageAxios.get('/messages/boite').catch(() => null)
            const convs = boite?.data?.data?.conversations || []
            const existingConv = convs.find(c => supers.some(s => (s.id_utilisateur || s.id) === c.autreUserId))
            const partner = existingConv
                ? (supers.find(s => (s.id_utilisateur || s.id) === existingConv.autreUserId) || supers[0])
                : supers[0]
            const uid = partner.id_utilisateur || partner.id
            setSupportPartner({ ...partner, uid })
            await loadMessages(uid)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const loadMessages = async (partnerId) => {
        try {
            await messageAxios.post('/messages/lire-tout', {})
            const res = await messageAxios.get(`/messages/conversation/${partnerId}`)
            setMessages(res.data?.data || [])
        } catch (err) { console.error('Erreur messages:', err) }
    }

    const loadWsLibs = () => new Promise((resolve) => {
        if (window.SockJS && window.Stomp) { resolve(); return }
        const s1 = document.createElement('script')
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js'
        s1.onload = () => {
            const s2 = document.createElement('script')
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js'
            s2.onload = resolve
            document.head.appendChild(s2)
        }
        document.head.appendChild(s1)
    })

    const connectWebSocket = () => {
        try {
            const socket = new window.SockJS('http://localhost:8088/ws-messages')
            const client = window.Stomp.over(socket)
            client.debug = null
            client.connect({}, () => {
                setWsConnected(true)
                const sub1 = client.subscribe(`/user/${userId}/queue/messages`, (frame) => {
                    const msg = JSON.parse(frame.body)
                    setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
                })
                const sub2 = client.subscribe(`/user/${userId}/queue/messages/sent`, (frame) => {
                    const msg = JSON.parse(frame.body)
                    setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
                })
                const sub3 = client.subscribe(`/user/${userId}/queue/messages/lu`, (frame) => {
                    const data = JSON.parse(frame.body)
                    setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, isLu: true } : m))
                })
                subsRef.current = [sub1, sub2, sub3]
                stompRef.current = client
            }, () => setWsConnected(false))
        } catch (e) {
            console.warn('WebSocket non disponible:', e)
        }
    }
    const disconnectWebSocket = () => {
        subsRef.current.forEach(s => { try { s.unsubscribe() } catch (_) {} })
        if (stompRef.current?.connected) { try { stompRef.current.disconnect() } catch (_) {} }
    }

    const sendMessage = async () => {
        if (!message.trim() || !supportPartner || sending) return
        setSending(true)
        try {
            await messageAxios.post('/messages', {
                destinataireId: supportPartner.uid,
                destinataireNom: `${supportPartner.prenom} ${supportPartner.nom}`,
                sujet: 'Support',
                contenu: message.trim(),
            })
            setMessage('')
            await loadMessages(supportPartner.uid)
        } catch (err) { console.error('Erreur envoi:', err) }
        finally { setSending(false) }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '65vh' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: CYAN }}/>
            </div>
        )
    }

    if (!supportPartner) {
        return (
            <div className="flex flex-col items-center justify-center text-center" style={{ height: '65vh' }}>
                <LifeBuoy size={32} className="text-gray-300 mb-3"/>
                <p className="text-sm font-bold text-gray-600">Support indisponible</p>
                <p className="text-xs text-gray-400 mt-1">Aucun administrateur n'est actuellement configuré</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: '65vh' }}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                     style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                    {supportPartner.prenom?.[0]}{supportPartner.nom?.[0]}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{supportPartner.prenom} {supportPartner.nom}</p>
                    <p className="text-xs text-gray-500">Support LuxTech</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${wsConnected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {wsConnected ? '● En ligne' : '● Hors ligne'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-400">Aucun message — envoyez le premier message au support</p>
                    </div>
                ) : messages.map(msg => {
                    const isMe = msg.expediteurId === userId
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <p className="text-xs text-gray-500 px-1">{msg.expediteurNom}</p>}
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                    isMe ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                }`} style={isMe ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                    {msg.contenu}
                                </div>
                                <div className="flex items-center gap-1 px-1">
                                    <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                                    {isMe && (msg.isLu ? <CheckCheck size={11} style={{ color: CYAN }}/> : <Check size={11} className="text-gray-400"/>)}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef}/>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <div className="flex items-end gap-3">
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                              placeholder="Écrire un message au support... (Entrée pour envoyer)" rows={2}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm transition resize-none"/>
                    <button onClick={sendMessage} disabled={!message.trim() || sending}
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition hover:shadow-lg disabled:opacity-50 shrink-0"
                            style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {sending ? <RefreshCw size={16} className="animate-spin"/> : <Send size={16}/>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════
// ONGLET CLIENTS — communication avec les clients de l'hôtel
// ══════════════════════════════════════════════════════════

const NewConversationModal = ({ isOpen, reservations, onSubmit, onClose }) => {
    const [clientType, setClientType] = useState('existant')
    const [searchClient, setSearchClient] = useState('')
    const [form, setForm] = useState({ reservationId: '', clientNom: '', clientEmail: '', clientTelephone: '', sujet: '', contenu: '' })
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setClientType('existant'); setSearchClient(''); setError('')
            setForm({ reservationId: '', clientNom: '', clientEmail: '', clientTelephone: '', sujet: '', contenu: '' })
        }
    }, [isOpen])

    const F = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

    const filteredReservations = useMemo(() => {
        const q = searchClient.toLowerCase()
        const seen = new Set()
        return reservations.filter(r => {
            const key = (r.clientEmail || r.clientNom).toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return !q || (r.clientNom || '').toLowerCase().includes(q) || (r.clientEmail || '').toLowerCase().includes(q)
        }).slice(0, 8)
    }, [reservations, searchClient])

    const selectedReservation = useMemo(() =>
            reservations.find(r => String(r.id) === String(form.reservationId))
        , [reservations, form.reservationId])

    const handleSubmit = async () => {
        const nom = clientType === 'existant' ? selectedReservation?.clientNom : form.clientNom
        const email = clientType === 'existant' ? selectedReservation?.clientEmail : form.clientEmail
        if (!nom?.trim()) { setError('Le nom du client est obligatoire'); return }
        if (!form.contenu.trim()) { setError('Le message est obligatoire'); return }
        setProcessing(true)
        try {
            await onSubmit({
                reservationId: clientType === 'existant' ? selectedReservation?.id || null : null,
                clientNom: nom,
                clientEmail: email || '',
                clientTelephone: clientType === 'existant' ? selectedReservation?.clientTelephone : form.clientTelephone,
                sujet: form.sujet || null,
                contenu: form.contenu.trim(),
                deLaPartDuClient: false,
            })
        } catch (err) {
            setError(err.message || "Erreur lors de l'envoi")
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null
    const ic = "w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition font-medium"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="p-6 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <MessageSquare size={18} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Nouvelle</p>
                                <h2 className="text-lg font-black text-white">Conversation client</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <X size={18} className="text-white"/>
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 font-medium"><AlertTriangle size={14}/>{error}</div>}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Client</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setClientType('existant')}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                        clientType === 'existant' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                    }`}>
                                <Home size={14}/> Client de l'hôtel
                            </button>
                            <button type="button" onClick={() => setClientType('externe')}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                                        clientType === 'externe' ? 'border-[#66CAD8] bg-[#66CAD8]/10 text-[#1D2252]' : 'border-gray-100 text-gray-400'
                                    }`}>
                                <Users size={14}/> Autre contact
                            </button>
                        </div>
                    </div>
                    {clientType === 'existant' ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Rechercher un client</label>
                            <div className="relative mb-2">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Nom ou email..."
                                       value={searchClient} onChange={e => setSearchClient(e.target.value)}
                                       className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#66CAD8] bg-gray-50"/>
                            </div>
                            {selectedReservation ? (
                                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-[#66CAD8] bg-[#66CAD8]/5">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedReservation.clientNom} {selectedReservation.clientPrenom || ''}</p>
                                        <p className="text-xs text-gray-400">{selectedReservation.clientEmail}</p>
                                    </div>
                                    <button onClick={() => setForm(p => ({ ...p, reservationId: '' }))} className="text-gray-400 hover:text-red-500">
                                        <X size={16}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="max-h-40 overflow-y-auto space-y-1.5">
                                    {filteredReservations.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-3">Aucun résultat</p>
                                    ) : filteredReservations.map(r => (
                                        <button key={r.id} type="button"
                                                onClick={() => { setForm(p => ({ ...p, reservationId: r.id })); setSearchClient('') }}
                                                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-[#66CAD8] hover:bg-gray-50 transition text-left">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{r.clientNom} {r.clientPrenom || ''}</p>
                                                <p className="text-[10px] text-gray-400">{r.clientEmail}</p>
                                            </div>
                                            <User size={13} className="text-gray-300"/>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Nom du contact *</label>
                                <input {...F('clientNom')} placeholder="Nom complet" className={ic}/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Email</label>
                                    <input type="email" {...F('clientEmail')} placeholder="email@exemple.com" className={ic}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Téléphone</label>
                                    <input {...F('clientTelephone')} placeholder="+212 6XX XXXXXX" className={ic}/>
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Sujet</label>
                        <input {...F('sujet')} placeholder="Ex: Confirmation de votre séjour" className={ic}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Message *</label>
                        <textarea rows={4} {...F('contenu')} placeholder="Votre message..." className={ic}/>
                    </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose} disabled={processing}
                            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-white transition">
                        Annuler
                    </button>
                    <button onClick={handleSubmit} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition hover:shadow-lg disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                        {processing ? <RefreshCw size={16} className="animate-spin"/> : <><Send size={15}/> Envoyer</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

const ThreadDetail = ({ thread, onSendMessage, onLogReceived, onBack }) => {
    const [contenu, setContenu] = useState('')
    const [sending, setSending] = useState(false)
    const [mode, setMode] = useState('envoyer')

    const handleSend = async () => {
        if (!contenu.trim()) return
        setSending(true)
        try {
            if (mode === 'envoyer') await onSendMessage(thread, contenu.trim())
            else await onLogReceived(thread, contenu.trim())
            setContenu('')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
                <button onClick={onBack} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={18} className="text-gray-500"/>
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black shrink-0"
                     style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                    {(thread.clientNom || 'C')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900 truncate">{thread.clientNom}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-2">
                        {thread.clientEmail && <span className="flex items-center gap-1"><Mail size={10}/>{thread.clientEmail}</span>}
                        {thread.clientTelephone && <span className="flex items-center gap-1"><Phone size={10}/>{thread.clientTelephone}</span>}
                    </p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {thread.messages.map(m => {
                    const isHotel = m.expediteurRole !== 'CLIENT'
                    return (
                        <div key={m.id} className={`flex ${isHotel ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isHotel ? 'text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                            }`} style={isHotel ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                {m.sujet && m.sujet !== 'Communication client' && (
                                    <p className={`text-xs font-black mb-1 ${isHotel ? 'text-white/80' : 'text-gray-500'}`}>{m.sujet}</p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{m.contenu}</p>
                                <p className={`text-[10px] mt-1 ${isHotel ? 'text-white/60' : 'text-gray-400'}`}>{fmtDayTime(m.createdAt)} · {fmtDate(m.createdAt)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0 space-y-2">
                <div className="flex gap-2">
                    <button onClick={() => setMode('envoyer')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${mode === 'envoyer' ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                            style={mode === 'envoyer' ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                        Envoyer au client
                    </button>
                    <button onClick={() => setMode('consigner')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${mode === 'consigner' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        Consigner un message reçu
                    </button>
                </div>
                <div className="flex gap-2">
                    <textarea rows={2} value={contenu} onChange={e => setContenu(e.target.value)}
                              placeholder={mode === 'envoyer' ? 'Votre réponse...' : 'Message reçu du client (par tél./email)...'}
                              className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm bg-gray-50 hover:bg-white transition resize-none"/>
                    <button onClick={handleSend} disabled={sending || !contenu.trim()}
                            className="px-4 rounded-2xl text-white font-black transition disabled:opacity-40 shrink-0"
                            style={{ background: mode === 'consigner' ? '#d97706' : `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                        {sending ? <RefreshCw size={16} className="animate-spin"/> : <Send size={16}/>}
                    </button>
                </div>
            </div>
        </div>
    )
}

const ClientsTab = ({ hebergement }) => {
    const [reservations, setReservations] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')
    const [activeConversationId, setActiveConversationId] = useState(null)
    const [showNewModal, setShowNewModal] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!hebergement?.id) { setLoading(false); return }
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const [resaRes, msgRes] = await Promise.all([
                bookingAxios.get(`/booking/reservations/hotel/${hebergement.id}`).catch(() => null),
                messageAxios.get(`/messages/client/hebergement/${hebergement.id}`).catch(() => null),
            ])
            setReservations(resaRes?.data?.data || [])
            setMessages(msgRes?.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false); setRefreshing(false) }
    }, [hebergement?.id])

    useEffect(() => { fetchData() }, [fetchData])

    const threads = useMemo(() => {
        const map = {}
        messages.forEach(m => {
            const key = m.conversationId || `msg-${m.id}`
            if (!map[key]) {
                map[key] = { conversationId: key, clientNom: m.clientNom, clientEmail: m.clientEmail, clientTelephone: m.clientTelephone, reservationId: m.reservationId, messages: [] }
            }
            map[key].messages.push(m)
        })
        return Object.values(map).map(t => {
            t.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            const dernier = t.messages[t.messages.length - 1]
            const nonLus = t.messages.filter(m => m.expediteurRole === 'CLIENT' && !m.isLu).length
            return { ...t, dernierMessage: dernier.contenu, dateDernierMessage: dernier.createdAt, nonLus }
        }).sort((a, b) => new Date(b.dateDernierMessage) - new Date(a.dateDernierMessage))
    }, [messages])

    const filteredThreads = useMemo(() => {
        const q = search.toLowerCase()
        return threads.filter(t => !search || (t.clientNom || '').toLowerCase().includes(q) || (t.clientEmail || '').toLowerCase().includes(q))
    }, [threads, search])

    const stats = useMemo(() => ({ total: threads.length, nonLus: threads.reduce((s, t) => s + t.nonLus, 0) }), [threads])

    const activeThread = useMemo(() => filteredThreads.find(t => t.conversationId === activeConversationId) || null, [filteredThreads, activeConversationId])

    useEffect(() => {
        if (!activeThread) return
        const aLire = activeThread.messages.filter(m => m.expediteurRole === 'CLIENT' && !m.isLu)
        if (aLire.length === 0) return
        Promise.all(aLire.map(m => messageAxios.patch(`/messages/client/${m.id}/lu`).catch(() => null))).then(() => fetchData(true))
    }, [activeThread?.conversationId])

    const handleCreateConversation = async (payload) => {
        try {
            await messageAxios.post('/messages/client', { hebergementId: hebergement.id, ...payload })
            showToast('Message envoyé !')
            setShowNewModal(false)
            await fetchData(true)
        } catch (err) {
            throw new Error(err.response?.data?.message || "Erreur lors de l'envoi")
        }
    }
    const handleSendMessage = async (thread, contenu) => {
        try {
            await messageAxios.post('/messages/client', {
                hebergementId: hebergement.id, reservationId: thread.reservationId, clientNom: thread.clientNom,
                clientEmail: thread.clientEmail, clientTelephone: thread.clientTelephone, contenu, deLaPartDuClient: false,
            })
            await fetchData(true)
        } catch (err) { showToast(err.response?.data?.message || "Erreur lors de l'envoi.", 'error') }
    }
    const handleLogReceived = async (thread, contenu) => {
        try {
            await messageAxios.post('/messages/client', {
                hebergementId: hebergement.id, reservationId: thread.reservationId, clientNom: thread.clientNom,
                clientEmail: thread.clientEmail, clientTelephone: thread.clientTelephone, contenu, deLaPartDuClient: true,
            })
            await fetchData(true)
        } catch (err) { showToast(err.response?.data?.message || 'Erreur.', 'error') }
    }

    return (
        <div>
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2.5 border ${
                    toast.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={15}/> : <Check size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
                <KPICard title="Conversations" value={stats.total}  icon={MessageSquare} color="#2563eb" bg="#dbeafe"/>
                <KPICard title="Non lus"        value={stats.nonLus} icon={Inbox}         color="#dc2626" bg="#fee2e2"/>
            </div>

            <div className="flex items-center justify-end mb-3">
                <button onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs transition hover:shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}>
                    <Plus size={14}/> Nouvelle conversation
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '58vh' }}>
                <div className="flex h-full">
                    <div className={`w-full lg:w-80 border-r border-gray-100 flex flex-col ${activeThread ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                                       className="w-full pl-9 pr-3 py-2 border-2 border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#66CAD8] bg-gray-50"/>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-gray-300"/></div>
                            ) : filteredThreads.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageSquare size={28} className="mx-auto text-gray-200 mb-2"/>
                                    <p className="text-xs text-gray-400">Aucune conversation</p>
                                </div>
                            ) : filteredThreads.map(t => (
                                <button key={t.conversationId} onClick={() => setActiveConversationId(t.conversationId)}
                                        className={`w-full flex items-start gap-2.5 p-3 border-b border-gray-50 hover:bg-gray-50 transition text-left ${
                                            activeConversationId === t.conversationId ? 'bg-[#66CAD8]/10' : ''
                                        }`}>
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                        {(t.clientNom || 'C')[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="text-xs font-bold text-gray-900 truncate">{t.clientNom}</p>
                                            <span className="text-[9px] text-gray-400 shrink-0">{formatTime(t.dateDernierMessage)}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate">{t.dernierMessage}</p>
                                    </div>
                                    {t.nonLus > 0 && (
                                        <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">{t.nonLus}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`flex-1 ${activeThread ? 'flex' : 'hidden lg:flex'} flex-col`}>
                        {activeThread ? (
                            <ThreadDetail thread={activeThread} onSendMessage={handleSendMessage} onLogReceived={handleLogReceived} onBack={() => setActiveConversationId(null)}/>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${PURPLE}15)` }}>
                                    <MailOpen size={28} style={{ color: CYAN }}/>
                                </div>
                                <p className="text-sm font-bold text-gray-600">Sélectionnez une conversation</p>
                                <p className="text-xs text-gray-400 mt-1">ou démarrez-en une nouvelle</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NewConversationModal isOpen={showNewModal} reservations={reservations} onSubmit={handleCreateConversation} onClose={() => setShowNewModal(false)}/>
        </div>
    )
}

// ══════════════════════════════════════════════════════════
// PAGE PRINCIPALE — deux onglets
// ══════════════════════════════════════════════════════════

export default function HebergementMessages() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur

    const [hebergement, setHebergement] = useState(null)
    const [activeTab, setActiveTab] = useState('clients')

    useEffect(() => {
        hebergementAxios.get(`/hebergement/hebergements/by-user/${userId}`)
            .then(res => setHebergement(res.data?.data || null))
            .catch(() => setHebergement(null))
    }, [userId])

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            <div className="rounded-2xl shadow-md p-6 text-white relative"
                 style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                </div>
                <div className="relative">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Communication</p>
                    <h1 className="text-2xl font-black text-white">Messages</h1>
                    <p className="text-white/60 text-sm mt-1">{hebergement?.nom || 'Mon établissement'}</p>
                    <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => setActiveTab('clients')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                                    activeTab === 'clients' ? 'bg-white' : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                                style={activeTab === 'clients' ? { color: NAVY } : {}}>
                            <Users size={15}/> Clients
                        </button>
                        <button onClick={() => setActiveTab('support')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                                    activeTab === 'support' ? 'bg-white' : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                                style={activeTab === 'support' ? { color: NAVY } : {}}>
                            <LifeBuoy size={15}/> Support LuxTech
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'clients' ? <ClientsTab hebergement={hebergement}/> : <SupportTab userId={userId}/>}
        </div>
    )
}
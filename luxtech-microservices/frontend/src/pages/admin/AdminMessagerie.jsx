import { useState, useEffect, useRef } from 'react'
import {
    MessageSquare, Send, Search, RefreshCw,
    Plus, X, Check, CheckCheck
} from 'lucide-react'
import axios, { messageAxios } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAVY = '#1D2252'
const CYAN = '#66CAD8'
const PURPLE = '#5D2E8B'

const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `${Math.floor(diff/60000)} min`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── Modal nouvelle conversation ───────────────────────────
const NewConvModal = ({ users, onCreate, onClose }) => {
    const [selected, setSelected] = useState(null)
    const [sujet, setSujet] = useState('')
    const [message, setMessage] = useState('')
    const [search, setSearch] = useState('')
    const filtered = users.filter(u =>
        u.role !== 'SUPER_ADMIN' &&
        (`${u.prenom} ${u.nom}`.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.nomEtablissement?.toLowerCase().includes(search.toLowerCase()))
    )
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Nouvelle conversation</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500"/>
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Rechercher un partenaire..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {filtered.slice(0, 10).map(u => {
                            const uid = u.id_utilisateur || u.id
                            return (
                                <button key={uid}
                                        onClick={() => setSelected(selected?.uid === uid ? null : { ...u, uid })}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition ${
                                            selected?.uid === uid ? 'border-[#66CAD8] bg-[#66CAD8]/5' : 'border-transparent hover:bg-gray-50'
                                        }`}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                         style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                        {u.prenom?.[0]}{u.nom?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">{u.prenom} {u.nom}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.nomEtablissement || u.email}</p>
                                    </div>
                                    {selected?.uid === uid && (
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                                             style={{ background: CYAN }}>
                                            <Check size={11}/>
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                        {filtered.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Aucun partenaire trouvé</p>
                        )}
                    </div>
                    {selected && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                                <input type="text" value={sujet} onChange={e => setSujet(e.target.value)}
                                       placeholder="Ex: Validation de votre dossier"
                                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)}
                                          placeholder={`Écrire à ${selected.prenom}...`}
                                          rows={3}
                                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition resize-none"/>
                            </div>
                        </>
                    )}
                    <div className="flex gap-3">
                        <button onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 transition">
                            Annuler
                        </button>
                        <button onClick={() => selected && sujet.trim() && message.trim() && onCreate(selected, sujet, message)}
                                disabled={!selected || !sujet.trim() || !message.trim()}
                                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                            Envoyer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminMessagerie() {
    const { user } = useAuth()
    const userId = user?.id || user?.id_utilisateur
    const [allUsers, setAllUsers] = useState([])
    const [conversations, setConversations] = useState([])
    const [activeConv, setActiveConv] = useState(null)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState('')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [showNewConv, setShowNewConv] = useState(false)
    const [wsConnected, setWsConnected] = useState(false)
    const messagesEndRef = useRef(null)
    const stompRef = useRef(null)
    const subsRef = useRef([])

    useEffect(() => {
        fetchUsers()
        fetchConversations()
        loadWsLibs().then(() => connectWebSocket())
        return () => disconnectWebSocket()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── WebSocket ─────────────────────────────────────────────
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
                    fetchConversations()
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

    // ── API ───────────────────────────────────────────────────
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/auth/admin/users')
            setAllUsers(res.data?.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }
    const fetchConversations = async () => {
        try {
            const res = await messageAxios.get('/messages/boite')
            setConversations(res.data?.data?.conversations || [])
        } catch (err) { console.error('Erreur boite:', err) }
    }
    const fetchMessages = async (partnerId) => {
        try {
            await messageAxios.post('/messages/lire-tout', {})
            const res = await messageAxios.get(`/messages/conversation/${partnerId}`)
            setMessages(res.data?.data || [])
        } catch (err) { console.error('Erreur messages:', err) }
    }
    const sendMessage = async () => {
        if (!message.trim() || !activeConv || sending) return
        setSending(true)
        try {
            await messageAxios.post('/messages', {
                destinataireId: activeConv.autreUserId,
                destinataireNom: activeConv.autreUserNom,
                sujet: activeConv.dernierSujet || 'Message',
                contenu: message.trim(),
                conversationId: activeConv.conversationId,
            })
            setMessage('')
            await fetchMessages(activeConv.autreUserId)
            await fetchConversations()
        } catch (err) { console.error('Erreur envoi:', err) }
        finally { setSending(false) }
    }
    const createConversation = async (partner, sujet, firstMessage) => {
        try {
            const existing = conversations.find(c => c.autreUserId === partner.uid)
            await messageAxios.post('/messages', {
                destinataireId: partner.uid,
                destinataireNom: `${partner.prenom} ${partner.nom}`,
                sujet,
                contenu: firstMessage,
                conversationId: existing?.conversationId,
            })
            setShowNewConv(false)
            await fetchConversations()
        } catch (err) { console.error('Erreur création:', err) }
    }
    const openConversation = async (conv) => {
        setActiveConv(conv)
        await fetchMessages(conv.autreUserId)
        setConversations(prev => prev.map(c =>
            c.conversationId === conv.conversationId ? { ...c, nonLus: 0 } : c
        ))
    }
    const filtered = conversations.filter(c => {
        const q = search.toLowerCase()
        return !search || c.autreUserNom?.toLowerCase().includes(q) || c.dernierSujet?.toLowerCase().includes(q)
    })
    const totalUnread = conversations.reduce((s, c) => s + (c.nonLus || 0), 0)

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            {showNewConv && (
                <NewConvModal users={allUsers} onCreate={createConversation} onClose={() => setShowNewConv(false)}/>
            )}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
                    <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
                        Communication avec les partenaires
                        {totalUnread > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                  style={{ background: CYAN }}>
                                {totalUnread} non lu(s)
                            </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            wsConnected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                            {wsConnected ? '● En ligne' : '● Hors ligne'}
                        </span>
                    </p>
                </div>
                <button onClick={() => setShowNewConv(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition hover:shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                    <Plus size={15}/> Nouveau message
                </button>
            </div>
            {/* Corps */}
            <div className="flex flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-0">
                {/* Sidebar */}
                <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type="text" placeholder="Rechercher..."
                                   value={search} onChange={e => setSearch(e.target.value)}
                                   className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#66CAD8] text-sm transition"/>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center">
                                <RefreshCw size={20} className="animate-spin mx-auto text-gray-300"/>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageSquare size={28} className="mx-auto mb-2 text-gray-300"/>
                                <p className="text-sm text-gray-400">Aucune conversation</p>
                                <button onClick={() => setShowNewConv(true)}
                                        className="mt-3 text-xs font-medium hover:underline"
                                        style={{ color: CYAN }}>
                                    Démarrer une conversation
                                </button>
                            </div>
                        ) : filtered.map(conv => {
                            const isActive = activeConv?.conversationId === conv.conversationId
                            return (
                                <button key={conv.conversationId} onClick={() => openConversation(conv)}
                                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-gray-50 transition ${
                                            isActive ? 'bg-[#66CAD8]/10' : 'hover:bg-gray-50'
                                        }`}>
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                             style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                            {conv.autreUserNom?.[0] || '?'}
                                        </div>
                                        {conv.nonLus > 0 && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                                 style={{ background: CYAN }}>
                                                {conv.nonLus}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className={`text-sm truncate ${conv.nonLus > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                                                {conv.autreUserNom}
                                            </p>
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                {formatTime(conv.dateDernierMessage)}
                                            </span>
                                        </div>
                                        {conv.dernierSujet && (
                                            <p className="text-xs text-gray-500 truncate">{conv.dernierSujet}</p>
                                        )}
                                        {conv.dernierMessage && (
                                            <p className={`text-xs truncate mt-0.5 ${conv.nonLus > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                {conv.dernierMessage}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
                {/* Zone chat */}
                {activeConv ? (
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Header chat */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                {activeConv.autreUserNom?.[0] || '?'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{activeConv.autreUserNom}</p>
                                <p className="text-xs text-gray-500">{activeConv.dernierSujet}</p>
                            </div>
                            <button onClick={() => fetchMessages(activeConv.autreUserId)}
                                    className="ml-auto p-2 rounded-xl hover:bg-gray-100 transition">
                                <RefreshCw size={15} className="text-gray-400"/>
                            </button>
                        </div>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-400">Aucun message</p>
                                </div>
                            ) : messages.map(msg => {
                                const isMe = msg.expediteurId === userId
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <p className="text-xs text-gray-500 px-1">{msg.expediteurNom}</p>
                                            )}
                                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                isMe ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                            }`}
                                                 style={isMe ? { background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` } : {}}>
                                                {msg.contenu}
                                            </div>
                                            <div className="flex items-center gap-1 px-1">
                                                <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                                                {isMe && (msg.isLu
                                                        ? <CheckCheck size={11} style={{ color: CYAN }}/>
                                                        : <Check size={11} className="text-gray-400"/>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef}/>
                        </div>
                        {/* Saisie */}
                        <div className="px-5 py-4 border-t border-gray-100">
                            <div className="flex items-end gap-3">
                                <textarea value={message}
                                          onChange={e => setMessage(e.target.value)}
                                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                                          placeholder="Écrire un message... (Entrée pour envoyer)"
                                          rows={2}
                                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#66CAD8] text-sm transition resize-none"/>
                                <button onClick={sendMessage} disabled={!message.trim() || sending}
                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition hover:shadow-lg disabled:opacity-50 shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                    {sending ? <RefreshCw size={16} className="animate-spin"/> : <Send size={16}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
                                 style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>
                                <MessageSquare size={28}/>
                            </div>
                            <p className="font-bold text-gray-700 text-lg">Sélectionnez une conversation</p>
                            <p className="text-gray-400 text-sm mt-1">ou démarrez une nouvelle conversation</p>
                            <button onClick={() => setShowNewConv(true)}
                                    className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition hover:shadow-lg mx-auto"
                                    style={{ background: `linear-gradient(135deg, ${CYAN}, ${NAVY})` }}>
                                <Plus size={15}/> Nouveau message
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
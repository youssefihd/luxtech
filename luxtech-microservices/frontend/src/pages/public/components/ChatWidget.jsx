import { useState, useRef, useEffect } from 'react'
import { Mail, Sparkles, X, Send, Bot, ArrowUp } from 'lucide-react'
import { chatbotAxios } from '../../../api/axios'

const NAVY = '#1D2252', CYAN = '#66CAD8', PURPLE = '#5D2E8B'

const ChatWidget = ({ showScrollTop, onScrollTop }) => {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Bonjour ! 👋 Je suis l'assistant LuxTech. Comment puis-je vous aider aujourd'hui ?" }
    ])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages, open])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || sending) return
        setInput('')
        const newMessages = [...messages, { role: 'user', content: text }]
        setMessages(newMessages)
        setSending(true)
        try {
            const history = newMessages.slice(-8).map(m => ({ role: m.role, content: m.content }))
            const res = await chatbotAxios.post('/chatbot/message', { message: text, history })
            const reply = res.data?.data?.reply || "Désolé, je n'ai pas pu générer de réponse."
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre un souci technique. Contactez-nous directement via la page Contact." }])
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
            {open && (
                <div className="w-[90vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-5 text-white relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, #1A237E, #5E35B1)` }}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4"/>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Bot size={18}/></div>
                                <div>
                                    <p className="font-black text-sm">Assistant LuxTech</p>
                                    <p className="text-white/60 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> En ligne</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"><X size={16}/></button>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    m.role === 'user'
                                        ? 'text-white rounded-br-sm'
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'
                                }`}
                                     style={m.role === 'user' ? { background: `linear-gradient(135deg, #00BCD4, #5E35B1)` } : {}}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}/>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}/>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}/>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                        <div className="flex items-center gap-2">
                            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                   placeholder="Écrivez votre message..." disabled={sending}
                                   className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00BCD4] transition bg-gray-50"/>
                            <button onClick={handleSend} disabled={sending || !input.trim()}
                                    className="p-2.5 rounded-xl text-white transition disabled:opacity-40 shrink-0"
                                    style={{ background: `linear-gradient(135deg, #1A237E, #5E35B1)` }}>
                                <Send size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!open && (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00BCD4] to-[#8465c1] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"/>
                    <button onClick={() => setOpen(true)}
                            className="relative flex items-center gap-3 bg-gradient-to-r from-[#1A237E] to-[#5E35B1] text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10">
                        <Mail size={22} className="text-[#00BCD4]"/>
                        <span className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
                            Contactez-nous <Sparkles size={14} className="text-yellow-400"/>
                        </span>
                    </button>
                </div>
            )}

            {showScrollTop && !open && (
                <button onClick={onScrollTop}
                        className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
                        title="Retour en haut">
                    <ArrowUp size={20}/>
                </button>
            )}
        </div>
    )
}

export default ChatWidget
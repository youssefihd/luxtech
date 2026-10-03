import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Bot, Mail, Send, X } from 'lucide-react'
import { chatbotAxios } from '../../../api/axios'

const ChatWidget = ({ showScrollTop, onScrollTop }) => {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Bonjour. Je suis l'assistant LuxTech. Comment puis-je vous aider ?" }
    ])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, open])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || sending) return

        setInput('')
        const nextMessages = [...messages, { role: 'user', content: text }]
        setMessages(nextMessages)
        setSending(true)

        try {
            const history = nextMessages.slice(-8).map(message => ({
                role: message.role,
                content: message.content,
            }))

            const response = await chatbotAxios.post('/chatbot/message', {
                message: text,
                history,
            })

            const reply =
                response.data?.data?.reply ||
                "Désolé, je n'ai pas pu générer de réponse."

            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: reply },
            ])
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: "Un problème technique est survenu. Vous pouvez nous contacter directement depuis la page Contact.",
                },
            ])
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {open && (
                <div className="w-[calc(100vw-2rem)] max-w-[390px] h-[min(620px,75vh)] bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
                    <header className="bg-[#172B63] text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/10 border border-white/15 flex items-center justify-center">
                                <Bot size={17} className="text-[#65D1DF]" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Assistant LuxTech</p>
                                <p className="text-[11px] text-white/60 mt-0.5">Support digital</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition"
                            aria-label="Fermer"
                        >
                            <X size={17} />
                        </button>
                    </header>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[84%] px-4 py-3 text-sm leading-6 ${
                                        message.role === 'user'
                                            ? 'bg-[#1677C8] text-white'
                                            : 'bg-white border border-slate-200 text-slate-700'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 px-4 py-3 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 p-3 bg-white">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={sending}
                                placeholder="Votre message..."
                                className="min-w-0 flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#20BFD3]"
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending || !input.trim()}
                                className="w-10 h-10 bg-[#172B63] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#1677C8] transition"
                                aria-label="Envoyer"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2.5 bg-[#172B63] text-white px-4 py-3 shadow-xl border border-white/10 hover:bg-[#20377A] transition"
                >
                    <Mail size={18} className="text-[#65D1DF]" />
                    <span className="text-sm font-semibold">Contactez-nous</span>
                </button>
            )}

            {showScrollTop && !open && (
                <button
                    onClick={onScrollTop}
                    className="w-11 h-11 bg-white border border-slate-300 text-[#172B63] flex items-center justify-center shadow-lg hover:border-[#20BFD3] transition"
                    title="Retour en haut"
                    aria-label="Retour en haut"
                >
                    <ArrowUp size={18} />
                </button>
            )}
        </div>
    )
}

export default ChatWidget

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'

const ServiceTourismeCard = ({ service }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const hoverTimerRef = useRef(null)
    const Icon = service.icon

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        }
    }, [])

    const handleEnter = () => {
        setIsHovered(true)
        if (service.fullDescription) {
            hoverTimerRef.current = setTimeout(() => setIsModalOpen(true), 900)
        }
    }

    const handleLeave = () => {
        setIsHovered(false)
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current)
            hoverTimerRef.current = null
        }
    }

    return (
        <>
            <article
                className="group relative bg-white border border-slate-200 p-6 sm:p-7 hover:border-[#20BFD3] transition-colors cursor-pointer"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onClick={() => service.fullDescription && setIsModalOpen(true)}
            >
                <div className="flex justify-between items-start gap-5">
                    <div className="flex items-start gap-5">
                        <div className={`w-11 h-11 shrink-0 flex items-center justify-center transition ${isHovered ? 'bg-[#20BFD3] text-[#172B63]' : 'bg-[#172B63] text-white'}`}>
                            <Icon size={19} strokeWidth={1.8} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                                    Service {String(service.number).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1677C8] transition">
                                {service.title}
                            </h3>
                            <p className="text-sm leading-6 text-slate-500 mt-2 max-w-xl">
                                {service.summary}
                            </p>
                        </div>
                    </div>

                    <ArrowUpRight
                        size={18}
                        className={`shrink-0 text-slate-300 transition-transform ${isHovered ? 'text-[#1677C8] -translate-y-0.5 translate-x-0.5' : ''}`}
                    />
                </div>
            </article>

            {service.fullDescription && isModalOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-[#0B1733]/60 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl bg-white shadow-2xl"
                        onClick={event => event.stopPropagation()}
                    >
                        <header className="bg-[#172B63] text-white px-6 py-6 flex items-start justify-between gap-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">
                                    Service {String(service.number).padStart(2, '0')}
                                </p>
                                <h2 className="text-2xl font-semibold mt-2">{service.title}</h2>
                                {service.soustitle && (
                                    <p className="text-sm text-white/65 mt-1">{service.soustitle}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-9 h-9 border border-white/15 flex items-center justify-center hover:bg-white/10"
                                aria-label="Fermer"
                            >
                                <X size={17} />
                            </button>
                        </header>

                        <div className="px-6 py-7 sm:px-8 sm:py-9">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400 mb-3">
                                Vue d'ensemble
                            </p>
                            <p className="text-slate-700 leading-7 text-sm whitespace-pre-line">
                                {service.fullDescription}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ServiceTourismeCard

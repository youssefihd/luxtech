import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

const ServiceTourismeCard = ({ service, index }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const hoverTimerRef = useRef(null)
    const Icon = service.icon

    const handleMouseEnter = () => {
        setIsHovered(true)
        if (service.fullDescription) {
            hoverTimerRef.current = setTimeout(() => setIsModalOpen(true), 800)
        }
    }
    const handleMouseLeave = () => {
        setIsHovered(false)
        if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null }
    }
    useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current) }, [])

    return (
        <>
            <div className="relative group bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#00BCD4]/30 cursor-pointer"
                 onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all duration-300 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] ${isHovered ? 'scale-110 shadow-lg' : ''}`}>
                            {service.number}
                        </div>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-[#00BCD4] rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`}>
                            <Icon size={12} className="text-[#00BCD4]"/>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${isHovered ? 'text-[#00BCD4]' : 'text-gray-900'}`}>
                            {service.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-md mb-3">{service.summary}</p>
                        {service.fullDescription && (
                            <div className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                                <span className="inline-block w-1.5 h-1.5 bg-[#00BCD4] rounded-full animate-pulse"/>
                                <span className="text-[#00BCD4]">Survolez pour plus de détails</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00BCD4]/5 to-[#5E35B1]/5 transition-opacity duration-300 -z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}/>
            </div>

            {service.fullDescription && isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-white relative bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18}/></button>
                            <span className="inline-block w-8 h-8 rounded-lg bg-white/20 text-center leading-8 font-black text-sm mb-2">{service.number}</span>
                            <h2 className="text-xl font-black">{service.title}</h2>
                            {service.soustitle && <p className="text-white/80 text-sm mt-1">{service.soustitle}</p>}
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-[#00BCD4] to-[#5E35B1] rounded-full"/> Vue d'ensemble
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{service.fullDescription}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ServiceTourismeCard
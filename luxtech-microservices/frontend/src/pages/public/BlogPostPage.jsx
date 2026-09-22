import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Newspaper } from 'lucide-react'
import Navbar from './components/Navbar'
import FooterSection from './components/FooterSection'

const BlogPostPage = ({ onLoginClick, onRegisterClick }) => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
            <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick}/>

            <header className="bg-white shadow-sm border-b pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft size={18} className="mr-2"/> Retour
                        </button>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] bg-clip-text text-transparent">
                            Blog
                        </h1>
                        <div className="w-20"/>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex items-center justify-center text-center">
                <div>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-[#00BCD4]/15 to-[#5E35B1]/15">
                        <Newspaper size={28} className="text-[#1A237E]"/>
                    </div>
                    <p className="text-xl font-black text-gray-900 mb-2">Blog en préparation</p>
                    <p className="text-gray-500">Nos premiers articles seront bientôt publiés ici.</p>
                </div>
            </main>

            <FooterSection/>
        </div>
    )
}

export default BlogPostPage
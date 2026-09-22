import { useState, useEffect } from 'react'
import { SectionContainer, ContentWrapper, AnimatedElement, Button, GradientText } from './shared'

const HeroSection = ({ onGetStartedClick, onLoginClick }) => {
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => { setIsVisible(true) }, [])

    return (
        <SectionContainer className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 min-h-screen lg:min-h-[90vh] flex items-center"
                          py="pt-16 lg:py-0">
            <div className="absolute top-0 left-[-20%] w-64 h-64 md:w-96 md:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"/>
            <div className="absolute bottom-0 right-[80%] w-64 h-64 md:w-96 md:h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"/>

            <ContentWrapper className="relative z-10 w-full px-6 py-12 md:px-12 lg:pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
                    <AnimatedElement animation="fade-right" isVisible={isVisible}>
                        <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                            <h1 className="text-3xl sm:text-4xl pt-3 md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-gray-900">
                                Centralisez la gestion de vos{' '}
                                <GradientText className="from-blue-600 to-indigo-600 block sm:inline">
                                    hébergements et agences
                                </GradientText>
                            </h1>
                            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                <span className="font-semibold text-cyan-600">Solutions</span> PMS, TAMS, Channel Manager et CRM.
                                Une plateforme <span className="italic font-medium text-gray-800">tout-en-un</span> conçue pour connecter l'écosystème du voyage.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                                <Button onClick={onLoginClick} className="w-full sm:w-auto px-8 py-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95">
                                    Se connecter
                                </Button>
                                <Button onClick={onGetStartedClick} variant="outline" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 transition-all transform hover:-translate-y-1 active:scale-95">
                                    Devenir partenaire
                                </Button>
                            </div>
                        </div>
                    </AnimatedElement>

                    <AnimatedElement animation="fade-left" delay={300} isVisible={isVisible}>
                        <div className="relative group mt-8 lg:mt-4">
                            <img src="/images/hero_image.png" alt="LuxTech Dashboard"
                                 className="w-full h-auto max-h-[280px] md:max-h-[480px] object-cover transform transition-transform duration-700 group-hover:scale-[1.03]"
                                 onError={e => { e.target.style.display = 'none' }}/>
                        </div>
                    </AnimatedElement>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

export default HeroSection
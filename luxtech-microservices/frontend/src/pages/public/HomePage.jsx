import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import BenefitsSection from "./components/BenefitsSection";
import ForWhomSection from "./components/ForWhomSection";
import FeaturesSection from "./components/FeaturesSection";
import TourismSection from "./components/TourismSection";
import PricingSection from "./components/PricingSection";
import PartnersSection from "./components/PartnersSection";
import FAQSection from "./components/FAQSection";
import ContactSection from "./components/ContactSection";
import FooterSection from "./components/FooterSection";

const HomePage = ({ onLoginClick, onRegisterClick }) => {
    const handleLogin    = onLoginClick    || (() => {});
    const handleRegister = onRegisterClick || (() => {});

    return (
        <div className="homepage">
            <Navbar
                onLoginClick={handleLogin}
                onRegisterClick={handleRegister}
            />
            <HeroSection
                onLoginClick={handleLogin}
                onGetStartedClick={handleRegister}
            />
            <AboutSection />
            <BenefitsSection />
            <ForWhomSection />
            <FeaturesSection />
            <TourismSection
                onLoginClick={handleLogin}
                onGetStartedClick={handleRegister}
            />
            <PricingSection />
            <PartnersSection />
            <FAQSection
                onLoginClick={handleLogin}
                onGetStartedClick={handleRegister}
            />
            <ContactSection />
            <FooterSection />
        </div>
    );
};

export default HomePage;

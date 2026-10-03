import { motion, useScroll, useSpring } from "framer-motion";

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

import LuxTech3DScene from "./components/LuxTech3DScene";

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.98,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const SectionMotion = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: false,
        amount: 0.15,
      }}
    >
      {children}
    </motion.div>
  );
};

const HomePage = ({
  onLoginClick,
  onRegisterClick,
}) => {

  const handleLogin = onLoginClick || (() => {});
  const handleRegister = onRegisterClick || (() => {});

  /*
   * Global scroll progress.
   *
   * The 3D scene receives this value and changes
   * its rotation / position as the visitor scrolls.
   */
  const { scrollYProgress } = useScroll();

  const smoothScroll = useSpring(
    scrollYProgress,
    {
      stiffness: 70,
      damping: 25,
      mass: 0.5,
    }
  );

  return (
    <div
      className="
        homepage
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#f4f7fa]
        text-[#102a43]
      "
    >

      {/* =========================================
          3D BACKGROUND
      ========================================= */}

      <LuxTech3DScene
        scrollProgress={smoothScroll}
      />

      {/* =========================================
          BACKGROUND GRADIENT
      ========================================= */}

      <div className="pointer-events-none fixed inset-0 z-[1]">
        <div
          className="
            absolute
            left-1/2
            top-[20%]
            h-[500px]
            w-[500px]
            -translate-x-1/2
            rounded-full
            bg-blue-400/10
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            right-[-200px]
            top-[45%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-400/10
            blur-[140px]
          "
        />
      </div>

      {/* =========================================
          CONTENT
      ========================================= */}

      <div className="relative z-10">

        {/* NAVBAR */}

        <motion.div
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          <Navbar
            onLoginClick={handleLogin}
            onRegisterClick={handleRegister}
          />
        </motion.div>


        {/* =======================================
            HERO
        ======================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            delay: 0.15,
          }}
        >
          <HeroSection
            onLoginClick={handleLogin}
            onGetStartedClick={handleRegister}
          />
        </motion.div>


        {/* =======================================
            ABOUT
        ======================================= */}

        <SectionMotion>
          <AboutSection />
        </SectionMotion>


        {/* =======================================
            BENEFITS
        ======================================= */}

        <SectionMotion>
          <BenefitsSection />
        </SectionMotion>


        {/* =======================================
            FOR WHOM
        ======================================= */}

        <SectionMotion>
          <ForWhomSection />
        </SectionMotion>


        {/* =======================================
            FEATURES
        ======================================= */}

        <SectionMotion>
          <FeaturesSection />
        </SectionMotion>


        {/* =======================================
            TOURISM
        ======================================= */}

        <SectionMotion>
          <TourismSection
            onLoginClick={handleLogin}
            onGetStartedClick={handleRegister}
          />
        </SectionMotion>


        {/* =======================================
            PRICING
        ======================================= */}

        <SectionMotion>
          <PricingSection />
        </SectionMotion>


        {/* =======================================
            PARTNERS
        ======================================= */}

        <SectionMotion>
          <PartnersSection />
        </SectionMotion>


        {/* =======================================
            FAQ
        ======================================= */}

        <SectionMotion>
          <FAQSection
            onLoginClick={handleLogin}
            onGetStartedClick={handleRegister}
          />
        </SectionMotion>


        {/* =======================================
            CONTACT
        ======================================= */}

        <SectionMotion>
          <ContactSection />
        </SectionMotion>


        {/* =======================================
            FOOTER
        ======================================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: false,
          }}
          transition={{
            duration: 1,
          }}
        >
          <FooterSection />
        </motion.div>

      </div>


      {/* =========================================
          SCROLL PROGRESS
      ========================================= */}

      <motion.div
        className="
          fixed
          right-0
          top-0
          z-[100]
          h-[3px]
          origin-left
          bg-blue-600
        "
        style={{
          scaleX: smoothScroll,
          width: "100%",
        }}
      />

    </div>
  );
};

export default HomePage;
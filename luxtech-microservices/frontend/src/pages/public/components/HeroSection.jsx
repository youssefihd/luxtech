import { ArrowUpRight, Building2, Hotel, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionContainer, ContentWrapper } from "./shared";
import LuxTech3D from "./LuxTech3D";

const HeroSection = ({ onGetStartedClick, onLoginClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <SectionContainer
      className="relative overflow-hidden border-b border-slate-200 bg-[#f7fafc]"
      py="py-0"
    >
      <div className="pointer-events-none absolute right-[-10rem] top-[-16rem] h-[34rem] w-[34rem] rounded-full bg-cyan-100/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-16rem] left-[-12rem] h-[30rem] w-[30rem] rounded-full bg-blue-100/35 blur-3xl" />

      <ContentWrapper className="relative z-10 px-5 py-12 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
          <div
            className={`max-w-2xl transition-all duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <div className="mb-7 inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00bcd4]" />
              Hospitality technology
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#102a43] sm:text-5xl lg:text-[4.2rem]">
              Une seule plateforme pour piloter votre activité touristique.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              PMS, TAMS, Channel Manager et CRM réunis dans un environnement
              conçu pour les hébergements, les agences et leurs partenaires.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGetStartedClick}
                className="group inline-flex items-center justify-center gap-2 bg-[#0b5fc6] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#084eaa] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
              >
                Devenir partenaire
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>

              <button
                onClick={onLoginClick}
                className="inline-flex items-center justify-center border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#102a43] transition hover:border-[#0b5fc6] hover:text-[#0b5fc6]"
              >
                Se connecter
              </button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-slate-200 pt-7 sm:grid-cols-3">
              <TrustItem icon={Building2} text="Multi-établissements" />
              <TrustItem icon={ShieldCheck} text="Données protégées" />
              <TrustItem icon={Users} text="Écosystème connecté" />
            </div>
          </div>

          <div
            className={`transition-all delay-150 duration-1000 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden border border-slate-200 bg-[#0b223c] shadow-[0_25px_70px_rgba(16,42,67,.16)]">
              <div className="absolute left-6 top-6 z-20">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Portfolio overview
                </div>
                <div className="mt-1 text-sm text-white">
                  LuxTech Operations
                </div>
              </div>

              <div className="absolute right-5 top-5 z-20 flex items-center gap-2 border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Live
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric label="Occupation" value="82.4%" />
                <Metric label="Réservations" value="1 284" />
                <Metric label="Revenus" value="184K €" />
              </div>

              <div className="min-h-[470px]">
                <LuxTech3D />
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </SectionContainer>
  );
};

function TrustItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
      <Icon size={16} className="text-[#00bcd4]" />
      {text}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default HeroSection;

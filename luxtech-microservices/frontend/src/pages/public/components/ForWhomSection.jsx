import { useState } from "react";
import {
  Building2,
  Handshake,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  SectionContainer,
  ContentWrapper,
  SectionHeader,
  AnimatedElement,
} from "./shared";

const TARGETS = {
  hotels: {
    icon: Building2,
    id: "hotels",
    label: "Hébergements",
    title: "Une meilleure maîtrise de chaque établissement.",
    description:
      "Centralisez vos chambres, disponibilités, réservations, revenus et équipes dans un même espace de travail.",
    features: [
      "Gestion centralisée des chambres",
      "Suivi des taux d'occupation",
      "Revenus et performances",
      "Booking Engine",
      "Facturation intégrée",
      "CRM et relation client",
    ],
    image: "/images/dashboard-img-hotel.png",
  },
  agencies: {
    icon: Handshake,
    id: "agencies",
    label: "Agences",
    title: "Un espace de travail pensé pour les flux multi-hébergements.",
    description:
      "Organisez vos partenaires, réservations, commissions et relations commerciales sans multiplier les outils.",
    features: [
      "Réseau d'hébergements",
      "Réservations groupées",
      "Commissions transparentes",
      "Facturation intégrée",
      "CRM partenaires",
      "Rapports analytiques",
    ],
    image: "/images/dashboard-img-agency.png",
  },
};

const ForWhomSection = () => {
  const [activeTab, setActiveTab] = useState("hotels");
  const target = TARGETS[activeTab];
  const Icon = target.icon;
  const navigate = useNavigate();

  return (
    <SectionContainer className="border-b border-slate-200 bg-[#f4f7fa]" py="py-20 md:py-24">
      <ContentWrapper>
        <SectionHeader
          title="Deux métiers."
          highlightText="Une infrastructure."
          description="Des interfaces adaptées aux responsabilités de chaque équipe, avec une même logique produit."
        />

        <AnimatedElement animation="fade-up" delay={120}>
          <div className="mt-10 border-b border-slate-200">
            <div className="flex flex-wrap gap-7">
              {Object.values(TARGETS).map((item) => {
                const TabIcon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={item.id}
                    data-nav-section-trigger="true"
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex scroll-mt-28 items-center gap-2 pb-4 text-sm font-semibold transition ${
                      active ? "text-[#0b5fc6]" : "text-slate-500 hover:text-[#102a43]"
                    }`}
                  >
                    <TabIcon size={17} />
                    {item.label}
                    {active && (
                      <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#00bcd4]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-up" delay={220}>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center bg-[#0b5fc6] text-white">
                  <Icon size={21} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#00a5bc]">
                    {target.label}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#102a43] md:text-3xl">
                    {target.title}
                  </h3>
                </div>
              </div>

              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600">
                {target.description}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {target.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#0b5fc6]" />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/contact")}
                className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#0b5fc6] transition hover:text-[#084eaa]"
              >
                Demander une démonstration
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="relative border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(16,42,67,.08)]">
              <div className="overflow-hidden bg-[#edf3f7]">
                <img
                  src={target.image}
                  alt={`Interface LuxTech ${target.label}`}
                  className="block w-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="absolute bottom-5 left-5 border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  LuxTech Workspace
                </div>
                <div className="mt-1 text-sm font-semibold text-[#102a43]">
                  Vue opérationnelle
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </ContentWrapper>
    </SectionContainer>
  );
};

export default ForWhomSection;

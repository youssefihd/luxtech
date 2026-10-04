import { memo } from "react";
import {
  MapPin,
  Package,
  DollarSign,
  Zap,
  Users,
  Target,
} from "lucide-react";
import {
  SectionContainer,
  ContentWrapper,
  SectionHeader,
  useIntersectionObserver,
} from "./shared";

const BENEFITS = [
  {
    icon: MapPin,
    eyebrow: "LOCAL",
    title: "Pensé pour le marché",
    description:
      "Une solution conçue autour des usages, contraintes et réalités des professionnels locaux.",
  },
  {
    icon: Package,
    eyebrow: "ONE PLATFORM",
    title: "Une vue unifiée",
    description:
      "Vos opérations, partenaires et données métiers dans un environnement cohérent.",
  },
  {
    icon: DollarSign,
    eyebrow: "CONTROL",
    title: "Maîtrise des coûts",
    description:
      "Des outils structurés pour piloter vos revenus, commissions et opérations sans complexité inutile.",
  },
  {
    icon: Zap,
    eyebrow: "FAST",
    title: "Déploiement fluide",
    description:
      "Une prise en main progressive, des workflows clairs et une interface conçue pour aller à l'essentiel.",
  },
  {
    icon: Users,
    eyebrow: "NETWORK",
    title: "Partenaires connectés",
    description:
      "Facilitez la collaboration entre établissements, agences, équipes et fournisseurs.",
  },
  {
    icon: Target,
    eyebrow: "DATA",
    title: "Décisions mieux informées",
    description:
      "Transformez l'activité quotidienne en indicateurs utiles pour suivre et améliorer vos performances.",
  },
];

const BenefitsSection = () => {
  const [ref, visible] = useIntersectionObserver();

  return (
    <div ref={ref}>
      <SectionContainer className="border-b border-slate-200 bg-white" py="py-20 md:py-24">
        <ContentWrapper maxWidth="max-w-6xl">
          <SectionHeader
            title="Une infrastructure conçue autour de"
            highlightText="vos opérations"
            description="Pas une collection d'outils séparés. Une architecture produit cohérente pour les acteurs du tourisme."
            isVisible={visible}
          />

          <div className="mt-12 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className={`bg-white p-7 transition-all duration-500 hover:bg-[#f7fafc] ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#eaf7fa] text-[#0b5fc6]">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                      {item.eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-7 text-lg font-semibold text-[#102a43]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </ContentWrapper>
      </SectionContainer>
    </div>
  );
};

export default memo(BenefitsSection);

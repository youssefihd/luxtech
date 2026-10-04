import { useMemo } from "react";
import {
  Cloud,
  Zap,
  LockKeyhole,
  Cable,
  Building2,
  UsersRound,
  LifeBuoy,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  ["Cloud", "Accédez à vos opérations depuis n'importe où.", Cloud],
  ["Performance", "Des workflows rapides pour les équipes terrain.", Zap],
  ["Sécurité", "Contrôles d'accès et protection des données.", LockKeyhole],
  ["API ouverte", "Connectez votre environnement existant.", Cable],
  ["Multi-établissements", "Pilotez plusieurs propriétés depuis un même espace.", Building2],
  ["Multi-agences", "Coordonnez un réseau de partenaires.", UsersRound],
  ["Support", "Une équipe disponible pour accompagner vos opérations.", LifeBuoy],
  ["Analytics", "Suivez les indicateurs qui comptent vraiment.", BarChart3],
];

const FeaturesSection = () => {
  const items = useMemo(() => FEATURES, []);

  return (
    <section id="features" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#00a5bc]">
              Produit
            </div>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-[#102a43] md:text-4xl">
              Les fondamentaux d'un vrai système métier.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              Une base solide avant les effets visuels. Chaque composant doit
              aider une équipe à travailler, décider ou collaborer.
            </p>
          </div>

          <div className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {items.map(([title, description, Icon]) => (
              <div
                key={title}
                className="group bg-white p-6 transition hover:bg-[#f7fafc]"
              >
                <div className="flex h-9 w-9 items-center justify-center border border-slate-200 text-[#0b5fc6] transition group-hover:border-[#00bcd4]">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 text-sm font-semibold text-[#102a43]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import { Menu, X, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
    Package,
    Hotel,
    Building2,
    CreditCard,
    Mail
} from 'lucide-react'
import { useLocation, useNavigate } from "react-router-dom";
const NAV = [
    ["Produit", "#features", Package],
    ["Hébergements", "#hotels", Hotel],
    ["Agences", "#agencies", Building2],
    ["Tarifs", "#pricing", CreditCard],
    ["Paiements", "/iso8583", CreditCard],
    ["Contact", "#contact", Mail],
]

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const scrollToSection = useCallback((href) => {
    const target = document.getElementById(href.slice(1));
    if (!target) return;

    if (target.matches('[data-nav-section-trigger="true"]')) {
      target.click();
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const frame = window.requestAnimationFrame(() => scrollToSection(location.hash));
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, scrollToSection]);

  const go = (href) => {
    setOpen(false);

    if (href?.startsWith("/")) {
        navigate(href);
        return;
    }

    if (href?.startsWith("#")) {
        if (location.pathname !== "/") {
            navigate(`/${href}`);
            return;
        }
        scrollToSection(href);
    }
};

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
        <a href="/" className="flex items-center shrink-0">
          <img
            src="/images/luxtech-logo.png"
            alt="LuxTech"
            className="h-9 w-auto object-contain sm:h-10"
          />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
           {NAV.map(([label, href, Icon]) => (
        <button
            key={label}
            onClick={() => go(href)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#1A237E] transition-colors"
        >
            <Icon size={17} />
            <span>{label}</span>
        </button>
    ))}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <button
            onClick={onLoginClick}
            className="px-4 py-2.5 text-sm font-semibold text-[#102a43] transition hover:text-[#0c62c8]"
          >
            Se connecter
          </button>
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center gap-2 bg-[#0b5fc6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#084eaa]"
          >
            Devenir partenaire
            <ArrowUpRight size={15} />
          </button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center border border-slate-200 text-[#102a43] sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 sm:hidden">
          <div className="grid gap-1">
            {NAV.map(([label, href]) => (
              <button
                key={label}
                onClick={() => go(href)}
                className="px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={onLoginClick}
              className="px-3 py-3 text-left text-sm font-semibold"
            >
              Se connecter
            </button>
            <button
              onClick={onRegisterClick}
              className="bg-[#0b5fc6] px-3 py-3 text-left text-sm font-semibold text-white"
            >
              Devenir partenaire
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

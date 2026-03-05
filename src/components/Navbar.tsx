// src/components/Navbar.tsx
import { NavLink } from "react-router-dom";
import { useLanguage } from "../lib/LanguageContext";
import type { Language } from "../lib/i18n";

const languageLabels: Record<Language, string> = {
  pl: "PL",
  ua: "UA",
  de: "DE",
  en: "EN",
};

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { to: "/", label: t.home },
    { to: "/dom", label: t.forHome },
    { to: "/biznes", label: t.forBusiness },
    { to: "/pompy-ciepla", label: t.heatPumps },
    { to: "/finansowanie", label: t.financing },
    { to: "/projekty", label: t.projects },
    { to: "/kontakt", label: t.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:flex-nowrap">
        <NavLink to="/" className="text-base font-semibold tracking-tight text-slate-900">
          Solimax PL
        </NavLink>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600 sm:gap-3 md:gap-6 md:text-base">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-slate-900 px-4 py-2 text-white transition"
                  : "rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              }
            >
              {item.label}
            </NavLink>
          ))}
          
          {/* Language Selector */}
          <div className="relative ml-2 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1">
            {(Object.keys(languageLabels) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  language === lang
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

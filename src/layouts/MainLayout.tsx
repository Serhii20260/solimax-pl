// src/layouts/MainLayout.tsx
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import ConsultantWidget from "../components/ConsultantWidget";
import { useLanguage } from "../lib/LanguageContext";

type MainLayoutProps = {
  children?: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [consultantOpen, setConsultantOpen] = useState(false);
  const [ctaStyle, setCtaStyle] = useState<{ top?: number; bottom?: number }>({ bottom: 24 });

  useEffect(() => {
    const updatePosition = () => {
      const footer = document.getElementById("footer");
      const viewportHeight = window.innerHeight;

      // Position from bottom (above footer if visible)
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const overlap = Math.max(0, viewportHeight - footerRect.top);
        setCtaStyle({ bottom: 24 + overlap });
      } else {
        setCtaStyle({ bottom: 24 });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  // Scroll to hash after navigation
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.slice(1);
      setTimeout(() => {
        const target = document.getElementById(elementId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          // Focus on first input if it's a form
          const focusTarget = target.querySelector<HTMLElement>("input, select, textarea");
          if (focusTarget) {
            setTimeout(() => focusTarget.focus({ preventScroll: true }), 300);
          }
        }
      }, 100);
    }
  }, [location]);

  const handleLeadClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Always navigate to contact page with lead form
    navigate("/kontakt#lead-form");
  };

  const handleCalculatorClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Always navigate to calculator page
    navigate("/calculator");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar />

      <main className="flex-1 w-full pt-20 md:pt-24 pb-24 sm:pb-0">
        {children ?? <Outlet />}
      </main>

      <Footer />
      <CookieBanner />

      <div className="fixed right-4 z-40 flex flex-col items-end gap-4" style={ctaStyle}>
        <ConsultantWidget open={consultantOpen} onClose={() => setConsultantOpen(false)} />
        <Link
          to="/kontakt#lead-form"
          onClick={handleLeadClick}
          className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-4 text-lg font-semibold text-black shadow-lg hover:bg-yellow-400 transition-colors"
        >
          {t.leaveRequest}
        </Link>
        <Link
          to="/calculator"
          onClick={handleCalculatorClick}
          className="inline-flex items-center justify-center rounded-xl border-2 border-yellow-500 bg-slate-800 px-5 py-3.5 text-base font-semibold text-yellow-400 shadow-lg hover:bg-slate-700 transition-colors"
        >
          {t.calculator}
        </Link>
        <button
          type="button"
          onClick={() => setConsultantOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border-2 border-yellow-500 bg-slate-800 px-5 py-3.5 text-base font-semibold text-yellow-400 shadow-lg hover:bg-slate-700 transition-colors"
        >
          {t.consultant}
        </button>
      </div>
    </div>
  );
}

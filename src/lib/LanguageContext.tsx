import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, getTranslations } from "./i18n";

const STORAGE_KEY = "solimax_lang";

type Translations = ReturnType<typeof getTranslations>;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const detectBrowserLanguage = (): Language => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ["pl", "ua", "de", "en"].includes(stored)) {
    return stored as Language;
  }
  
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith("pl")) return "pl";
  if (navLang.startsWith("uk") || navLang.startsWith("ua")) return "ua";
  if (navLang.startsWith("de")) return "de";
  return "en";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectBrowserLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "ua" ? "uk" : lang;
  };

  useEffect(() => {
    // Set initial document lang
    document.documentElement.lang = language === "ua" ? "uk" : language;
  }, []);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

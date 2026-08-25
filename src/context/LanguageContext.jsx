import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, LANGUAGES } from "../data/languages";
import { TRANSLATIONS } from "../i18n/translations";

const STORAGE_KEY = "fitbuddy.language";
const LanguageContext = createContext(null);

function readStoredLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return LANGUAGES.some((lang) => lang.id === stored) ? stored : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next) {
    if (!LANGUAGES.some((lang) => lang.id === next)) return;
    localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
  }

  const value = useMemo(
    () => ({
      language,
      languages: LANGUAGES,
      setLanguage,
      // Looks up `key` (e.g. "nav.home") for the current language, falling
      // back to English, then to the raw key so an untranslated string
      // never renders as blank.
      t(key) {
        const entry = TRANSLATIONS[key];
        if (!entry) return key;
        return entry[language] || entry[DEFAULT_LANGUAGE] || key;
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

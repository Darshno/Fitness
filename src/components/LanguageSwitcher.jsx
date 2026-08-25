import { useLanguage } from "../context/LanguageContext";

// Compact dropdown listing every supported language by its native name.
// Drop this in anywhere (public header, Settings, onboarding) — it reads
// and writes the shared LanguageContext, so switching it anywhere updates
// every t()-driven string across the app immediately.
export default function LanguageSwitcher({ className = "" }) {
  const { language, languages, setLanguage } = useLanguage();

  return (
    <select
      className={`language-switcher ${className}`.trim()}
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="Language"
    >
      {languages.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.native}
        </option>
      ))}
    </select>
  );
}

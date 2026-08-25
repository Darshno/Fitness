import { Link, Outlet } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

export default function PublicLayout() {
  const { t } = useLanguage();

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit", padding: 0 }}>
          <div className="brand-mark">♥</div>
          <div>
            <div className="brand-name">FitBuddy</div>
            <div className="brand-sub">AI Companion</div>
          </div>
        </Link>
        <div className="btn-row" style={{ alignItems: "center" }}>
          <LanguageSwitcher />
          <Link to="/login" className="ghost-btn">{t("common.login")}</Link>
          <Link to="/signup" className="primary-btn">{t("common.getStarted")}</Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

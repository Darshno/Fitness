import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Dumbbell, Apple, Brain, TrendingUp, Settings, Moon, Sun, HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { greetingForName, applyUITheme } from "../services/userService";

function useTitles(t) {
  return {
    "/home": ["", t("topbar.homeSubtitle")],
    "/physical": [t("topbar.physicalTitle"), t("topbar.physicalSubtitle")],
    "/nutrition": [t("topbar.nutritionTitle"), t("topbar.nutritionSubtitle")],
    "/mental": [t("topbar.mentalTitle"), t("topbar.mentalSubtitle")],
    "/settings": [t("topbar.settingsTitle"), t("topbar.settingsSubtitle")],
    "/progress": [t("topbar.progressTitle"), t("topbar.progressSubtitle")],
    "/cycle-care": [t("topbar.cycleCareTitle"), t("topbar.cycleCareSubtitle")],
  };
}

export default function AppLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const TITLES = useTitles(t);
  const meta = TITLES[location.pathname] || ["FitBuddy", ""];
  const title = location.pathname === "/home"
    ? `${greetingForName(user.name)} `
    : meta[0];

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("fitbuddy.darkMode") === "true"
  );

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("fitbuddy.darkMode", String(next));
    if (next) {
      applyUITheme("dark");
    } else {
      applyUITheme(user?.companion?.color || "lavender");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"></div>
          <div>
            <div className="brand-name">FitBuddy</div>
            <div className="brand-sub">AI Companion</div>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Home size={20} strokeWidth={2} />{t("nav.home")}</NavLink>
          <NavLink to="/physical" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Dumbbell size={20} strokeWidth={2} />{t("nav.physical")}</NavLink>
          <NavLink to="/nutrition" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Apple size={20} strokeWidth={2} />{t("nav.nutrition")}</NavLink>
          <NavLink to="/mental" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Brain size={20} strokeWidth={2} />{t("nav.mental")}</NavLink>
          <NavLink to="/progress" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><TrendingUp size={20} strokeWidth={2} />{t("nav.progress")}</NavLink>
          {user?.profile?.gender === "female" && (
            <NavLink to="/cycle-care" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><HeartPulse size={20} strokeWidth={2} />{t("nav.womensCare")}</NavLink>
          )}
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Settings size={20} strokeWidth={2} />{t("nav.settings")}</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <button className="dark-toggle" onClick={toggleDark} title={isDark ? t("nav.lightMode") : t("nav.darkMode")}>
            <span className="dark-toggle-icon">
              {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </span>
            {isDark ? t("nav.lightMode") : t("nav.darkMode")}
          </button>
        </div>
      </aside>
      <main className="main">
        {location.pathname !== "/mental" && (
          <header className="topbar">
            <div>
              <h1>{title}</h1>
              <p>{meta[1]}</p>
            </div>
            <div className="top-actions">
              <NavLink to="/settings" className="avatar">{user.name[0].toUpperCase()}</NavLink>
            </div>
          </header>
        )}
        <Outlet />
      </main>
    </div>
  );
}

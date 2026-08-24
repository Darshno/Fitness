import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Dumbbell, Apple, Brain, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { greetingForName } from "../services/userService";

const TITLES = {
  "/home": ["", "Here’s your personalized plan for today"],
  "/physical": ["Physical Mode", "Your workout, food and hydration in one place."],
  "/nutrition": ["Nutrition Mode", "Meals, hydration and calories for today."],
  "/mental": ["Mental Mode", "A calmer space to check in with yourself."],
  "/settings": ["Settings", "Manage your FitBuddy preferences."],
  "/progress": ["Progress", "See your recent fitness and wellbeing trends."],
};

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const meta = TITLES[location.pathname] || ["FitBuddy", ""];
  const title = location.pathname === "/home"
    ? `${greetingForName(user.name)} `
    : meta[0];

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
          <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Home size={20} strokeWidth={2} />Home</NavLink>
          <NavLink to="/physical" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Dumbbell size={20} strokeWidth={2} />Physical</NavLink>
          <NavLink to="/nutrition" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Apple size={20} strokeWidth={2} />Nutrition</NavLink>
          <NavLink to="/mental" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Brain size={20} strokeWidth={2} />Mental</NavLink>
          <NavLink to="/progress" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><TrendingUp size={20} strokeWidth={2} />Progress</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><Settings size={20} strokeWidth={2} />Settings</NavLink>
        </nav>
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

import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FlowLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to={user?.planAccepted ? "/home" : "/"} className="brand" style={{ textDecoration: "none", color: "inherit", padding: 0 }}>
          <div className="brand-mark">♥</div>
          <div>
            <div className="brand-name">FitBuddy</div>
            <div className="brand-sub">AI Companion</div>
          </div>
        </Link>
        {user && (
          <button className="ghost-btn" onClick={logout}>Logout</button>
        )}
      </header>
      <Outlet />
    </div>
  );
}

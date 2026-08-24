import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
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
        <div className="btn-row">
          <Link to="/login" className="ghost-btn">Login</Link>
          <Link to="/signup" className="primary-btn">Get Started</Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

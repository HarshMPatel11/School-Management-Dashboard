import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Topbar({ theme, onToggleTheme, onToggleMobileSidebar, isMobileSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isStudent = user?.role === "student";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-main">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileSidebarOpen}
        >
          <MenuIcon />
        </button>

        <div>
          <h2>{isStudent ? "Student Portal" : "School Management Dashboard"}</h2>
          <p>{isStudent ? "Track your records, reports and receipts" : "Manage students, attendance and fees"}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <span className="user-pill">
          {(user?.role || "user").toUpperCase()} - {user?.name || "Unknown"}
        </span>
        <button className="btn secondary" onClick={onToggleTheme}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button className="btn danger" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Topbar;

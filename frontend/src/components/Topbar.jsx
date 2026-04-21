import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Topbar({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isStudent = user?.role === "student";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div>
        <h2>{isStudent ? "Student Portal" : "School Management Dashboard"}</h2>
        <p>{isStudent ? "Track your records, reports and receipts" : "Manage students, attendance and fees"}</p>
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

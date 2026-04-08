import React from "react";

function Topbar({ theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div>
        <h2>School Management Dashboard</h2>
        <p>Manage students, attendance and fees</p>
      </div>

      <div className="topbar-actions">
        <button className="btn secondary" onClick={onToggleTheme}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </header>
  );
}

export default Topbar;

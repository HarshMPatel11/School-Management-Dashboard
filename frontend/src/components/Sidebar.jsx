import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/students", label: "Students", icon: "👥" },
    { path: "/attendance", label: "Attendance", icon: "✓" },
    { path: "/fees", label: "Fees", icon: "💰" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">🏫</div>
        <div className="brand">School Admin</div>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

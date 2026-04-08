import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">School Admin</div>
      <nav className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/students">Students</NavLink>
        <NavLink to="/attendance">Attendance</NavLink>
        <NavLink to="/fees">Fees</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;

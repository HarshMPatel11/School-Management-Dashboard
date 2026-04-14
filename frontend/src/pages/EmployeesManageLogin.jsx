import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function EmployeesManageLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees", { params: { all: true, limit: 5000 } });
        setEmployees(res.data?.data || []);
      } catch (error) {
        showToast("Could not load employee logins", "error");
      }
    };

    fetchEmployees();
  }, [showToast]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      const username = String(e.mobile || "").toLowerCase();
      const matchesSearch = !q || [e.employeeName, e.mobile, e.role, username].some((v) => String(v || "").toLowerCase().includes(q));
      const matchesRole = !role || String(e.role || "") === role;
      return matchesSearch && matchesRole;
    });
  }, [employees, search, role]);

  const roleOptions = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.role).filter(Boolean))).sort();
  }, [employees]);

  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      showToast(`${label} copied`, "success");
    } catch (error) {
      showToast("Copy failed", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="page-header" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="page-title">Employees Login</h2>
            <p className="page-subtitle">View and manage employee login credentials.</p>
          </div>
        </div>

        <div className="toolbar">
          <input
            placeholder="Search employee / username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles</option>
            {roleOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button className="btn secondary" onClick={() => { setSearch(""); setRole(""); }}>Reload All</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No employee login records found</td>
                </tr>
              ) : (
                rows.map((employee) => {
                  const username = String(employee.mobile || "").toLowerCase();
                  const password = employee.mobile || "";

                  return (
                    <tr key={employee._id}>
                      <td>{employee._id?.slice(-6).toUpperCase()}</td>
                      <td>{employee.employeeName}</td>
                      <td>{employee.role}</td>
                      <td>{username}</td>
                      <td>{password}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn secondary" onClick={() => copyText(username, "Username")}>Copy User</button>
                          <button className="btn secondary" onClick={() => copyText(password, "Password")}>Copy Pass</button>
                          <button className="btn warning" onClick={() => navigate(`/employees/job-letter/${employee._id}`)}>Job Letter</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeesManageLogin;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiOrigin = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, "")
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";

const resolvePhotoUrl = (photoUrl) => {
  if (!photoUrl) return "";
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return apiOrigin ? `${apiOrigin}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}` : photoUrl;
};

function EmployeeAvatar({ employee }) {
  if (employee.photoUrl) {
    return <img src={resolvePhotoUrl(employee.photoUrl)} alt={employee.employeeName} className="employee-avatar" />;
  }

  const initials = (employee.employeeName || "E")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return <div className="employee-avatar employee-avatar-fallback">{initials}</div>;
}

function AllEmployees() {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useToast();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 });

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees", { params: { search, role, page, limit: 12 } });
      setEmployees(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 12 });
    } catch (error) {
      showToast("Failed to load employees", "error");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, role, page]);

  useEffect(() => {
    setPage(1);
  }, [search, role]);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("This will permanently delete this employee.");
    if (!confirmed) return;

    try {
      await api.delete(`/employees/${id}`);
      showToast("Employee deleted", "success");

      if (employees.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }

      fetchEmployees();
    } catch (error) {
      showToast("Failed to delete employee", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Employees</h1>
          <p className="page-subtitle">Manage all staff and their records</p>
        </div>
        <button className="btn primary" onClick={() => navigate("/employees/new")}>+ Add New</button>
      </div>

      <div className="card">
        <div className="toolbar employee-toolbar">
          <input
            placeholder="Search Employee"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Teacher">Teacher</option>
            <option value="Principal">Principal</option>
            <option value="Accountant">Accountant</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        <div className="employee-grid">
          {employees.length === 0 ? (
            <div className="empty-panel">No employees found</div>
          ) : (
            employees.map((employee) => (
              <div key={employee._id} className="employee-card">
                <EmployeeAvatar employee={employee} />
                <h3>{employee.employeeName}</h3>
                <p>{employee.role}</p>
                <small>{employee.mobile}</small>

                <div className="employee-actions">
                  <button className="btn warning" onClick={() => navigate(`/employees/edit/${employee._id}`)}>Edit</button>
                  <button className="btn danger" onClick={() => handleDelete(employee._id)}>Delete</button>
                </div>
              </div>
            ))
          )}

          <button className="employee-add-card" type="button" onClick={() => navigate("/employees/new")}>
            <span className="subject-add-plus">+</span>
            <span>Add New</span>
          </button>
        </div>

        <div className="pagination-row">
          <button
            className="btn secondary"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} | Total: {pagination.total}
          </span>
          <button
            className="btn secondary"
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages || 1))}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllEmployees;

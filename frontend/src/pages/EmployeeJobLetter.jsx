import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function EmployeeJobLetter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(id || "");
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees", { params: { all: true, limit: 5000 } });
        setEmployees(res.data?.data || []);
      } catch (error) {
        showToast("Could not load employees", "error");
      }
    };

    fetchEmployees();
  }, [showToast]);

  useEffect(() => {
    if (!selectedId && employees.length) {
      setSelectedId(employees[0]._id);
    }
  }, [employees, selectedId]);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!selectedId) return;
      try {
        const res = await api.get(`/employees/${selectedId}`);
        setEmployee(res.data);
      } catch (error) {
        showToast("Could not load employee details", "error");
      }
    };

    fetchEmployee();
  }, [selectedId, showToast]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.employeeName, e.mobile, e.role].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [employees, search]);

  return (
    <div className="page-container admission-page">
      <div className="card">
        <div className="page-header" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="page-title">Employee Job Letter</h2>
            <p className="page-subtitle">Generate and print appointment/job letter.</p>
          </div>
          <button className="btn secondary" onClick={() => navigate("/employees")}>Back to Employees</button>
        </div>

        <div className="admission-toolbar no-print">
          <input
            className="admission-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee by name, mobile or role"
          />
          <select className="admission-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {filteredEmployees.map((e) => (
              <option key={e._id} value={e._id}>{e.employeeName} ({e.role})</option>
            ))}
          </select>
          <button className="btn primary" onClick={() => window.print()} disabled={!employee}>Print Job Letter</button>
        </div>

        {!employee ? (
          <div className="empty-panel">Select an employee to generate the job letter.</div>
        ) : (
          <div className="admission-letter-sheet">
            <div className="admission-header-band">
              <div>
                <h3>APPOINTMENT LETTER</h3>
                <p>School Management Dashboard</p>
              </div>
              <div className="admission-date">{formatDate(new Date())}</div>
            </div>

            <div style={{ marginTop: 16, lineHeight: 1.6 }}>
              <p><strong>To:</strong> {employee.employeeName}</p>
              <p><strong>Role:</strong> {employee.role}</p>
              <p><strong>Date of Joining:</strong> {formatDate(employee.dateOfJoining)}</p>
              <p><strong>Monthly Salary:</strong> {employee.monthlySalary}</p>

              <p style={{ marginTop: 14 }}>
                Dear {employee.employeeName},
              </p>
              <p>
                We are pleased to appoint you as <strong>{employee.role}</strong> in our institute.
                Your date of joining is <strong>{formatDate(employee.dateOfJoining)}</strong>.
                You are expected to follow institute policies and maintain professional conduct.
              </p>
              <p>
                Your login credentials for the system are:
              </p>
              <p><strong>Username:</strong> {String(employee.mobile || "").toLowerCase()}</p>
              <p><strong>Password:</strong> {employee.mobile || "-"}</p>
              <p>
                Please change your password after first login.
              </p>
            </div>

            <div className="admission-sign-row">
              <div>Employee Signature</div>
              <div>Authorized Signature</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeJobLetter;

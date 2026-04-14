import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function StudentsManageLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students", { params: { all: true, limit: 5000 } });
        setStudents(res.data?.data || []);
      } catch (error) {
        showToast("Could not load student logins", "error");
      }
    };

    fetchStudents();
  }, [showToast]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch = !q || [s.fullName, s.rollNumber, s.loginUsername].some((v) => String(v || "").toLowerCase().includes(q));
      const matchesClass = !className || String(s.className || "") === className;
      return matchesSearch && matchesClass;
    });
  }, [students, search, className]);

  const classOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.className).filter(Boolean))).sort();
  }, [students]);

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
            <h2 className="page-title">Students Login</h2>
            <p className="page-subtitle">View and manage student login credentials.</p>
          </div>
        </div>

        <div className="toolbar">
          <input
            placeholder="Search student / username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="">All Classes</option>
            {classOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button className="btn secondary" onClick={() => { setSearch(""); setClassName(""); }}>Reload All</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No student login records found</td>
                </tr>
              ) : (
                rows.map((student) => (
                  <tr key={student._id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.fullName}</td>
                    <td>{student.className}</td>
                    <td>{student.loginUsername || String(student.rollNumber || "").toLowerCase()}</td>
                    <td>{student.loginPassword || student.rollNumber}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn secondary" onClick={() => copyText(student.loginUsername || String(student.rollNumber || "").toLowerCase(), "Username")}>Copy User</button>
                        <button className="btn secondary" onClick={() => copyText(student.loginPassword || student.rollNumber, "Password")}>Copy Pass</button>
                        <button className="btn warning" onClick={() => navigate(`/students/admission-letter/${student._id}`)}>Letter</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentsManageLogin;

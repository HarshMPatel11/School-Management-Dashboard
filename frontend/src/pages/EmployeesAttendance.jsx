import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const today = new Date().toISOString().slice(0, 10);

function EmployeesAttendance() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [rows, setRows] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);

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

  const loadSheet = async () => {
    setLoadingSheet(true);
    try {
      const recordsRes = await api.get("/attendance/employee", {
        params: { all: true, date: selectedDate, limit: 5000 },
      });

      const records = recordsRes.data?.data || [];
      const statusMap = new Map(records.map((r) => [r.employee?._id, r.status]));

      const mapped = employees.map((emp) => ({
        employeeId: emp._id,
        employeeCode: emp._id?.slice(-6).toUpperCase(),
        employeeName: emp.employeeName,
        role: emp.role,
        fatherOrHusbandName: emp.fatherOrHusbandName || "-",
        status: statusMap.get(emp._id) || "Present",
      }));

      setRows(mapped);
      setAlreadyTaken(records.length > 0);
    } catch (error) {
      showToast("Could not load attendance sheet", "error");
    } finally {
      setLoadingSheet(false);
    }
  };

  const setAllStatus = (status) => {
    setRows((prev) => prev.map((row) => ({ ...row, status })));
  };

  const updateRowStatus = (employeeId, status) => {
    setRows((prev) => prev.map((row) => (row.employeeId === employeeId ? { ...row, status } : row)));
  };

  const saveAttendance = async () => {
    if (rows.length === 0) {
      showToast("No rows to update", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.post("/attendance/employee/bulk", {
        date: selectedDate,
        records: rows.map((row) => ({ employee: row.employeeId, status: row.status })),
      });
      showToast("Employee attendance updated", "success");
      setAlreadyTaken(true);
    } catch (error) {
      showToast(error.response?.data?.message || "Could not update attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card attendance-sheet-card">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Mark or Update Employee Attendance</h2>
            <p className="page-subtitle">Select date, load employees, edit statuses and update once.</p>
          </div>
        </div>

        <div className="fees-tabs">
          <button className="fees-tab active" type="button">Manual Attendance</button>
          <button className="fees-tab" type="button" disabled>Card Scanning</button>
        </div>

        <div className="fees-generate-grid">
          <div className="fees-field">
            <label>Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        <div className="fees-generate-actions">
          <button className="btn primary" type="button" onClick={loadSheet} disabled={loadingSheet}>
            {loadingSheet ? "Loading..." : "Submit"}
          </button>
        </div>

        {rows.length > 0 && (
          <div className="attendance-editor-wrap">
            <div className="attendance-sheet-topline">
              <span className={`attendance-pill ${alreadyTaken ? "ok" : "warn"}`}>
                {alreadyTaken ? "Already taken" : "New sheet"}
              </span>
              <strong>Employees</strong>
              <span>{selectedDate}</span>
            </div>

            <div className="attendance-quick-actions">
              <button type="button" className="btn secondary" onClick={() => setAllStatus("Present")}>All Present</button>
              <button type="button" className="btn secondary" onClick={() => setAllStatus("Late")}>All Late</button>
              <button type="button" className="btn secondary" onClick={() => setAllStatus("Absent")}>All Absent</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee Name</th>
                    <th>Father Name</th>
                    <th>Employee Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.employeeId}>
                      <td>{row.employeeCode}</td>
                      <td>{row.employeeName}</td>
                      <td>{row.fatherOrHusbandName}</td>
                      <td>{row.role}</td>
                      <td>
                        <div className="attendance-status-switch">
                          <button type="button" className={`status-dot ${row.status === "Present" ? "active present" : ""}`} onClick={() => updateRowStatus(row.employeeId, "Present")}>P</button>
                          <button type="button" className={`status-dot ${row.status === "Late" ? "active late" : ""}`} onClick={() => updateRowStatus(row.employeeId, "Late")}>L</button>
                          <button type="button" className={`status-dot ${row.status === "Absent" ? "active absent" : ""}`} onClick={() => updateRowStatus(row.employeeId, "Absent")}>A</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="fees-generate-actions" style={{ justifyContent: "center" }}>
              <button className="btn primary" type="button" onClick={saveAttendance} disabled={saving}>
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeesAttendance;

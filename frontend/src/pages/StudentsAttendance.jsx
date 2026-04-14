import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const today = new Date().toISOString().slice(0, 10);

function StudentsAttendance() {
  const { showToast } = useToast();
  const [allStudents, setAllStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState("");
  const [rows, setRows] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students", { params: { all: true, limit: 5000 } });
        const data = res.data?.data || [];
        setAllStudents(data);
        if (!selectedClass && data.length > 0) {
          setSelectedClass(data[0].className || "");
        }
      } catch (error) {
        showToast("Could not load students", "error");
      }
    };

    fetchStudents();
  }, [showToast, selectedClass]);

  const classOptions = useMemo(() => {
    return Array.from(new Set(allStudents.map((s) => s.className).filter(Boolean))).sort();
  }, [allStudents]);

  const loadSheet = async () => {
    if (!selectedClass) {
      showToast("Please select class", "warning");
      return;
    }

    setLoadingSheet(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get("/students", { params: { all: true, className: selectedClass, limit: 5000 } }),
        api.get("/attendance", { params: { all: true, date: selectedDate, limit: 5000 } }),
      ]);

      const students = studentsRes.data?.data || [];
      const records = attendanceRes.data?.data || [];
      const statusMap = new Map(records.map((r) => [r.student?._id, r.status]));

      const mapped = students.map((student) => ({
        studentId: student._id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        parentName: student.parentName || "-",
        status: statusMap.get(student._id) || "Present",
      }));

      setRows(mapped);
      setAlreadyTaken(records.some((r) => r.student?.className === selectedClass));
    } catch (error) {
      showToast("Could not load attendance sheet", "error");
    } finally {
      setLoadingSheet(false);
    }
  };

  const setAllStatus = (status) => {
    setRows((prev) => prev.map((row) => ({ ...row, status })));
  };

  const updateRowStatus = (studentId, status) => {
    setRows((prev) => prev.map((row) => (row.studentId === studentId ? { ...row, status } : row)));
  };

  const saveAttendance = async () => {
    if (rows.length === 0) {
      showToast("No rows to update", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.post("/attendance/bulk", {
        date: selectedDate,
        records: rows.map((row) => ({ student: row.studentId, status: row.status })),
      });
      showToast("Student attendance updated", "success");
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
            <h2 className="page-title">Mark or Update Student Attendance</h2>
            <p className="page-subtitle">Choose date and class, then edit quickly and update once.</p>
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
          <div className="fees-field">
            <label>Search Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">Select Class</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
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
              <strong>{selectedClass}</strong>
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
                    <th>Student Name</th>
                    <th>Guardian</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.studentId}>
                      <td>{row.rollNumber}</td>
                      <td>{row.fullName}</td>
                      <td>{row.parentName}</td>
                      <td>
                        <div className="attendance-status-switch">
                          <button type="button" className={`status-dot ${row.status === "Present" ? "active present" : ""}`} onClick={() => updateRowStatus(row.studentId, "Present")}>P</button>
                          <button type="button" className={`status-dot ${row.status === "Late" ? "active late" : ""}`} onClick={() => updateRowStatus(row.studentId, "Late")}>L</button>
                          <button type="button" className={`status-dot ${row.status === "Absent" ? "active absent" : ""}`} onClick={() => updateRowStatus(row.studentId, "Absent")}>A</button>
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

export default StudentsAttendance;

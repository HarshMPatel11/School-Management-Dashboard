import React, { useEffect, useState } from "react";
import api from "../api/axios";

// Convert YYYY-MM-DD → short day name (Mon, Tue, …)
function getDayName(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

// Format YYYY-MM-DD → DD-MM-YY (like eSkooly)
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y.slice(2)}`;
}

function StudentsAttendanceReport() {
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/student-report", {
        params: { from, to },
      });
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  // ── Export helpers ────────────────────────────────────
  const headerRow = ["Date", "Day", "Present", "Absent", "Late", "Total"];

  const toRow = (r) => [
    formatDate(r.date),
    getDayName(r.date),
    r.present,
    r.absent,
    r.late,
    r.total,
  ];

  const handleCopy = () => {
    const lines = [
      headerRow.join("\t"),
      ...rows.map((r) => toRow(r).join("\t")),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  };

  const downloadFile = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSV = () => {
    const lines = [
      headerRow.join(","),
      ...rows.map((r) => toRow(r).join(",")),
    ];
    downloadFile(lines.join("\n"), "student-attendance-report.csv", "text/csv");
  };

  const handleExcel = () => {
    const lines = [
      headerRow.join("\t"),
      ...rows.map((r) => toRow(r).join("\t")),
    ];
    downloadFile(
      lines.join("\n"),
      "student-attendance-report.xls",
      "application/vnd.ms-excel"
    );
  };

  const handlePDF = () => window.print();

  return (
    <div className="report-shell">
      <div className="card">
        <div className="report-header">
          <h3>Students Attendance Report</h3>
          <div className="report-filter-bar">
            <label>From:</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <label>To:</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <button className="btn primary" onClick={fetchReport}>
              Search
            </button>
          </div>
        </div>

        <div className="report-export-bar">
          <button className="report-export-btn" onClick={handleCopy}>Copy</button>
          <button className="report-export-btn" onClick={handleCSV}>CSV</button>
          <button className="report-export-btn" onClick={handleExcel}>Excel</button>
          <button className="report-export-btn" onClick={handlePDF}>PDF</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>DAY</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-row">Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.date}>
                    <td>{formatDate(r.date)}</td>
                    <td>{getDayName(r.date)}</td>
                    <td>
                      <span className="badge present">{r.present}</span>
                    </td>
                    <td>
                      <span className="badge absent">{r.absent}</span>
                    </td>
                    <td>
                      <span className="badge late">{r.late}</span>
                    </td>
                    <td>{r.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="report-count">
          Showing 1 to {rows.length} of {rows.length} entries
        </p>
      </div>
    </div>
  );
}

export default StudentsAttendanceReport;

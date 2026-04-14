import React, { useEffect, useState } from "react";
import api from "../api/axios";

function ClassWiseReport() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/class-report", { params: { date } });
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [date]);

  const totalPresent = rows.reduce((s, r) => s + r.present, 0);
  const totalAbsent = rows.reduce((s, r) => s + r.absent, 0);
  const totalLate = rows.reduce((s, r) => s + r.late, 0);
  const totalAll = rows.reduce((s, r) => s + r.total, 0);

  const pct = (present, late, total) =>
    total ? (((present + late) / total) * 100).toFixed(1) + "%" : "—";

  // ── Export helpers ────────────────────────────────────
  const headerRow = ["Class", "Present", "Absent", "Late", "Total", "Attendance %"];

  const toCSVRow = (r) => [
    r.className,
    r.present,
    r.absent,
    r.late,
    r.total,
    pct(r.present, r.late, r.total),
  ];

  const handleCopy = () => {
    const lines = [
      headerRow.join("\t"),
      ...rows.map((r) => toCSVRow(r).join("\t")),
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
      ...rows.map((r) => toCSVRow(r).join(",")),
    ];
    downloadFile(lines.join("\n"), `class-wise-report-${date}.csv`, "text/csv");
  };

  const handleExcel = () => {
    // Tab-separated, .xls extension — opens in Excel
    const lines = [
      headerRow.join("\t"),
      ...rows.map((r) => toCSVRow(r).join("\t")),
    ];
    downloadFile(lines.join("\n"), `class-wise-report-${date}.xls`, "application/vnd.ms-excel");
  };

  const handlePDF = () => window.print();

  return (
    <div className="report-shell">
      <div className="card">
        <div className="report-header">
          <h3>Class Wise Attendance Report</h3>
          <div className="report-filter-bar">
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
                <th>Class</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Total</th>
                <th>Attendance %</th>
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
                    No attendance data for {date}
                  </td>
                </tr>
              ) : (
                <>
                  {rows.map((r) => (
                    <tr key={r.className}>
                      <td>{r.className}</td>
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
                      <td>{pct(r.present, r.late, r.total)}</td>
                    </tr>
                  ))}
                  <tr className="report-totals-row">
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>{totalPresent}</strong>
                    </td>
                    <td>
                      <strong>{totalAbsent}</strong>
                    </td>
                    <td>
                      <strong>{totalLate}</strong>
                    </td>
                    <td>
                      <strong>{totalAll}</strong>
                    </td>
                    <td>
                      <strong>{pct(totalPresent, totalLate, totalAll)}</strong>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <p className="report-count">
          Showing {rows.length} class{rows.length !== 1 ? "es" : ""}
        </p>
      </div>
    </div>
  );
}

export default ClassWiseReport;

import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const downloadFile = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function StudentsInfoReport() {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      const res = await api.get("/students", { params: { all: true, limit: 5000 } });
      setStudents(res.data?.data || []);
    };
    loadStudents();
  }, []);

  const classOptions = useMemo(
    () => Array.from(new Set(students.map((student) => student.className).filter(Boolean))).sort(),
    [students]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesClass = !selectedClass || student.className === selectedClass;
      const matchesSearch = !q || [student.rollNumber, student.fullName, student.parentName, student.className]
        .some((value) => String(value || "").toLowerCase().includes(q));
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, search]);

  const headerRow = [
    "Sr",
    "ID",
    "Student Name",
    "Parent Name",
    "Class",
    "Section",
    "Admission Date",
    "Gender",
    "Contact No",
    "Email",
    "Address",
    "Status",
  ];

  const dataRows = rows.map((student, index) => [
    index + 1,
    student.rollNumber,
    student.fullName,
    student.parentName || "",
    student.className,
    student.section,
    student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "",
    student.gender,
    student.contactNumber || "",
    student.email || "",
    student.address || "",
    "Active",
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText([headerRow.join("\t"), ...dataRows.map((row) => row.join("\t"))].join("\n"));
  };

  const handleCSV = () => {
    downloadFile([headerRow.join(","), ...dataRows.map((row) => row.join(","))].join("\n"), "students-info-report.csv", "text/csv");
  };

  const handleExcel = () => {
    downloadFile([headerRow.join("\t"), ...dataRows.map((row) => row.join("\t"))].join("\n"), "students-info-report.xls", "application/vnd.ms-excel");
  };

  return (
    <div className="report-shell">
      <div className="card">
        <div className="report-header">
          <h3>Students Info Report</h3>
          <div className="report-filter-bar">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">All Classes</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students" />
          </div>
        </div>

        <div className="report-export-bar">
          <button className="report-export-btn" onClick={handleCopy}>Copy</button>
          <button className="report-export-btn" onClick={handleCSV}>CSV</button>
          <button className="report-export-btn" onClick={handleExcel}>Excel</button>
          <button className="report-export-btn" onClick={() => window.print()}>PDF</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {headerRow.map((header) => <th key={header}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={headerRow.length} className="empty-row">No students found</td>
                </tr>
              ) : (
                dataRows.map((row, index) => (
                  <tr key={`${row[1]}-${index}`}>
                    {row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="report-count">Showing 1 to {rows.length} of {rows.length} entries</p>
      </div>
    </div>
  );
}

export default StudentsInfoReport;

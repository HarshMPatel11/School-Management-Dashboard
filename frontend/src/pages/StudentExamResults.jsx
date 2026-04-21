import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function StudentExamResults() {
  const { showToast } = useToast();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/student-portal/exam-results");
        setResults(res.data.results || []);
      } catch (error) {
        showToast("Could not load exam results", "error");
      }
    };
    load();
  }, [showToast]);

  return (
    <div className="report-shell">
      <div className="card">
        <div className="report-header">
          <h3>Exam Results</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Obtained</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan="6" className="empty-row">No exam result found</td></tr>
              ) : results.map((row) => (
                <tr key={row.examId}>
                  <td>{row.examName}</td>
                  <td>{row.obtainedMarks}</td>
                  <td>{row.totalMarks}</td>
                  <td>{row.percentage.toFixed(1)}%</td>
                  <td>{row.grade}</td>
                  <td><span className={`badge ${row.status === "PASS" ? "paid" : "unpaid"}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentExamResults;

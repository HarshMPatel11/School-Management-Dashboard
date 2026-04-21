import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function StudentTestResults() {
  const { showToast } = useToast();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/student-portal/class-test-results");
        setResults(res.data.results || []);
      } catch (error) {
        showToast("Could not load test results", "error");
      }
    };
    load();
  }, [showToast]);

  return (
    <div className="report-shell">
      <div className="card">
        <div className="report-header">
          <h3>Test Results</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Total</th>
                <th>Obtained</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan="6" className="empty-row">No test result found</td></tr>
              ) : results.map((row) => (
                <tr key={row._id}>
                  <td>{new Date(row.testDate).toLocaleDateString()}</td>
                  <td>{row.subjectName}</td>
                  <td>{row.totalMarks}</td>
                  <td>{row.obtainedMarks}</td>
                  <td>{row.percentage.toFixed(1)}%</td>
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

export default StudentTestResults;

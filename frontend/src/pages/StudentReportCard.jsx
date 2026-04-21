import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function StudentReportCard() {
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get("/student-portal/exam-results");
        const results = res.data.results || [];
        setExams(results);
        if (results[0]) setSelectedExamId(results[0].examId);
      } catch (error) {
        showToast("Could not load report card setup", "error");
      }
    };
    loadExams();
  }, [showToast]);

  useEffect(() => {
    const loadReport = async () => {
      if (!selectedExamId) return;
      try {
        const res = await api.get("/student-portal/report-card", { params: { examId: selectedExamId } });
        setReport(res.data);
      } catch (error) {
        setReport(null);
        showToast(error.response?.data?.message || "Could not load report card", "error");
      }
    };
    loadReport();
  }, [selectedExamId, showToast]);

  if (!exams.length) return <div className="card empty-panel">No report card data available yet.</div>;

  return (
    <div className="page-container report-card-page">
      <div className="card no-print">
        <div className="report-card-toolbar">
          <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
            {exams.map((exam) => (
              <option key={exam.examId} value={exam.examId}>{exam.examName}</option>
            ))}
          </select>
          <button className="btn secondary" type="button" onClick={() => window.print()} disabled={!report}>
            Print Report Card
          </button>
        </div>
      </div>

      {report ? (
        <div className="card report-card-sheet">
          <div className="report-card-brand">
            <div className="report-card-logo">S</div>
            <div>
              <h2>Student Report Card</h2>
              <p>{report.exam?.name}</p>
            </div>
          </div>

          <div className="report-card-student-grid">
            <div className="report-card-photo-box">
              <div className="report-card-photo report-card-photo--fallback">
                {(report.student?.fullName || "S").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
              </div>
            </div>
            <div className="report-card-info-box">
              <div><span>Name</span><strong>{report.student?.fullName}</strong></div>
              <div><span>Registration</span><strong>{report.student?.rollNumber}</strong></div>
              <div><span>Class</span><strong>{report.student?.className} {report.student?.section}</strong></div>
            </div>
            <div className="report-card-info-box">
              <div><span>Attendance</span><strong>{Number(report.attendance?.percentage || 0).toFixed(2)}%</strong></div>
              <div><span>Grade</span><strong>{report.summary?.grade}</strong></div>
              <div><span>Status</span><strong>{report.summary?.status}</strong></div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Obtained</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.marks?.map((mark) => (
                  <tr key={mark.subjectName}>
                    <td>{mark.subjectName}</td>
                    <td>{mark.totalMarks}</td>
                    <td>{mark.obtainedMarks}</td>
                    <td>{mark.totalMarks ? ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StudentReportCard;

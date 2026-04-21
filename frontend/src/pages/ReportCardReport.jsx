import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiOrigin = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, "")
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";

const resolvePhotoUrl = (photoUrl) => {
  if (!photoUrl) return "";
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return apiOrigin ? `${apiOrigin}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}` : photoUrl;
};

const getGrade = (percentage) => {
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B+";
  if (percentage >= 50) return "B";
  if (percentage >= 40) return "C";
  if (percentage >= 33) return "D";
  return "F";
};

function ReportCardReport() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [studentRes, examRes] = await Promise.all([
          api.get("/students", { params: { all: true, limit: 5000 } }),
          api.get("/exams"),
        ]);
        const studentData = studentRes.data?.data || [];
        const examData = examRes.data || [];
        setStudents(studentData);
        setExams(examData);
        if (studentData[0]) {
          setSelectedStudentId(studentData[0]._id);
          setQuery(`${studentData[0].rollNumber} - ${studentData[0].fullName} - ${studentData[0].className}`);
        }
        if (examData[0]) setSelectedExamId(examData[0]._id);
      } catch (error) {
        showToast("Failed to load report card setup", "error");
      }
    };

    loadInitial();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students.slice(0, 8);
    return students
      .filter((student) =>
        [student.rollNumber, student.fullName, student.className].some((value) =>
          String(value || "").toLowerCase().includes(q)
        )
      )
      .slice(0, 8);
  }, [students, query]);

  const selectedStudent = useMemo(
    () => students.find((student) => student._id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const generateReport = async () => {
    if (!selectedStudentId || !selectedExamId) {
      showToast("Please select student and exam", "warning");
      return;
    }

    setLoading(true);
    try {
      const [studentResultRes, classResultRes, attendanceRes, classTestsRes] = await Promise.all([
        api.get("/exams/result/student", {
          params: { examId: selectedExamId, studentId: selectedStudentId },
        }),
        api.get("/exams/result/class", {
          params: { examId: selectedExamId, className: selectedStudent?.className },
        }),
        api.get(`/attendance/summary/${selectedStudentId}`),
        api.get("/class-tests", { params: { className: selectedStudent?.className } }),
      ]);

      const classResults = classResultRes.data?.results || [];
      const studentInClass = classResults.find((item) => String(item.studentId) === String(selectedStudentId));
      const studentPosition = classResults.findIndex((item) => String(item.studentId) === String(selectedStudentId)) + 1;

      const classTestRows = (classTestsRes.data || [])
        .map((test) => {
          const entry = (test.entries || []).find((item) => String(item.student) === String(selectedStudentId));
          return {
            subjectName: test.subjectName,
            totalMarks: Number(test.totalMarks || 0),
            obtainedMarks: Number(entry?.obtainedMarks || 0),
          };
        })
        .filter((item) => item.totalMarks > 0);

      const mergedClassTests = Object.values(
        classTestRows.reduce((acc, row) => {
          if (!acc[row.subjectName]) {
            acc[row.subjectName] = { subjectName: row.subjectName, totalMarks: 0, obtainedMarks: 0 };
          }
          acc[row.subjectName].totalMarks += row.totalMarks;
          acc[row.subjectName].obtainedMarks += row.obtainedMarks;
          return acc;
        }, {})
      );

      setReport({
        studentResult: studentResultRes.data,
        attendance: attendanceRes.data,
        classResults,
        classAverages: classResultRes.data?.subjectAverages || [],
        classTestSummary: mergedClassTests,
        comparison: {
          strength: classResults.length,
          average: classResults.length
            ? classResults.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / classResults.length
            : 0,
          max: classResults.length ? Math.max(...classResults.map((item) => Number(item.percentage || 0))) : 0,
          min: classResults.length ? Math.min(...classResults.map((item) => Number(item.percentage || 0))) : 0,
          position: studentPosition,
          student: studentInClass,
        },
      });
    } catch (error) {
      setReport(null);
      showToast(error.response?.data?.message || "Failed to generate report card", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container report-card-page">
      <div className="card no-print">
        <div className="report-card-toolbar">
          <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>{exam.name}</option>
            ))}
          </select>

          <div className="report-card-search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student by roll number, name or class"
            />
            {query && filteredStudents.length > 0 ? (
              <div className="report-card-search-list">
                {filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    type="button"
                    className="report-card-search-item"
                    onClick={() => {
                      setSelectedStudentId(student._id);
                      setQuery(`${student.rollNumber} - ${student.fullName} - ${student.className}`);
                    }}
                  >
                    {student.rollNumber} - {student.fullName} - {student.className}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button className="btn primary" type="button" onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
          <button className="btn secondary" type="button" onClick={() => window.print()} disabled={!report}>
            Print Report Card
          </button>
        </div>
      </div>

      {report ? (
        <div className="card report-card-sheet">
          <div className="report-card-brand">
            <div className="report-card-logo">e</div>
            <div>
              <h2>School Management Dashboard</h2>
              <p>Student Report Card</p>
            </div>
          </div>

          <div className="report-card-student-grid">
            <div className="report-card-photo-box">
              {report.studentResult.student?.photoUrl ? (
                <img
                  src={resolvePhotoUrl(report.studentResult.student.photoUrl)}
                  alt={report.studentResult.student.fullName}
                  className="report-card-photo"
                />
              ) : (
                <div className="report-card-photo report-card-photo--fallback">
                  {(report.studentResult.student?.fullName || "S")
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="report-card-info-box">
              <div><span>Registration</span><strong>{report.studentResult.student?.rollNumber}</strong></div>
              <div><span>Name</span><strong>{report.studentResult.student?.fullName}</strong></div>
              <div><span>Class</span><strong>{report.studentResult.student?.className} {report.studentResult.student?.section}</strong></div>
              <div><span>Exam</span><strong>{report.studentResult.exam?.name}</strong></div>
            </div>

            <div className="report-card-info-box">
              <div><span>Attendance</span><strong>{report.attendance?.percentage || "0.00"}%</strong></div>
              <div><span>Leaves</span><strong>{report.attendance?.late || 0}</strong></div>
              <div><span>Absents</span><strong>{report.attendance?.absent || 0}</strong></div>
              <div><span>Status</span><strong>{report.studentResult.summary?.status}</strong></div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Examination</th>
                  {report.studentResult.marks?.map((mark) => (
                    <th key={mark.subjectName}>{mark.subjectName} ({mark.totalMarks})</th>
                  ))}
                  <th>Obtained</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{report.studentResult.exam?.name}</td>
                  {report.studentResult.marks?.map((mark) => (
                    <td key={mark.subjectName}>{mark.obtainedMarks}</td>
                  ))}
                  <td>{report.studentResult.summary?.obtainedMarks}</td>
                  <td>{report.studentResult.summary?.totalMarks}</td>
                  <td>{Number(report.studentResult.summary?.percentage || 0).toFixed(2)}%</td>
                  <td>{getGrade(Number(report.studentResult.summary?.percentage || 0))}</td>
                  <td>{report.studentResult.summary?.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-card-summary-grid">
            <div className="card">
              <h3>Subject Wise Performance</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Total</th>
                      <th>Obtained</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.studentResult.marks?.map((mark) => {
                      const percentage = mark.totalMarks ? (mark.obtainedMarks / mark.totalMarks) * 100 : 0;
                      return (
                        <tr key={mark.subjectName}>
                          <td>{mark.subjectName}</td>
                          <td>{mark.totalMarks}</td>
                          <td>{mark.obtainedMarks}</td>
                          <td>{percentage.toFixed(1)}%</td>
                          <td>{getGrade(percentage)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>Comparison With Class</h3>
              <div className="report-metric-grid">
                <div><span>Class Strength</span><strong>{report.comparison.strength} students</strong></div>
                <div><span>Class Average</span><strong>{report.comparison.average.toFixed(1)}%</strong></div>
                <div><span>Class Max Average</span><strong>{report.comparison.max.toFixed(1)}%</strong></div>
                <div><span>Class Min Average</span><strong>{report.comparison.min.toFixed(1)}%</strong></div>
                <div><span>Student Position</span><strong>{report.comparison.position || "-"} of {report.comparison.strength || 0}</strong></div>
              </div>
            </div>
          </div>

          <div className="report-card-summary-grid">
            <div className="card">
              <h3>Cognitive Domain - Class Tests</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Total Tests Marks</th>
                      <th>Obtained</th>
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.classTestSummary.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-row">No class test data found</td>
                      </tr>
                    ) : (
                      report.classTestSummary.map((item) => (
                        <tr key={item.subjectName}>
                          <td>{item.subjectName}</td>
                          <td>{item.totalMarks}</td>
                          <td>{item.obtainedMarks}</td>
                          <td>{item.totalMarks ? ((item.obtainedMarks / item.totalMarks) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>Final Summary</h3>
              <div className="report-metric-grid">
                <div><span>Total Score</span><strong>{report.studentResult.summary?.obtainedMarks} / {report.studentResult.summary?.totalMarks}</strong></div>
                <div><span>Percentage</span><strong>{Number(report.studentResult.summary?.percentage || 0).toFixed(2)}%</strong></div>
                <div><span>Grade</span><strong>{getGrade(Number(report.studentResult.summary?.percentage || 0))}</strong></div>
                <div><span>Status</span><strong>{report.studentResult.summary?.status}</strong></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReportCardReport;

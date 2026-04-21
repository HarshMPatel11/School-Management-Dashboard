import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function ExamResultCard() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("student");
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [studentResult, setStudentResult] = useState(null);
  const [classResult, setClassResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInitial = async () => {
    try {
      const [examRes, classRes, studentRes] = await Promise.all([
        api.get("/exams"),
        api.get("/classes", { params: { page: 1, limit: 1000 } }),
        api.get("/students", { params: { all: true, limit: 5000 } }),
      ]);

      const examData = examRes.data || [];
      const classData = classRes.data?.data || [];
      const studentData = studentRes.data?.data || [];

      setExams(examData);
      setClasses(classData);
      setStudents(studentData);
      if (examData[0]) setSelectedExamId(examData[0]._id);
      if (classData[0]) setSelectedClass(classData[0].name);
      if (studentData[0]) setSelectedStudentId(studentData[0]._id);
    } catch (error) {
      showToast("Failed to load result card setup", "error");
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return students;
    return students.filter((student) => student.className === selectedClass);
  }, [students, selectedClass]);

  useEffect(() => {
    if (filteredStudents.length && !filteredStudents.some((student) => student._id === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0]._id);
    }
  }, [filteredStudents, selectedStudentId]);

  const generateStudentResult = async () => {
    if (!selectedExamId || !selectedStudentId) {
      showToast("Please select exam and student", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/exams/result/student", {
        params: { examId: selectedExamId, studentId: selectedStudentId },
      });
      setStudentResult(res.data);
      setClassResult(null);
    } catch (error) {
      setStudentResult(null);
      showToast(error.response?.data?.message || "Failed to generate student result", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateClassResult = async () => {
    if (!selectedExamId || !selectedClass) {
      showToast("Please select exam and class", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/exams/result/class", {
        params: { examId: selectedExamId, className: selectedClass },
      });
      setClassResult(res.data);
      setStudentResult(null);
    } catch (error) {
      setClassResult(null);
      showToast(error.response?.data?.message || "Failed to generate class result", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container exam-page result-card-page">
      <div className="card no-print">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Result Card</h2>
            <p className="page-subtitle">Generate student-wise report cards or class-wise exam summaries.</p>
          </div>
        </div>

        <div className="fees-tabs">
          <button className={`fees-tab ${tab === "student" ? "active" : ""}`} type="button" onClick={() => setTab("student")}>
            Student Wise
          </button>
          <button className={`fees-tab ${tab === "class" ? "active" : ""}`} type="button" onClick={() => setTab("class")}>
            Class Wise
          </button>
        </div>

        {tab === "student" ? (
          <div className="toolbar">
            <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>{exam.name}</option>
              ))}
            </select>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">Select Student</option>
              {filteredStudents.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName} ({student.rollNumber})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="toolbar single-filter">
            <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>{exam.name}</option>
              ))}
            </select>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="fees-generate-actions">
          <button
            className="btn primary"
            type="button"
            onClick={tab === "student" ? generateStudentResult : generateClassResult}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
          <button className="btn secondary" type="button" onClick={() => window.print()} disabled={!studentResult && !classResult}>
            Print Results
          </button>
        </div>
      </div>

      {studentResult ? (
        <div className="card result-print-sheet">
          <div className="result-sheet-head">
            <div>
              <h2>{studentResult.exam?.name}</h2>
              <p>Student Result Card</p>
            </div>
            <div className="result-summary-badges">
              <span className="badge paid">{studentResult.summary?.status}</span>
              <span className="badge late">{studentResult.summary?.percentage?.toFixed(2)}%</span>
            </div>
          </div>

          <div className="result-student-meta">
            <div><span>Name</span><strong>{studentResult.student?.fullName}</strong></div>
            <div><span>Roll Number</span><strong>{studentResult.student?.rollNumber}</strong></div>
            <div><span>Class</span><strong>{studentResult.student?.className} {studentResult.student?.section}</strong></div>
            <div><span>Exam</span><strong>{studentResult.exam?.name}</strong></div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total Marks</th>
                  <th>Obtained Marks</th>
                </tr>
              </thead>
              <tbody>
                {studentResult.marks?.map((item) => (
                  <tr key={item.subjectName}>
                    <td>{item.subjectName}</td>
                    <td>{item.totalMarks}</td>
                    <td>{item.obtainedMarks}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{studentResult.summary?.totalMarks}</td>
                  <td>{studentResult.summary?.obtainedMarks}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : null}

      {classResult ? (
        <div className="card result-print-sheet">
          <div className="result-sheet-head">
            <div>
              <h2>{classResult.exam?.name}</h2>
              <p>Class-wise Results - {classResult.className}</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Total Marks</th>
                  <th>Obtained Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {classResult.results?.map((row) => (
                  <tr key={row.studentId}>
                    <td>{row.rollNumber}</td>
                    <td>{row.fullName}</td>
                    <td>{row.totalMarks}</td>
                    <td>{row.obtainedMarks}</td>
                    <td>{row.percentage.toFixed(2)}%</td>
                    <td>
                      <span className={`badge ${row.status === "PASS" ? "paid" : "unpaid"}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {classResult.subjectAverages?.length ? (
            <div className="exam-chart-shell">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={classResult.subjectAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subjectName" />
                  <YAxis />
                  <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                  <Bar dataKey="averageMarks" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ExamResultCard;

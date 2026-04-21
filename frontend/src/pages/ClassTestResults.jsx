import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function ClassTestResults() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadClasses = async () => {
    try {
      const classRes = await api.get("/classes", { params: { page: 1, limit: 1000 } });
      const classData = classRes.data?.data || [];
      setClasses(classData);
      if (classData[0]) setSelectedClass(classData[0].name);
    } catch (error) {
      showToast("Failed to load classes", "error");
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      const selectedClassDoc = classes.find((item) => item.name === selectedClass);
      if (!selectedClassDoc || subjectsByClass[selectedClass]) return;

      try {
        const res = await api.get(`/subjects/class/${selectedClassDoc._id}`);
        setSubjectsByClass((prev) => ({ ...prev, [selectedClass]: res.data.subjects || [] }));
      } catch (error) {
        setSubjectsByClass((prev) => ({ ...prev, [selectedClass]: [] }));
      }
    };

    if (selectedClass) {
      loadSubjects();
    }
  }, [selectedClass, classes, subjectsByClass]);

  const subjectOptions = useMemo(() => subjectsByClass[selectedClass] || [], [subjectsByClass, selectedClass]);

  useEffect(() => {
    if (subjectOptions.length && !subjectOptions.some((subject) => subject.name === selectedSubject)) {
      setSelectedSubject(subjectOptions[0].name);
    }
  }, [subjectOptions, selectedSubject]);

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !testDate) {
      showToast("Please select class, subject and test date", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/class-tests/results", {
        params: { className: selectedClass, subjectName: selectedSubject, testDate },
      });
      setResult(res.data);
    } catch (error) {
      setResult(null);
      showToast(error.response?.data?.message || "Failed to load class test results", "error");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!result?.results?.length) return [];
    return result.results.map((item) => ({
      name: item.rollNumber,
      percentage: Number(item.percentage.toFixed(2)),
    }));
  }, [result]);

  return (
    <div className="page-container exam-page result-card-page">
      <div className="card no-print">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Test Result</h2>
            <p className="page-subtitle">Review class-wise class test performance and print the result list.</p>
          </div>
        </div>

        <div className="toolbar">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject.name} value={subject.name}>{subject.name}</option>
            ))}
          </select>
          <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        </div>

        <div className="fees-generate-actions">
          <button className="btn primary" type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Results"}
          </button>
          <button className="btn secondary" type="button" onClick={() => window.print()} disabled={!result}>
            Print Results
          </button>
        </div>
      </div>

      {result ? (
        <div className="card result-print-sheet">
          <div className="result-sheet-head">
            <div>
              <h2>{result.subjectName} Test Result</h2>
              <p>{result.className} - {new Date(result.testDate).toLocaleDateString()}</p>
            </div>
            <div className="result-summary-badges">
              <span className="badge partial">Average {Number(result.averagePercentage || 0).toFixed(2)}%</span>
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
                {result.results?.map((row) => (
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

          {chartData.length ? (
            <div className="exam-chart-shell">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ClassTestResults;

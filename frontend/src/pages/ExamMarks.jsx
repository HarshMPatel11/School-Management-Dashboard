import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function ExamMarks() {
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [sheet, setSheet] = useState({ subjects: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadInitial = async () => {
    try {
      const [examRes, classRes] = await Promise.all([
        api.get("/exams"),
        api.get("/classes", { params: { page: 1, limit: 1000 } }),
      ]);

      const examData = examRes.data || [];
      const classData = classRes.data?.data || [];
      setExams(examData);
      setClasses(classData);
      if (examData[0]) setSelectedExamId(examData[0]._id);
      if (classData[0]) setSelectedClass(classData[0].name);
    } catch (error) {
      showToast("Failed to load exam setup", "error");
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const loadSheet = async () => {
    if (!selectedExamId || !selectedClass) {
      showToast("Please select exam and class", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/exams/marks-sheet", {
        params: { examId: selectedExamId, className: selectedClass },
      });
      setSheet({
        subjects: res.data.subjects || [],
        rows: res.data.rows || [],
      });
    } catch (error) {
      setSheet({ subjects: [], rows: [] });
      showToast(error.response?.data?.message || "Failed to load marks sheet", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId && selectedClass) {
      loadSheet();
    }
  }, [selectedExamId, selectedClass]);

  const updateMarks = (studentId, subjectName, value) => {
    setSheet((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (
        row.studentId === studentId
          ? {
              ...row,
              marks: row.marks.map((mark) => (
                mark.subjectName === subjectName ? { ...mark, obtainedMarks: value } : mark
              )),
            }
          : row
      )),
    }));
  };

  const canSave = useMemo(() => sheet.rows.length > 0 && sheet.subjects.length > 0, [sheet]);

  const handleSave = async () => {
    if (!canSave) {
      showToast("No marks sheet loaded", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.post("/exams/marks", {
        examId: selectedExamId,
        className: selectedClass,
        entries: sheet.rows.map((row) => ({
          studentId: row.studentId,
          marks: row.marks.map((mark) => ({
            subjectName: mark.subjectName,
            obtainedMarks: Number(mark.obtainedMarks || 0),
          })),
        })),
      });
      showToast("Exam marks saved successfully", "success");
      loadSheet();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save exam marks", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container exam-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add / Update Exam Marks</h1>
          <p className="page-subtitle">Select an exam and class, then enter obtained marks for each subject.</p>
        </div>
      </div>

      <div className="card">
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

          <button className="btn secondary" type="button" onClick={loadSheet} disabled={loading}>
            {loading ? "Loading..." : "Reload Sheet"}
          </button>
        </div>

        {sheet.rows.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    {sheet.subjects.map((subject) => (
                      <th key={subject.name}>
                        {subject.name}
                        <div className="muted-caption">{subject.marks}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.map((row) => (
                    <tr key={row.studentId}>
                      <td>{row.rollNumber}</td>
                      <td>{row.fullName}</td>
                      {row.marks.map((mark) => (
                        <td key={`${row.studentId}-${mark.subjectName}`}>
                          <input
                            className="mark-input"
                            type="number"
                            min="0"
                            max={mark.totalMarks}
                            value={mark.obtainedMarks}
                            onChange={(e) => updateMarks(row.studentId, mark.subjectName, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="fees-generate-actions" style={{ justifyContent: "center" }}>
              <button className="btn primary" type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </>
        ) : (
          <div className="empty-panel">
            {loading ? "Loading marks sheet..." : "Select an exam and class to load marks."}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamMarks;

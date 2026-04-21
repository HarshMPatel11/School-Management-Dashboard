import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function ClassTestMarks() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalMarks, setTotalMarks] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadClasses = async () => {
    try {
      const classRes = await api.get("/classes", { params: { page: 1, limit: 1000 } });
      const classData = classRes.data?.data || [];
      setClasses(classData);
      if (classData[0]) {
        setSelectedClass(classData[0].name);
      }
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
      if (!selectedClassDoc) return;
      if (subjectsByClass[selectedClass]) return;

      try {
        const res = await api.get(`/subjects/class/${selectedClassDoc._id}`);
        setSubjectsByClass((prev) => ({
          ...prev,
          [selectedClass]: res.data.subjects || [],
        }));
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

  const loadSheet = async () => {
    if (!selectedClass || !selectedSubject || !testDate) {
      showToast("Please select class, subject and date", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/class-tests/marks-sheet", {
        params: {
          className: selectedClass,
          subjectName: selectedSubject,
          testDate,
        },
      });
      setRows(res.data.rows || []);
      setTotalMarks(res.data.totalMarks || "");
    } catch (error) {
      setRows([]);
      setTotalMarks("");
      showToast(error.response?.data?.message || "Failed to load class test sheet", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateObtainedMarks = (studentId, value) => {
    setRows((prev) => prev.map((row) => (
      row.studentId === studentId ? { ...row, obtainedMarks: value } : row
    )));
  };

  const handleSave = async () => {
    if (!rows.length) {
      showToast("Load a class test sheet first", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.post("/class-tests/marks", {
        className: selectedClass,
        subjectName: selectedSubject,
        testDate,
        totalMarks: Number(totalMarks),
        entries: rows.map((row) => ({
          studentId: row.studentId,
          obtainedMarks: Number(row.obtainedMarks || 0),
        })),
      });
      showToast("Class test marks saved successfully", "success");
      loadSheet();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save class test marks", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container exam-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Test Marks</h1>
          <p className="page-subtitle">Create and update class test marks for a single subject and test date.</p>
        </div>
      </div>

      <div className="card">
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

        <div className="toolbar">
          <input
            type="number"
            min="1"
            placeholder="Total Test Marks"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
          />
          <button className="btn secondary" type="button" onClick={loadSheet} disabled={loading}>
            {loading ? "Loading..." : "Load Students"}
          </button>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Obtained Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.studentId}>
                      <td>{row.rollNumber}</td>
                      <td>{row.fullName}</td>
                      <td>
                        <input
                          className="mark-input"
                          type="number"
                          min="0"
                          max={Number(totalMarks) || undefined}
                          value={row.obtainedMarks}
                          onChange={(e) => updateObtainedMarks(row.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="fees-generate-actions" style={{ justifyContent: "center" }}>
              <button className="btn primary" type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Test Marks"}
              </button>
            </div>
          </>
        ) : (
          <div className="empty-panel">
            {loading ? "Loading test sheet..." : "Select a class, subject and date to manage test marks."}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassTestMarks;

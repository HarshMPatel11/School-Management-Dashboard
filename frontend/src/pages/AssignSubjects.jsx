import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const emptySubjectRow = { name: "", marks: "" };

function AssignSubjects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classIdFromUrl = searchParams.get("classId") || "";

  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [classRef, setClassRef] = useState(classIdFromUrl);
  const [subjects, setSubjects] = useState([{ ...emptySubjectRow }]);
  const [loading, setLoading] = useState(false);

  const loadClasses = async () => {
    try {
      const res = await api.get("/classes", { params: { page: 1, limit: 1000 } });
      setClasses(res.data.data || []);
    } catch (error) {
      showToast("Failed to load classes", "error");
    }
  };

  const loadExisting = async (selectedClassId) => {
    if (!selectedClassId) {
      setSubjects([{ ...emptySubjectRow }]);
      return;
    }

    try {
      const res = await api.get(`/subjects/class/${selectedClassId}`);
      if (res.data.subjects?.length) {
        setSubjects(
          res.data.subjects.map((s) => ({ name: s.name || "", marks: String(s.marks || "") }))
        );
      } else {
        setSubjects([{ ...emptySubjectRow }]);
      }
    } catch (error) {
      setSubjects([{ ...emptySubjectRow }]);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classIdFromUrl) {
      setClassRef(classIdFromUrl);
      loadExisting(classIdFromUrl);
    }
  }, [classIdFromUrl]);

  const handleClassChange = (event) => {
    const value = event.target.value;
    setClassRef(value);
    loadExisting(value);
  };

  const updateSubject = (index, key, value) => {
    setSubjects((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    setSubjects((prev) => [...prev, { ...emptySubjectRow }]);
  };

  const removeRow = () => {
    setSubjects((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      classRef,
      subjects: subjects
        .map((s) => ({
          name: s.name.trim(),
          marks: Number(s.marks),
        }))
        .filter((s) => s.name && Number.isFinite(s.marks) && s.marks > 0),
    };

    if (!payload.classRef) {
      showToast("Please select a class", "warning");
      return;
    }

    if (payload.subjects.length === 0) {
      showToast("Please add at least one valid subject", "warning");
      return;
    }

    try {
      setLoading(true);
      await api.post("/subjects/assign", payload);
      showToast("Subjects assigned successfully", "success");
      navigate("/subjects/classes-with-subjects");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to assign subjects", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assign Subjects</h1>
          <p className="page-subtitle">Create or update subject list and marks for any class</p>
        </div>
        <button className="btn secondary" onClick={() => navigate("/subjects/classes-with-subjects")}>
          ← Back to Classes With Subjects
        </button>
      </div>

      <div className="subject-form-shell card">
        <form onSubmit={handleSubmit} className="subject-form">
          <h2>Create Subjects</h2>

          <div className="form-field">
            <label>Select Class <span className="required">*</span></label>
            <select value={classRef} onChange={handleClassChange} required>
              <option value="">Select</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {subjects.map((subject, index) => (
            <div className="subject-input-row" key={`subject-row-${index}`}>
              <div className="form-field">
                <label>Subject Name <span className="required">*</span></label>
                <input
                  placeholder="Name Of Subject"
                  value={subject.name}
                  onChange={(e) => updateSubject(index, "name", e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Marks <span className="required">*</span></label>
                <input
                  type="number"
                  min="1"
                  placeholder="Total Exam Marks"
                  value={subject.marks}
                  onChange={(e) => updateSubject(index, "marks", e.target.value)}
                  required
                />
              </div>
            </div>
          ))}

          <div className="subject-row-actions">
            <button type="button" className="btn secondary" onClick={addRow}>+ Add More</button>
            <button type="button" className="btn dark" onClick={removeRow}>− Remove</button>
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Assigning..." : "+ Assign Subjects"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AssignSubjects;

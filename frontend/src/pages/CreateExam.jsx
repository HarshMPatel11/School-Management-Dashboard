import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const initialForm = {
  name: "",
  startDate: "",
  endDate: "",
  published: true,
};

function CreateExam() {
  const { showToast, showConfirm } = useToast();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [exams, setExams] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadExams = async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data || []);
    } catch (error) {
      showToast("Failed to load exams", "error");
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.startDate || !form.endDate) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/exams/${editingId}`, form);
        showToast("Exam updated successfully", "success");
      } else {
        await api.post("/exams", form);
        showToast("Exam created successfully", "success");
      }

      resetForm();
      loadExams();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save exam", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setForm({
      name: exam.name || "",
      startDate: String(exam.startDate || "").slice(0, 10),
      endDate: String(exam.endDate || "").slice(0, 10),
      published: Boolean(exam.published),
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("This will delete the exam and all related marks.");
    if (!confirmed) return;

    try {
      await api.delete(`/exams/${id}`);
      showToast("Exam deleted", "success");
      if (editingId === id) {
        resetForm();
      }
      loadExams();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete exam", "error");
    }
  };

  const togglePublish = async (exam) => {
    try {
      await api.put(`/exams/${exam._id}`, { published: !exam.published });
      loadExams();
    } catch (error) {
      showToast("Failed to update publish status", "error");
    }
  };

  return (
    <div className="page-container exam-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Exam</h1>
          <p className="page-subtitle">Create, publish and manage exam sessions for result processing.</p>
        </div>
      </div>

      <div className="page-grid exam-admin-grid">
        <div className="card">
          <form className="exam-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Update Exam" : "Add New Exam"}</h2>

            <div className="form-field">
              <label>Examination Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name Of The Exam"
                required
              />
            </div>

            <div className="grid two-col">
              <div className="form-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="form-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
              />
              Publish exam
            </label>

            <div className="fees-generate-actions">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Exam" : "Save Exam"}
              </button>
              {editingId ? (
                <button className="btn secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Publish</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">No exams created yet</td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam._id}>
                      <td>{exam.name}</td>
                      <td>{new Date(exam.startDate).toLocaleDateString()}</td>
                      <td>{new Date(exam.endDate).toLocaleDateString()}</td>
                      <td>
                        <label className="switch-inline">
                          <input
                            type="checkbox"
                            checked={Boolean(exam.published)}
                            onChange={() => togglePublish(exam)}
                          />
                          <span>{exam.published ? "Published" : "Hidden"}</span>
                        </label>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn warning" type="button" onClick={() => handleEdit(exam)}>
                            Edit
                          </button>
                          <button className="btn danger" type="button" onClick={() => handleDelete(exam._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateExam;

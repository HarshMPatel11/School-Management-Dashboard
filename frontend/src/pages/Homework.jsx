import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const initialForm = {
  homeworkDate: new Date().toISOString().slice(0, 10),
  className: "",
  teacherName: "",
  subjectName: "",
  assignment: "",
};

function Homework() {
  const { showToast, showConfirm } = useToast();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    homeworkDate: new Date().toISOString().slice(0, 10),
    className: "",
    teacherName: "",
  });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadInitial = async () => {
    try {
      const [classRes, teacherRes] = await Promise.all([
        api.get("/classes", { params: { page: 1, limit: 1000 } }),
        api.get("/employees", { params: { role: "Teacher", all: true, limit: 5000 } }),
      ]);

      const classData = classRes.data?.data || [];
      const teacherData = teacherRes.data?.data || [];
      setClasses(classData);
      setTeachers(teacherData);
    } catch (error) {
      showToast("Failed to load homework form data", "error");
    }
  };

  const loadHomework = async () => {
    setLoading(true);
    try {
      const params = {
        homeworkDate: filters.homeworkDate || undefined,
        className: filters.className || undefined,
        teacherName: filters.teacherName || undefined,
      };
      const res = await api.get("/homework", { params });
      setItems(res.data || []);
    } catch (error) {
      showToast("Failed to load homework", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    loadHomework();
  }, [filters]);

  const ensureSubjectsForClass = async (className) => {
    if (!className || subjectsByClass[className]) {
      return;
    }

    const selectedClassDoc = classes.find((item) => item.name === className);
    if (!selectedClassDoc) return;

    try {
      const res = await api.get(`/subjects/class/${selectedClassDoc._id}`);
      setSubjectsByClass((prev) => ({
        ...prev,
        [className]: res.data.subjects || [],
      }));
    } catch (error) {
      setSubjectsByClass((prev) => ({ ...prev, [className]: [] }));
      showToast("No subjects found for selected class", "warning");
    }
  };

  useEffect(() => {
    if (form.className) {
      ensureSubjectsForClass(form.className);
    }
  }, [form.className, classes]);

  const subjectOptions = useMemo(() => subjectsByClass[form.className] || [], [subjectsByClass, form.className]);

  useEffect(() => {
    if (form.className && subjectOptions.length && !subjectOptions.some((item) => item.name === form.subjectName)) {
      setForm((prev) => ({ ...prev, subjectName: subjectOptions[0].name }));
    }
  }, [subjectOptions, form.className, form.subjectName]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
    setFormOpen(false);
  };

  const openCreate = () => {
    setEditingId("");
    setForm({
      ...initialForm,
      className: classes[0]?.name || "",
      teacherName: teachers[0]?.employeeName || "",
      subjectName: "",
    });
    setFormOpen(true);
  };

  const openEdit = async (item) => {
    await ensureSubjectsForClass(item.className);
    setEditingId(item._id);
    setForm({
      homeworkDate: String(item.homeworkDate || "").slice(0, 10),
      className: item.className || "",
      teacherName: item.teacherName || "",
      subjectName: item.subjectName || "",
      assignment: item.assignment || "",
    });
    setFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.homeworkDate || !form.className || !form.teacherName || !form.subjectName || !form.assignment.trim()) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/homework/${editingId}`, form);
        showToast("Homework updated successfully", "success");
      } else {
        await api.post("/homework", form);
        showToast("Homework created successfully", "success");
      }

      resetForm();
      loadHomework();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save homework", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("This will permanently delete this homework.");
    if (!confirmed) return;

    try {
      await api.delete(`/homework/${id}`);
      showToast("Homework deleted", "success");
      loadHomework();
    } catch (error) {
      showToast("Failed to delete homework", "error");
    }
  };

  return (
    <div className="page-container homework-page">
      <div className="card">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Homework</h1>
            <p className="page-subtitle">Create homework and filter it by date, class or teacher.</p>
          </div>
          <button className="btn primary" type="button" onClick={openCreate}>
            + Add Homework
          </button>
        </div>
      </div>

      <div className="card">
        <div className="toolbar homework-toolbar">
          <input
            type="date"
            value={filters.homeworkDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, homeworkDate: e.target.value }))}
          />
          <select
            value={filters.className}
            onChange={(e) => setFilters((prev) => ({ ...prev, className: e.target.value }))}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
          <select
            value={filters.teacherName}
            onChange={(e) => setFilters((prev) => ({ ...prev, teacherName: e.target.value }))}
          >
            <option value="">All Teachers</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher.employeeName}>{teacher.employeeName}</option>
            ))}
          </select>
          <button className="btn secondary" type="button" onClick={loadHomework} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {formOpen ? (
        <div className="card">
          <form className="homework-form" onSubmit={handleSave}>
            <div className="page-header" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="page-title">{editingId ? "Update Homework" : "Create Homework"}</h2>
                <p className="page-subtitle">Choose the class, teacher and subject, then write the assignment.</p>
              </div>
            </div>

            <div className="grid two-col">
              <div className="form-field">
                <label>Homework Date</label>
                <input
                  type="date"
                  value={form.homeworkDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, homeworkDate: e.target.value }))}
                  required
                />
              </div>

              <div className="form-field">
                <label>Class</label>
                <select
                  value={form.className}
                  onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value, subjectName: "" }))}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Teacher</label>
                <select
                  value={form.teacherName}
                  onChange={(e) => setForm((prev) => ({ ...prev, teacherName: e.target.value }))}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher.employeeName}>{teacher.employeeName}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Subject</label>
                <select
                  value={form.subjectName}
                  onChange={(e) => setForm((prev) => ({ ...prev, subjectName: e.target.value }))}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.name} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Assignment</label>
              <textarea
                rows="4"
                value={form.assignment}
                onChange={(e) => setForm((prev) => ({ ...prev, assignment: e.target.value }))}
                placeholder="Write the homework assignment..."
                required
              />
            </div>

            <div className="fees-generate-actions">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Homework" : "Save Homework"}
              </button>
              <button className="btn secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="homework-list">
        {items.length === 0 ? (
          <div className="card empty-panel">{loading ? "Loading homework..." : "No data found!"}</div>
        ) : (
          items.map((item) => {
            const date = new Date(item.homeworkDate);
            return (
              <article key={item._id} className="card homework-card">
                <div className="homework-card-grid">
                  <div className="homework-meta-panel homework-meta-panel--teacher">
                    <span className="homework-meta-label">Teacher</span>
                    <strong>{item.teacherName}</strong>
                  </div>
                  <div className="homework-meta-panel homework-meta-panel--class">
                    <span className="homework-meta-label">Class</span>
                    <strong>{item.className}</strong>
                  </div>
                  <div className="homework-meta-panel homework-meta-panel--date">
                    <span className="homework-meta-label">{date.toLocaleDateString(undefined, { weekday: "long" })}</span>
                    <strong>{date.getDate()}</strong>
                    <small>{date.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</small>
                  </div>
                  <div className="homework-meta-panel homework-meta-panel--subject">
                    <span className="homework-meta-label">Subject</span>
                    <strong>{item.subjectName}</strong>
                  </div>

                  <div className="homework-body">
                    <div className="homework-body-head">
                      <div>
                        <p className="homework-tag">Assignment</p>
                        <h3>{item.assignment}</h3>
                      </div>
                      <div className="action-buttons">
                        <button className="btn warning" type="button" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button className="btn danger" type="button" onClick={() => handleDelete(item._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Homework;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const initialState = {
  name: "",
  sections: "A",
  capacity: 40,
  classTeacher: "",
  description: "",
};

function NewClass() {
  const { id } = useParams(); // present when editing
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      api.get(`/classes/${id}`)
        .then((res) => {
          setForm({
            name: res.data.name || "",
            sections: res.data.sections ? res.data.sections.join(", ") : "A",
            capacity: res.data.capacity || 40,
            classTeacher: res.data.classTeacher || "",
            description: res.data.description || "",
          });
        })
        .catch(() => showToast("Failed to load class data", "error"));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Parse sections: comma-separated string → trimmed array
    const sectionsArray = form.sections
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      sections: sectionsArray,
      capacity: Number(form.capacity),
      classTeacher: form.classTeacher.trim(),
      description: form.description.trim(),
    };

    try {
      if (isEditing) {
        await api.put(`/classes/${id}`, payload);
        showToast("Class updated successfully", "success");
      } else {
        await api.post("/classes", payload);
        showToast("Class created successfully", "success");
      }
      navigate("/classes");
    } catch (error) {
      showToast(error.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEditing ? "Edit Class" : "New Class"}</h1>
          <p className="page-subtitle">
            {isEditing ? "Update the class details below" : "Fill in the details to create a new class"}
          </p>
        </div>
        <button className="btn secondary" onClick={() => navigate("/classes")}>
          ← Back to All Classes
        </button>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-header-row">
            <h3>{isEditing ? "Edit Class" : "Add New Class"}</h3>
          </div>

          <div className="grid two-col">
            <div className="form-field">
              <label>Class Name <span className="required">*</span></label>
              <input
                name="name"
                placeholder="e.g. Class 1, Grade 10"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Sections <span className="required">*</span></label>
              <input
                name="sections"
                placeholder="e.g. A, B, C"
                value={form.sections}
                onChange={handleChange}
                required
              />
              <small className="field-hint">Separate multiple sections with commas</small>
            </div>

            <div className="form-field">
              <label>Capacity per Section</label>
              <input
                name="capacity"
                type="number"
                min="1"
                placeholder="e.g. 40"
                value={form.capacity}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Class Teacher</label>
              <input
                name="classTeacher"
                placeholder="Teacher name"
                value={form.classTeacher}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Optional notes about this class..."
              value={form.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Class" : "Create Class"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate("/classes")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewClass;

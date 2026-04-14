import React, { useEffect, useState } from "react";

const initialState = {
  fullName: "",
  rollNumber: "",
  className: "",
  section: "",
  gender: "Male",
  parentName: "",
  contactNumber: "",
  address: "",
  email: "",
};

function StudentForm({ onSubmit, editingStudent, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (editingStudent) {
      setForm({
        fullName: editingStudent.fullName || "",
        rollNumber: editingStudent.rollNumber || "",
        className: editingStudent.className || "",
        section: editingStudent.section || "",
        gender: editingStudent.gender || "Male",
        parentName: editingStudent.parentName || "",
        contactNumber: editingStudent.contactNumber || "",
        address: editingStudent.address || "",
        email: editingStudent.email || "",
      });
    } else {
      setForm(initialState);
    }
    setPhotoFile(null);
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, photoFile);
    if (!editingStudent) {
      setForm(initialState);
      setPhotoFile(null);
    }
  };

  return (
    <form className="card student-form" onSubmit={handleSubmit}>
      <div className="form-header-row">
        <h3>{editingStudent ? "Edit Student" : "Add Student"}</h3>
        {editingStudent && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <div className="student-fields-grid">
        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
        <input name="rollNumber" placeholder="Roll Number" value={form.rollNumber} onChange={handleChange} required />
        <input name="className" placeholder="Class" value={form.className} onChange={handleChange} required />
        <input name="section" placeholder="Section" value={form.section} onChange={handleChange} required />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input name="parentName" placeholder="Parent Name" value={form.parentName} onChange={handleChange} />
        <input name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />

        <div className="student-field student-field--full">
          <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} rows="3" />
        </div>

        <div className="student-field student-field--full student-photo-field">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
          <small className="field-hint">Photo (optional) - max 100KB</small>
          {photoFile ? <small className="field-hint">Selected: {photoFile.name}</small> : null}
          {editingStudent?.photoUrl && !photoFile ? (
            <small className="field-hint">Current photo already uploaded</small>
          ) : null}
        </div>
      </div>

      <div className="student-form-actions">
        <button className="btn primary" type="submit">
          {editingStudent ? "Update Student" : "Add Student"}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;

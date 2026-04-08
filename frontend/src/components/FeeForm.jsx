import React, { useEffect, useState } from "react";

const initialState = {
  student: "",
  month: "",
  totalFee: "",
  paidFee: "",
};

function FeeForm({ students, onSubmit, editingFee, onCancel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (editingFee) {
      setForm({
        student: editingFee.student?._id || editingFee.student || "",
        month: editingFee.month || "",
        totalFee: editingFee.totalFee || "",
        paidFee: editingFee.paidFee || "",
      });
    } else {
      setForm(initialState);
    }
  }, [editingFee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    if (!editingFee) setForm(initialState);
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="form-header-row">
        <h3>{editingFee ? "Edit Fee" : "Add Fee"}</h3>
        {editingFee && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <div className="grid two-col">
        <select name="student" value={form.student} onChange={handleChange} required>
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.fullName} ({student.rollNumber})
            </option>
          ))}
        </select>

        <input name="month" placeholder="Month (Example: April 2026)" value={form.month} onChange={handleChange} required />
        <input name="totalFee" type="number" placeholder="Total Fee" value={form.totalFee} onChange={handleChange} required />
        <input name="paidFee" type="number" placeholder="Paid Fee" value={form.paidFee} onChange={handleChange} required />
      </div>

      <button className="btn primary" type="submit">
        {editingFee ? "Update Fee" : "Add Fee Record"}
      </button>
    </form>
  );
}

export default FeeForm;

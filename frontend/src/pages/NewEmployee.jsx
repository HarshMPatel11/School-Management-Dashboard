import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const initialState = {
  employeeName: "",
  mobile: "",
  role: "",
  dateOfJoining: "",
  monthlySalary: "",
  photoUrl: "",
  fatherOrHusbandName: "",
  gender: "",
  experience: "",
  nationalId: "",
  religion: "",
  email: "",
  education: "",
  bloodGroup: "",
  dateOfBirth: "",
  homeAddress: "",
};

function FieldLabel({ text, required = false }) {
  return (
    <label className={required ? "required-label" : "optional-label"}>
      {text}
      {required ? <span className="required">*</span> : <span className="optional-note">(Optional)</span>}
    </label>
  );
}

function NewEmployee() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(initialState);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    api
      .get(`/employees/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          employeeName: data.employeeName || "",
          mobile: data.mobile || "",
          role: data.role || "",
          dateOfJoining: data.dateOfJoining ? String(data.dateOfJoining).slice(0, 10) : "",
          monthlySalary: data.monthlySalary ?? "",
          photoUrl: data.photoUrl || "",
          fatherOrHusbandName: data.fatherOrHusbandName || "",
          gender: data.gender || "",
          experience: data.experience || "",
          nationalId: data.nationalId || "",
          religion: data.religion || "",
          email: data.email || "",
          education: data.education || "",
          bloodGroup: data.bloodGroup || "",
          dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : "",
          homeAddress: data.homeAddress || "",
        });
      })
      .catch(() => showToast("Failed to load employee", "error"));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value ?? "");
    });
    if (photoFile) {
      payload.append("photo", photoFile);
    }

    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/employees/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Employee updated successfully", "success");
      } else {
        await api.post("/employees", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Employee created successfully", "success");
      }
      navigate("/employees");
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
          <h1 className="page-title">Employee Form</h1>
          <p className="page-subtitle">Fill required (blue) and optional (gray) fields</p>
        </div>
        <button className="btn secondary" onClick={() => navigate("/employees")}>← Back to All Employees</button>
      </div>

      <div className="employee-form-shell card">
        <div className="employee-form-title-wrap">
          <h2>Employee Form</h2>
          <div className="employee-legend">
            <span className="legend-required">Required*</span>
            <span className="legend-optional">Optional</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="employee-section-title">1 Basic Information</div>
          <div className="grid three-col">
            <div className="form-field">
              <FieldLabel text="Employee Name" required />
              <input name="employeeName" placeholder="Name of Employee" value={form.employeeName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <FieldLabel text="Mobile No for SMS/WhatsApp" required />
              <input name="mobile" placeholder="e.g +44xxxxxxxxxx" value={form.mobile} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <FieldLabel text="Employee Role" required />
              <select name="role" value={form.role} onChange={handleChange} required>
                <option value="">Select*</option>
                <option value="Teacher">Teacher</option>
                <option value="Principal">Principal</option>
                <option value="Accountant">Accountant</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div className="form-field">
              <FieldLabel text="Date of Joining" required />
              <input type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <FieldLabel text="Monthly Salary" required />
              <input type="number" min="0" name="monthlySalary" placeholder="Monthly Salary" value={form.monthlySalary} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <FieldLabel text="Picture" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              <small className="field-hint">Max size 100KB</small>
              {photoFile ? <small className="field-hint">Selected: {photoFile.name}</small> : null}
              {isEditing && form.photoUrl && !photoFile ? <small className="field-hint">Current photo is already uploaded</small> : null}
            </div>
          </div>

          <div className="employee-section-title">2 Other Information</div>
          <div className="grid three-col">
            <div className="form-field">
              <FieldLabel text="Father / Husband Name" />
              <input name="fatherOrHusbandName" placeholder="Father / Husband Name" value={form.fatherOrHusbandName} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="Gender" />
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <FieldLabel text="Experience" />
              <input name="experience" placeholder="Experience" value={form.experience} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="National ID" />
              <input name="nationalId" placeholder="National ID" value={form.nationalId} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="Religion" />
              <input name="religion" placeholder="Religion" value={form.religion} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="Email Address" />
              <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="Education" />
              <input name="education" placeholder="Education" value={form.education} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="Blood Group" />
              <input name="bloodGroup" placeholder="Blood Group" value={form.bloodGroup} onChange={handleChange} />
            </div>

            <div className="form-field">
              <FieldLabel text="Date of Birth" />
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <FieldLabel text="Home Address" />
            <input name="homeAddress" placeholder="Home Address" value={form.homeAddress} onChange={handleChange} />
          </div>

          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Employee" : "Create Employee"}
            </button>
            <button className="btn secondary" type="button" onClick={() => navigate("/employees")}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEmployee;

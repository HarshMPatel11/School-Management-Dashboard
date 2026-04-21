import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function StudentAccountSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ username: "", currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSavedPassword, setShowSavedPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/student-portal/me");
        const studentData = res.data.student;
        setStudent(studentData);
        setForm((prev) => ({ ...prev, username: studentData.loginUsername || user?.username || "" }));
      } catch (error) {
        showToast("Could not load account settings", "error");
      }
    };
    load();
  }, [showToast, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/student-portal/account", form);
      setStudent(res.data.student);
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      updateUser(res.data.user);
      showToast("Account updated successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not update account", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!student) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-grid">
        <div className="card">
          <form className="grid" onSubmit={handleSubmit}>
            <h2>Update Login Details</h2>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Username"
            />
            <div className="password-input-wrap">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Current password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="password-input-wrap">
              <input
                type={showNewPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="New password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Account Login Details</h2>
          <div className="account-details-box">
            <div className="detail-row">
              <label>Username</label>
              <input value={student.loginUsername || ""} disabled className="disabled-input" />
            </div>
            <div className="detail-row">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showSavedPassword ? "text" : "password"}
                  value={student.loginPassword || ""}
                  disabled
                  className="disabled-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowSavedPassword((prev) => !prev)}
                >
                  {showSavedPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentAccountSettings;

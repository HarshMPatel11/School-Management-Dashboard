import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    role: "employee",
    identifier: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        role: form.role,
        identifier: form.identifier,
        password: form.password,
      });

      showToast("Account created. Please login.", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <p>Create a new account</p>

        {error ? <div className="auth-error">{error}</div> : null}

        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="role-switcher" role="tablist" aria-label="Choose account role">
          <button
            type="button"
            className={`role-pill ${form.role === "admin" ? "active" : ""}`}
            onClick={() => setForm((prev) => ({ ...prev, role: "admin" }))}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-pill ${form.role === "employee" ? "active" : ""}`}
            onClick={() => setForm((prev) => ({ ...prev, role: "employee" }))}
          >
            Employee
          </button>
          <button
            type="button"
            className={`role-pill ${form.role === "student" ? "active" : ""}`}
            onClick={() => setForm((prev) => ({ ...prev, role: "student" }))}
          >
            Student
          </button>
        </div>

        <input
          name="identifier"
          type="text"
          placeholder={form.role === "admin" ? "Email" : form.role === "employee" ? "Mobile Number" : "Roll Number"}
          value={form.identifier}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
        />

        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-alt-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;

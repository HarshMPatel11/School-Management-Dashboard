import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultRouteForRole } from "../utils/roles";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ identifier: "", password: "", role: "admin" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login(form);
      navigate(from || getDefaultRouteForRole(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p>Select your role and sign in</p>

        <div className="role-switcher" role="tablist" aria-label="Choose login role">
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

        {error && <div className="auth-error">{error}</div>}

        <input
          name="identifier"
          type="text"
          placeholder={form.role === "admin" ? "Admin Email" : form.role === "employee" ? "Employee Mobile" : "Student Roll Number"}
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
        />

        <small className="field-hint">
          {form.role === "admin"
            ? "Admin uses email + password"
            : form.role === "employee"
              ? "Employee default: mobile as login ID and password"
              : "Student default: roll number as login ID and password"}
        </small>

        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>

        <p className="auth-alt-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

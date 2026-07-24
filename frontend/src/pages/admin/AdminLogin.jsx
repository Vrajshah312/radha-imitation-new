import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./Admin.css";

export default function AdminLogin() {
  const { login, logout, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [roleError, setRoleError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/admin";

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setRoleError("");
    setSubmitting(true);
    const user = await login(form);
    setSubmitting(false);
    if (!user) return;

    if (user.role !== "admin") {
      logout();
      setRoleError("This account doesn't have admin access.");
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <img src={logo} alt="Radha Imitation Jewellery" className="admin-login-logo" />
        <span className="eyebrow">Admin Dashboard</span>
        <h1>Sign in to manage your store</h1>

        {(authError || roleError) && (
          <div className="form-error">{roleError || authError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="admin@radhajewellery.com"
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? "Signing In…" : "Sign In"}
          </button>
        </form>

        <p className="admin-login-hint">
          Demo credentials: <strong>admin@radhajewellery.com</strong> /{" "}
          <strong>Admin@123</strong>
        </p>
      </div>
    </div>
  );
}

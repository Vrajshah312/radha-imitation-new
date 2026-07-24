import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { register, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/profile";

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (form.password !== form.confirm) {
      setLocalError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    const ok = await register(form);
    setSubmitting(false);
    if (ok) navigate(redirectTo, { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="gold-ring auth-ring" />
        <div className="auth-visual-copy">
          <span className="eyebrow">Join Us</span>
          <h2>Your jewellery box, reimagined</h2>
          <p>Create an account for faster checkout and order tracking.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow">Create Account</span>
          <h1>Sign Up</h1>

          {(localError || authError) && (
            <div className="form-error">{localError || authError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                required
                minLength={6}
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter your password"
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" onClick={() => setAuthError("")}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

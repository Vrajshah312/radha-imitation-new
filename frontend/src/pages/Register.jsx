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
    <div className="auth-page" data-testid="register-page">
      <div className="auth-visual">
        <div className="auth-corner-tag">
          <span>RJ / New Member</span>
          <em>— Volume One</em>
        </div>
        <div className="auth-visual-copy">
          <span className="eyebrow">Join the archive</span>
          <h2>Your jewellery box,<br /><em>reimagined.</em></h2>
          <p>
            Create an account for faster checkout, order tracking and
            occasional field notes from the studio.
          </p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow eyebrow-mute">Sign Up · 02 / 02</span>
          <h1>Create <em>account.</em></h1>

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
                data-testid="register-name"
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
                data-testid="register-email"
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
                data-testid="register-password"
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
                data-testid="register-confirm"
              />
            </div>
            <button className="btn btn-block" type="submit" disabled={submitting} data-testid="register-submit">
              <span>{submitting ? "Creating account…" : "Create Account →"}</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" onClick={() => setAuthError("")} data-testid="register-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/profile";

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(form);
    setSubmitting(false);
    if (ok) navigate(redirectTo, { replace: true });
  }

  return (
    <div className="auth-page" data-testid="login-page">
      <div className="auth-visual">
        <div className="auth-corner-tag">
          <span>RJ / Members Only</span>
          <em>— Volume One</em>
        </div>
        <div className="auth-visual-copy">
          <span className="eyebrow">Welcome back</span>
          <h2>
            The archive<br />remembers <em>you.</em>
          </h2>
          <p>
            Sign in to track orders, save favourites and check out faster —
            all your correspondence, one thread.
          </p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow eyebrow-mute">Sign In · 01 / 02</span>
          <h1>Your <em>Account.</em></h1>

          {authError && <div className="form-error">{authError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                data-testid="login-email"
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
                data-testid="login-password"
              />
            </div>
            <button className="btn btn-block" type="submit" disabled={submitting} data-testid="login-submit">
              <span>{submitting ? "Signing in…" : "Sign In →"}</span>
            </button>
          </form>

          <p className="auth-switch">
            New to the archive?{" "}
            <Link to="/register" onClick={() => setAuthError("")} data-testid="login-register-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

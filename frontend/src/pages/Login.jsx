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
    <div className="auth-page">
      <div className="auth-visual">
        <div className="gold-ring auth-ring" />
        <div className="auth-visual-copy">
          <span className="eyebrow">Welcome Back</span>
          <h2>Every piece tells a little story</h2>
          <p>Sign in to track orders, save favourites and check out faster.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow">Sign In</span>
          <h1>Your Account</h1>

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
                placeholder="••••••••"
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            New to Radha Imitation Jewellery?{" "}
            <Link to="/register" onClick={() => setAuthError("")}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

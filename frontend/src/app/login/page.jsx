"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "@/styles/Auth.css";

export default function LoginPage() {
  const { login, authError, setAuthError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/account";

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }
  async function handleSubmit(e) {
    e.preventDefault(); setSubmitting(true);
    const ok = await login(form); setSubmitting(false);
    if (ok) router.replace(redirectTo);
  }

  return (
    <div className="auth-page" data-testid="login-page">
      <div className="auth-visual">
        <div className="auth-visual-copy">
          <span className="eyebrow">Welcome back</span>
          <h2>Every piece tells a <em>little story.</em></h2>
          <p>Sign in to track orders, save favourites and check out faster.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow">Sign In</span>
          <h1>Your <em>account.</em></h1>
          {authError && <div className="form-error">{authError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field"><label>Email Address</label><input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" data-testid="login-email" /></div>
            <div className="form-field"><label>Password</label><input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="••••••••" data-testid="login-password" /></div>
            <button className="btn btn-block" type="submit" disabled={submitting} data-testid="login-submit">{submitting ? "Signing in…" : "Sign In"}</button>
          </form>
          <p className="auth-switch">New to Radha? <Link href="/register" onClick={() => setAuthError("")} data-testid="login-register-link">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}

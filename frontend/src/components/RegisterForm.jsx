"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "@/styles/Auth.css";

export default function RegisterForm() {
  const { register, authError, setAuthError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const redirectTo = searchParams.get("redirect") || "/account";

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }
  async function handleSubmit(e) {
    e.preventDefault(); setLocalError("");
    if (form.password !== form.confirm) { setLocalError("Passwords do not match"); return; }
    setSubmitting(true);
    const ok = await register({ name: form.name, email: form.email, password: form.password });
    setSubmitting(false);
    if (ok) router.replace(redirectTo);
  }

  return (
    <div className="auth-page" data-testid="register-page">
      <div className="auth-visual">
        <div className="auth-visual-copy">
          <span className="eyebrow">Join Radha</span>
          <h2>Your jewellery box, <em>reimagined.</em></h2>
          <p>Create an account for faster checkout, order tracking and early access to new drops.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow">Create Account</span>
          <h1>Sign <em>up.</em></h1>
          {(localError || authError) && <div className="form-error">{localError || authError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field"><label>Full Name</label><input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Your name" data-testid="register-name" /></div>
            <div className="form-field"><label>Email Address</label><input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" data-testid="register-email" /></div>
            <div className="form-field"><label>Password</label><input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="At least 6 characters" data-testid="register-password" /></div>
            <div className="form-field"><label>Confirm Password</label><input type="password" name="confirm" required minLength={6} value={form.confirm} onChange={handleChange} placeholder="Re-enter your password" data-testid="register-confirm" /></div>
            <button className="btn btn-block" type="submit" disabled={submitting} data-testid="register-submit">{submitting ? "Creating account…" : "Create Account"}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login" onClick={() => setAuthError("")} data-testid="register-login-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

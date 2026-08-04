"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    api.get("/auth/me").then((r) => setUser(r.data.user)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function login(form) {
    setAuthError("");
    try {
      const r = await api.post("/auth/login", form);
      setUser(r.data.user);
      return r.data.user;
    } catch (e) {
      setAuthError(e.response?.data?.message || "Could not sign you in");
      return false;
    }
  }

  async function register(form) {
    setAuthError("");
    try {
      const r = await api.post("/auth/register", form);
      setUser(r.data.user);
      return r.data.user;
    } catch (e) {
      setAuthError(e.response?.data?.message || "Could not create your account");
      return false;
    }
  }

  async function logout() {
    try { await api.post("/auth/logout"); } catch {}
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

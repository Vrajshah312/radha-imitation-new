import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("radha_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("radha_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function register({ name, email, password }) {
    setAuthError("");
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("radha_token", res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Could not create your account");
      return false;
    }
  }

  async function login({ email, password }) {
    setAuthError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("radha_token", res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Could not sign you in");
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("radha_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, authError, register, login, logout, setAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

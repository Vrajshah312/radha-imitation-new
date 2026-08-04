import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const ModeContext = createContext(null);
const STORAGE_KEY = "radha_data_mode";

// Controls whether the storefront reads from the built-in Demo data or from a
// live WordPress GraphQL (WooCommerce) store. The choice is persisted in
// localStorage and sent on every API request via the X-Data-Mode header.
export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || "demo");
  const [wordpressConfigured, setWordpressConfigured] = useState(true);

  useEffect(() => {
    api
      .get("/mode")
      .then((res) => setWordpressConfigured(res.data.wordpressConfigured))
      .catch(() => {});
  }, [mode]);

  function switchMode(next) {
    if (next === mode) return;
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
    // Reload so every page refetches from the newly-selected data source.
    window.location.reload();
  }

  function toggleMode() {
    switchMode(mode === "demo" ? "live" : "demo");
  }

  return (
    <ModeContext.Provider value={{ mode, isLive: mode === "live", wordpressConfigured, switchMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within a ModeProvider");
  return ctx;
}

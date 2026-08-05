"use client";
import { useEffect, useState } from "react";
import "@/styles/SplashScreen.css";

export default function SplashScreen() {
  // Start visible by default (null = undecided, true = show, false = hide)
  const [phase, setPhase] = useState("visible"); // "visible" | "hiding" | "gone"

  useEffect(() => {
    // If we've seen the splash this session, skip it instantly
    const hasSeenSplash = sessionStorage.getItem("splashShown");
    if (hasSeenSplash) {
      setPhase("gone");
      return;
    }

    sessionStorage.setItem("splashShown", "true");

    // Begin slide-up exit after 2.2s
    const hideTimer = setTimeout(() => setPhase("hiding"), 2200);
    // Remove from DOM after slide-up completes (another 900ms)
    const doneTimer = setTimeout(() => setPhase("gone"), 3100);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`splash-screen${phase === "hiding" ? " is-hiding" : ""}`} aria-hidden="true">
      {/* Decorative thin border lines */}
      <span className="splash-line splash-line-top" />
      <span className="splash-line splash-line-bottom" />

      <div className="splash-inner">
        {/* Logo */}
        <div className="splash-logo-wrap">
          <img
            src="/logo.png"
            alt="Radha Imitation Jewellery"
            className="splash-logo"
          />
        </div>

        {/* Brand name */}
        <h1 className="splash-brand">Radha</h1>
        <p className="splash-tagline">Imitation Jewellery</p>

        {/* Animated loading bar */}
        <div className="splash-bar-wrap">
          <div className="splash-bar" />
        </div>
      </div>
    </div>
  );
}

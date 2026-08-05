"use client";
import { useEffect, useState } from "react";
import "@/styles/SplashScreen.css";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    // Only show on first visit in the current session
    const hasSeenSplash = sessionStorage.getItem("splashShown");
    
    if (!hasSeenSplash) {
      setShow(true);
      sessionStorage.setItem("splashShown", "true");
      
      // Start hiding after 2.5 seconds
      const hideTimer = setTimeout(() => {
        setHiding(true);
      }, 2500);

      // Remove from DOM after transition completes (1s)
      const removeTimer = setTimeout(() => {
        setShow(false);
      }, 3500);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`splash-screen ${hiding ? "is-hidden" : ""}`}>
      <div className="splash-content">
        <h1 className="splash-title">Radha</h1>
        <p className="splash-subtitle">Imitation Jewellery</p>
      </div>
    </div>
  );
}

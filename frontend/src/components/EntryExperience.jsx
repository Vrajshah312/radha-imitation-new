import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import "./EntryExperience.css";

const SESSION_KEY = "radha_entered";
const SPLASH_DURATION = 2000;
const EXIT_DURATION = 750;

function useSparkles(count) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 3,
        delay: `${Math.random() * 4}s`,
        duration: `${3 + Math.random() * 3}s`,
      })),
    [count]
  );
}

export default function EntryExperience({ children }) {
  const [phase, setPhase] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) ? "done" : "splash"
  );
  const sparkles = useSparkles(20);

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("gate"), SPLASH_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  function handleEnter() {
    setPhase("exiting");
    setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setPhase("done");
    }, EXIT_DURATION);
  }

  return (
    <>
      {children}

      {phase !== "done" && (
        <div className={`entry-overlay ${phase === "exiting" ? "is-exiting" : ""}`}>
          <div className="entry-sparkles" aria-hidden="true">
            {sparkles.map((s) => (
              <span
                key={s.id}
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size,
                  height: s.size,
                  animationDelay: s.delay,
                  animationDuration: s.duration,
                }}
              />
            ))}
          </div>

          {phase === "splash" && (
            <div className="entry-splash">
              <div className="entry-splash-ring gold-ring" />
              <img src={logo} alt="Radha Imitation Jewellery" className="entry-splash-logo" />
              <div className="entry-splash-label">
                <span>Loading the Collection</span>
                <span className="entry-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          )}

          {(phase === "gate" || phase === "exiting") && (
            <div className="entry-gate">
              <div className="entry-gate-ring entry-gate-ring-1" />
              <div className="entry-gate-ring entry-gate-ring-2" />
              <img src={logo} alt="Radha Imitation Jewellery" className="entry-gate-logo" />
              <span className="eyebrow">Welcome To</span>
              <h1>Radha Imitation Jewellery</h1>
              <p>Kundan, temple &amp; meenakari pieces — handpicked for every celebration.</p>
              <button className="btn btn-primary entry-gate-btn" onClick={handleEnter}>
                Enter the Store
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

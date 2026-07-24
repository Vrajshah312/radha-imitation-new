import { useEffect, useState } from "react";
import "./EntryExperience.css";

const SESSION_KEY = "radha_entered";
const SPLASH_DURATION = 2100;
const EXIT_DURATION = 750;

export default function EntryExperience({ children }) {
  const [phase, setPhase] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) ? "done" : "splash"
  );

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("gate"), SPLASH_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
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
        <div className={`entry-overlay ${phase === "exiting" ? "is-exiting" : ""}`} data-testid="entry-overlay">
          <span className="entry-corner-tag entry-corner-tl">RJ / EST. 2019</span>
          <span className="entry-corner-tag entry-corner-tr">— an archive.</span>
          <span className="entry-corner-tag entry-corner-bl">Chapter 01 · Loading</span>
          <span className="entry-corner-tag entry-corner-br">₹ INR · India</span>

          {phase === "splash" && (
            <div className="entry-splash">
              <div className="entry-splash-marque" aria-label="Radha">
                {["R","A","D","H","A"].map((c, i) => (
                  <span
                    className="letter"
                    key={i}
                    style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                  >
                    {c}
                  </span>
                ))}
                <span className="letter" style={{ animationDelay: `${0.15 + 5 * 0.08}s` }}>
                  <em>.</em>
                </span>
              </div>
              <div className="entry-splash-label">Loading the archive</div>
              <div className="entry-progress" />
            </div>
          )}

          {(phase === "gate" || phase === "exiting") && (
            <div className="entry-gate">
              <span className="eyebrow">Welcome to Volume One</span>
              <h1>Objects of<br /><em>Devotion.</em></h1>
              <p>
                An editorial archive of imitation heirlooms — kundan, temple &amp;
                meenakari, engineered to be worn, not locked away.
              </p>
              <button className="btn entry-gate-btn" onClick={handleEnter} data-testid="entry-gate-btn">
                <span>Enter The Archive →</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

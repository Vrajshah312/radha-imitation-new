import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "./EntryExperience.css";

const SESSION_KEY = "radha_entered";
const TOTAL = 2000;
const FADE = 500;

export default function EntryExperience({ children }) {
  const [phase, setPhase] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) ? "done" : "loading"
  );

  useEffect(() => {
    if (phase !== "loading") return;
    const t1 = setTimeout(() => setPhase("exiting"), TOTAL);
    const t2 = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setPhase("done");
    }, TOTAL + FADE);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  return (
    <>
      {children}
      {phase !== "done" && (
        <div className={`entry-overlay ${phase === "exiting" ? "is-exiting" : ""}`} data-testid="entry-overlay">
          <div className="entry-splash">
            <img src={logo} alt="Radha Imitation Jewellery" className="entry-splash-logo" />
            <div className="entry-progress" />
          </div>
        </div>
      )}
    </>
  );
}

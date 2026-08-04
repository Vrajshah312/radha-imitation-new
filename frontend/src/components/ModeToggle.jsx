import { useMode } from "../context/ModeContext";
import "./ModeToggle.css";

export default function ModeToggle() {
  const { isLive, wordpressConfigured, switchMode } = useMode();
  const liveNotReady = isLive && !wordpressConfigured;

  return (
    <div
      className="mode-toggle"
      data-testid="mode-toggle"
      title={
        liveNotReady
          ? "Live mode is on, but no WordPress GraphQL endpoint is connected yet. Set WORDPRESS_GRAPHQL_URL to load real products."
          : "Switch between built-in Demo data and your live WordPress store"
      }
    >
      <span className="mode-toggle-label">Data</span>
      <div className="mode-toggle-track" role="group" aria-label="Data source">
        <button
          type="button"
          className={`mode-opt ${!isLive ? "is-active" : ""}`}
          onClick={() => switchMode("demo")}
          data-testid="mode-toggle-demo"
        >
          Demo
        </button>
        <button
          type="button"
          className={`mode-opt mode-opt-live ${isLive ? "is-active" : ""}`}
          onClick={() => switchMode("live")}
          data-testid="mode-toggle-live"
        >
          Live
          {liveNotReady && <span className="mode-warning-dot" data-testid="mode-live-warning" />}
        </button>
      </div>
    </div>
  );
}

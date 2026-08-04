import { useMode } from "../context/ModeContext";
import "./LiveModeBanner.css";

// Site-wide notice shown only while Live mode is active, so shoppers know
// they're on the real WordPress store (or that it isn't connected yet).
export default function LiveModeBanner() {
  const { isLive, wordpressConfigured, switchMode } = useMode();
  if (!isLive) return null;

  const notReady = !wordpressConfigured;

  return (
    <div
      className={`live-banner ${notReady ? "live-banner-warning" : "live-banner-on"}`}
      data-testid="live-mode-banner"
      role="status"
    >
      <span className="live-banner-dot" />
      {notReady ? (
        <span>
          <strong>Live mode is on</strong> — no WordPress store is connected yet, so no products will
          show. Connect your store (WORDPRESS_GRAPHQL_URL) or{" "}
          <button className="live-banner-link" onClick={() => switchMode("demo")} data-testid="live-banner-switch-demo">
            switch back to Demo
          </button>
        </span>
      ) : (
        <span>
          <strong>Live store</strong> — you're viewing real products and prices from the connected
          WordPress store.{" "}
          <button className="live-banner-link" onClick={() => switchMode("demo")} data-testid="live-banner-switch-demo">
            Switch to Demo
          </button>
        </span>
      )}
    </div>
  );
}

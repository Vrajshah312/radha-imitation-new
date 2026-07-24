import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="container"
      style={{ textAlign: "center", padding: "160px 32px", maxWidth: 520, margin: "0 auto" }}
      data-testid="not-found"
    >
      <span className="eyebrow eyebrow-mute">Error · 404</span>
      <h1
        style={{
          fontFamily: "var(--f-display)",
          fontSize: "clamp(3.4rem, 12vw, 8rem)",
          fontWeight: 400,
          letterSpacing: "-0.03em",
          lineHeight: 0.9,
          margin: "24px 0 16px",
        }}
      >
        Page not <em style={{ fontStyle: "italic", color: "var(--ink-mute)" }}>found.</em>
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
        The page you're looking for seems to have wandered off. Let's get you
        back to the archive.
      </p>
      <Link to="/" className="btn" data-testid="not-found-cta">
        <span>Back to Home →</span>
      </Link>
    </div>
  );
}

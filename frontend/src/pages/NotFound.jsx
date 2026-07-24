import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="container"
      style={{ textAlign: "center", padding: "120px 32px", maxWidth: 480, margin: "0 auto" }}
      data-testid="not-found"
    >
      <span className="eyebrow">Error · 404</span>
      <h1
        style={{
          fontFamily: "var(--f-display)",
          fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
          fontWeight: 400,
          letterSpacing: "-0.015em",
          lineHeight: 1.1,
          margin: "18px 0 14px",
        }}
      >
        Page not <em style={{ fontStyle: "italic", color: "var(--gold)" }}>found.</em>
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>
        The page you're looking for seems to have wandered off.
      </p>
      <Link to="/" className="btn" data-testid="not-found-cta">
        Back to Home
      </Link>
    </div>
  );
}

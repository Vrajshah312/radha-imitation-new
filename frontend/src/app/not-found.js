import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: "center", padding: "120px 32px", maxWidth: 480, margin: "0 auto" }} data-testid="not-found">
      <span className="eyebrow">Error · 404</span>
      <h1 style={{ fontFamily: "var(--f-display)", fontWeight: 400, margin: "18px 0 14px" }}>
        Page not <em style={{ fontStyle: "italic", color: "var(--gold)" }}>found.</em>
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>The page you're looking for seems to have wandered off.</p>
      <Link href="/" className="btn" data-testid="not-found-cta">Back to Home</Link>
    </div>
  );
}

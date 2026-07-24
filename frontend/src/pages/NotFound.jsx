import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="container"
      style={{ textAlign: "center", padding: "120px 32px", maxWidth: 480, margin: "0 auto" }}
    >
      <span className="eyebrow">404</span>
      <h1 style={{ margin: "12px 0 16px" }}>Page Not Found</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
        The page you're looking for seems to have wandered off. Let's get you
        back to the collection.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

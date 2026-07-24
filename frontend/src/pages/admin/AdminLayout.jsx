import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true, icon: "grid" },
  { to: "/admin/products", label: "Products", icon: "tag" },
  { to: "/admin/categories", label: "Categories", icon: "layers" },
  { to: "/admin/orders", label: "Orders", icon: "box" },
  { to: "/admin/inventory", label: "Inventory", icon: "package" },
  { to: "/admin/banners", label: "Home Banners", icon: "image" },
  { to: "/admin/users", label: "Users", icon: "users" },
];

const ICONS = {
  grid: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M9 2.5H4a1.5 1.5 0 00-1.5 1.5v5l8 8 6.5-6.5-8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="6.2" cy="6.2" r="1.1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5l7.5 4L10 10.5l-7.5-4L10 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2.5 10l7.5 4 7.5-4M2.5 13.5l7.5 4 7.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M2.5 6l7.5-4 7.5 4-7.5 4-7.5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2.5 6v8l7.5 4 7.5-4V6M10 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  package: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M8 3v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="7" cy="7.3" r="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M3 15l4.3-4.2 3.1 2.8 2.3-2.2 4.3 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="6.5" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.3 16c.9-2.8 2.6-4.2 4.7-4.2s3.8 1.4 4.7 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 11.6c1.7.2 2.9 1.4 3.6 3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand" data-testid="admin-brand-link">
          <span className="admin-brand-mark">Radha<em>.</em></span>
          <span className="admin-brand-sub">Admin</span>
        </Link>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? "is-active" : ""}`}
            >
              <span className="admin-nav-icon">{ICONS[item.icon]}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-view-site" data-testid="admin-view-site">
            ← View Storefront
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">Dashboard</span>
          </div>
          <div className="admin-topbar-user">
            <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="admin-topbar-info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="btn btn-outline btn-small" onClick={logout} data-testid="admin-signout-btn">
              Sign Out
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

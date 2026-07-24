import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./Navbar.css";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const closeTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  function openMenu() {
    clearTimeout(closeTimer.current);
    setMenuOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 180);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
    setSearchTerm("");
  }

  return (
    <header className={`nav-header ${scrolled ? "is-scrolled" : ""}`} data-testid="site-header">
      <div className="nav-topline" data-testid="nav-topline">
        Complimentary shipping across India · <em>over ₹999</em>
      </div>

      <div className="container nav-inner">
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} data-testid="nav-home-link">
            Index
          </NavLink>

          <div
            className="nav-item-shop"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <button
              className="nav-link nav-shop-trigger"
              onClick={() => navigate("/shop")}
              data-testid="nav-shop-trigger"
            >
              Archive
              <svg width="10" height="6" viewBox="0 0 10 6" className="chev">
                <path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.4" />
              </svg>
            </button>

            <div className={`mega-menu ${menuOpen ? "is-open" : ""}`} data-testid="mega-menu">
              <div className="mega-menu-inner">
                {categories.map((cat) => (
                  <div className="mega-col" key={cat.id}>
                    <Link to={`/shop/${cat.id}`} className="mega-col-title" data-testid={`mega-col-${cat.id}`}>
                      {cat.name}
                    </Link>
                    <p className="mega-col-tagline">{cat.tagline}</p>
                    <ul>
                      {cat.subcategories.map((sub) => (
                        <li key={sub.id}>
                          <Link to={`/shop/${cat.id}/${sub.id}`}>{sub.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mega-col mega-col-feature">
                  <span className="eyebrow">Chapter 03 — New</span>
                  <h4>The Festive Edit</h4>
                  <p>Fresh kundan, kemp &amp; meenakari — for the season ahead.</p>
                  <Link to="/shop?isNew=true" className="btn btn-small" data-testid="mega-cta">
                    <span>Explore →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <NavLink to="/shop?bestseller=true" className="nav-link" data-testid="nav-bestsellers-link">
            Bestsellers
          </NavLink>
        </nav>

        <Link to="/" className="nav-brand" data-testid="nav-brand-link">
          <span className="nav-brand-mark">Radha<em>.</em></span>
        </Link>

        <button
          className="nav-burger"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
          data-testid="nav-burger"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="nav-actions">
          <button
            className="nav-icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen((s) => !s)}
            data-testid="nav-search-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {user ? (
            <div className="nav-user">
              <Link to="/profile" className="nav-icon-btn" aria-label="My account" data-testid="nav-profile-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4.5 20c1.6-3.6 5-5.4 7.5-5.4s5.9 1.8 7.5 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </Link>
              <button className="nav-text-btn" onClick={logout} data-testid="nav-signout-btn">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-icon-btn" aria-label="Sign in" data-testid="nav-login-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4.5 20c1.6-3.6 5-5.4 7.5-5.4s5.9 1.8 7.5 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
          )}

          <Link to="/cart" className="nav-icon-btn nav-cart" aria-label="Cart" data-testid="nav-cart-link">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 8h12l-1 11.5a1.5 1.5 0 01-1.5 1.5h-7a1.5 1.5 0 01-1.5-1.5L6 8z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {totalItems > 0 && <span className="cart-count" data-testid="cart-count">{totalItems}</span>}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="nav-search-bar" data-testid="nav-search-bar">
          <form className="container" onSubmit={handleSearchSubmit}>
            <input
              autoFocus
              type="text"
              placeholder="What are you looking for…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="nav-search-input"
            />
            <button type="submit" className="btn btn-small" data-testid="nav-search-submit">
              <span>Search →</span>
            </button>
          </form>
        </div>
      )}

      <div className={`nav-mobile ${mobileOpen ? "is-open" : ""}`}>
        <NavLink to="/" end onClick={() => setMobileOpen(false)}>Index</NavLink>
        {categories.map((cat) => (
          <details key={cat.id}>
            <summary>{cat.name}</summary>
            <div className="nav-mobile-sub">
              {cat.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/shop/${cat.id}/${sub.id}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </details>
        ))}
        <NavLink to="/shop?bestseller=true" onClick={() => setMobileOpen(false)}>
          Bestsellers
        </NavLink>
        {user ? (
          <>
            <NavLink to="/profile" onClick={() => setMobileOpen(false)}>My Account</NavLink>
            <button onClick={logout}>Sign out</button>
          </>
        ) : (
          <NavLink to="/login" onClick={() => setMobileOpen(false)}>Sign In</NavLink>
        )}
      </div>
    </header>
  );
}

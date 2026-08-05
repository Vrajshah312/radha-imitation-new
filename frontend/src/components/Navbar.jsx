"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import "@/styles/Navbar.css";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const closeTimer = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories)).catch(() => setCategories([]));
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
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function openMenu() { clearTimeout(closeTimer.current); setMenuOpen(true); }
  function scheduleClose() { closeTimer.current = setTimeout(() => setMenuOpen(false), 180); }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
    setSearchTerm("");
  }

  return (
    <header className={`nav-header ${scrolled ? "is-scrolled" : ""}`} data-testid="site-header">
      <div className="nav-topline" data-testid="nav-topline">
        Free shipping across India on orders <em>over ₹999</em>
      </div>

      <div className="container nav-inner">
        <nav className="nav-links">
          <Link href="/" className="nav-link" data-testid="nav-home-link">Home</Link>

          <div className="nav-item-shop" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
            <button className="nav-link nav-shop-trigger" onClick={() => router.push("/shop")} data-testid="nav-shop-trigger">
              Shop
              <svg width="10" height="6" viewBox="0 0 10 6" className="chev"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.4" /></svg>
            </button>

            <div className={`mega-menu ${menuOpen ? "is-open" : ""}`} data-testid="mega-menu">
              <div className="mega-menu-inner">
                {categories.map((cat) => (
                  <div className="mega-col" key={cat.id}>
                    <Link href={`/shop/${cat.id}`} className="mega-col-title" data-testid={`mega-col-${cat.id}`}>{cat.name}</Link>
                    <p className="mega-col-tagline">{cat.tagline}</p>
                    <ul>
                      {cat.subcategories.map((sub) => (
                        <li key={sub.id}><Link href={`/shop/${cat.id}/${sub.id}`}>{sub.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mega-col mega-col-feature">
                  <span className="eyebrow">New This Week</span>
                  <h4>Festive Edit</h4>
                  <p>Fresh kundan, temple &amp; meenakari pieces for the season ahead.</p>
                  <Link href="/shop?isNew=true" className="btn btn-small" data-testid="mega-cta">Explore</Link>
                </div>
              </div>
            </div>
          </div>

          <Link href="/shop?bestseller=true" className="nav-link" data-testid="nav-bestsellers-link">Bestsellers</Link>
        </nav>

        <Link href="/" className="nav-brand" data-testid="nav-brand-link">
          <img src="/logo.png" alt="Radha Imitation Jewellery" className="nav-brand-logo" />
        </Link>

        <button className={`nav-burger ${mobileOpen ? "is-active" : ""}`} aria-label="Toggle menu" onClick={() => setMobileOpen((o) => !o)} data-testid="nav-burger">
          <span /><span /><span />
        </button>

        <div className="nav-actions">
          <button className="nav-icon-btn" aria-label="Search" onClick={() => setSearchOpen((s) => !s)} data-testid="nav-search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>

          {user ? (
            <div className="nav-user">
              <Link href="/account" className="nav-icon-btn" aria-label="My account" data-testid="nav-profile-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20c1.6-3.6 5-5.4 7.5-5.4s5.9 1.8 7.5 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </Link>
              <button className="nav-text-btn" onClick={logout} data-testid="nav-signout-btn">Sign out</button>
            </div>
          ) : (
            <Link href="/login" className="nav-icon-btn" aria-label="Sign in" data-testid="nav-login-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20c1.6-3.6 5-5.4 7.5-5.4s5.9 1.8 7.5 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </Link>
          )}

          <Link href="/cart" className="nav-icon-btn nav-cart" aria-label="Cart" data-testid="nav-cart-link">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M6 8h12l-1 11.5a1.5 1.5 0 01-1.5 1.5h-7a1.5 1.5 0 01-1.5-1.5L6 8z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" /></svg>
            {totalItems > 0 && <span className="cart-count" data-testid="cart-count">{totalItems}</span>}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="nav-search-bar" data-testid="nav-search-bar">
          <form className="container" onSubmit={handleSearchSubmit}>
            <input autoFocus type="text" placeholder="Search for jhumkas, kundan sets, bangles…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="nav-search-input" />
            <button type="submit" className="btn btn-small" data-testid="nav-search-submit">Search</button>
          </form>
        </div>
      )}

      <div className={`nav-mobile ${mobileOpen ? "is-open" : ""}`}>
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        {categories.map((cat) => (
          <details key={cat.id}>
            <summary>{cat.name}</summary>
            <div className="nav-mobile-sub">
              {cat.subcategories.map((sub) => (
                <Link key={sub.id} href={`/shop/${cat.id}/${sub.id}`} onClick={() => setMobileOpen(false)}>{sub.name}</Link>
              ))}
            </div>
          </details>
        ))}
        <Link href="/shop?bestseller=true" onClick={() => setMobileOpen(false)}>Bestsellers</Link>
        {user ? (
          <>
            <Link href="/account" onClick={() => setMobileOpen(false)}>My Account</Link>
            <button onClick={logout}>Sign out</button>
          </>
        ) : (
          <Link href="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
        )}
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import useReveal from "../components/useReveal.js";
import "./Home.css";

function Reveal({ children, className = "" }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

const CATEGORY_IMG = {
  necklaces: "https://images.unsplash.com/photo-1640183298005-3a4497cc6a37?auto=format&fit=crop&w=1200&q=80",
  earrings: "https://images.unsplash.com/photo-1651160670627-2896ddf7822f?auto=format&fit=crop&w=1200&q=80",
  "bangles-bracelets": "https://images.unsplash.com/photo-1758995116383-f51775896add?auto=format&fit=crop&w=1200&q=80",
};

const VALUE_ICONS = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-0.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12a8 8 0 018-8 8 8 0 016.9 4M20 12a8 8 0 01-8 8 8 8 0 01-6.9-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4v5h-5M4 20v-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  hand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 11V6a1.5 1.5 0 013 0v5M10 11V4.5a1.5 1.5 0 013 0V11M13 11V6a1.5 1.5 0 013 0v6M16 11.5V8.5a1.5 1.5 0 013 0v6a6 6 0 01-6 6h-2c-2.5 0-4-1.5-5-3.5L4 13a1.7 1.7 0 013-1.7L8 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="11" width="14" height="10" rx="2" strokeLinejoin="round" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function Hero({ slides, active, onSelect }) {
  const slide = slides[active];
  return (
    <section className="hero" data-testid="hero-section">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{slide?.eyebrow || "New Collection"}</span>
            <h1 className="hero-title">
              {slide?.title || "Adornments for"}{" "}
              <em>{slide?.accent || "every Radha"}</em>
            </h1>
            <p className="hero-desc">
              {slide?.description ||
                "Kundan, temple, meenakari and everyday-ethnic pieces — handpicked to feel as good as they look."}
            </p>
            <div className="hero-actions">
              <Link to={slide?.buttonLink || "/shop"} className="btn" data-testid="hero-primary-cta">
                {slide?.buttonLabel || "Shop the Collection"}
              </Link>
              <Link to="/shop?isNew=true" className="btn btn-outline" data-testid="hero-secondary-cta">
                New Arrivals
              </Link>
            </div>
            <div className="hero-meta">
              <span><strong>500+</strong>Pieces crafted</span>
              <span><strong>4.8</strong>Avg rating</span>
              <span><strong>7-day</strong>Easy returns</span>
            </div>
          </div>

          <div className="hero-media">
            {slides.map((banner, i) => (
              <div className={`hero-media-slide ${i === active ? "is-active" : ""}`} key={banner.id || `slide-${i}`}>
                {banner.image && <img src={banner.image} alt={banner.title || ""} />}
              </div>
            ))}
            {slides.length > 1 && (
              <div className="carousel-dots">
                {slides.map((banner, i) => (
                  <button
                    key={banner.id || i}
                    className={i === active ? "is-active" : ""}
                    onClick={() => onSelect(i)}
                    aria-label={`Show slide ${i + 1}`}
                    data-testid={`hero-dot-${i}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
    api.get("/products", { params: { bestseller: true } })
      .then((res) => setBestsellers(res.data.products.slice(0, 4)));
    api.get("/products", { params: { isNew: true } })
      .then((res) => setNewArrivals(res.data.products.slice(0, 4)));
    api.get("/banners").then((res) => setBanners(res.data.banners)).catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => setActiveBanner((c) => (c + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const fallbackBanner = {
    id: "fallback",
    eyebrow: "New Collection",
    title: "Adornments for",
    accent: "every Radha.",
    description:
      "Kundan, temple, meenakari and everyday-ethnic pieces — handpicked to feel as good as they look.",
    buttonLabel: "Shop the Collection",
    buttonLink: "/shop",
    image:
      "https://images.pexels.com/photos/33268181/pexels-photo-33268181.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
  };
  const slides = banners.length ? banners : [fallbackBanner];

  return (
    <div className="home">
      <Hero slides={slides} active={activeBanner} onSelect={setActiveBanner} />

      {/* ------- Categories ------- */}
      <section className="section" data-testid="categories-section">
        <div className="container">
          <Reveal className="section-head">
            <div className="section-head-title">
              <span className="eyebrow">Shop by Category</span>
              <h2>Find your <em>piece.</em></h2>
            </div>
            <Link to="/shop" className="link-arrow" data-testid="categories-view-all">
              View all <span className="arrow">→</span>
            </Link>
          </Reveal>

          <Reveal className="categories-grid stagger">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.id}`}
                className="category-tile"
                data-testid={`category-tile-${cat.id}`}
              >
                <img
                  src={CATEGORY_IMG[cat.id] || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80"}
                  alt={cat.name}
                />
                <div className="category-tile-content">
                  <h3>{cat.name}</h3>
                  <p>{cat.tagline}</p>
                  <span className="category-tile-link">Explore →</span>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------- Bestsellers ------- */}
      <section className="section" data-testid="bestsellers-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <div className="section-head-title">
              <span className="eyebrow">Loved by many</span>
              <h2>Best<em>sellers.</em></h2>
            </div>
            <Link to="/shop?bestseller=true" className="link-arrow" data-testid="bestsellers-view-all">
              See all <span className="arrow">→</span>
            </Link>
          </Reveal>

          <Reveal className="product-grid stagger">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------- Values ------- */}
      <section className="container" data-testid="values-section">
        <div className="values-band">
          <div className="container">
            <div className="values-grid">
              <div className="value-cell">
                <div className="value-cell-icon">{VALUE_ICONS.shield}</div>
                <h4>Skin Friendly</h4>
                <p>Anti-tarnish, nickel-free plating.</p>
              </div>
              <div className="value-cell">
                <div className="value-cell-icon">{VALUE_ICONS.refresh}</div>
                <h4>7-Day Returns</h4>
                <p>Easy exchange, no questions asked.</p>
              </div>
              <div className="value-cell">
                <div className="value-cell-icon">{VALUE_ICONS.hand}</div>
                <h4>Handfinished</h4>
                <p>Detailed by artisans, piece by piece.</p>
              </div>
              <div className="value-cell">
                <div className="value-cell-icon">{VALUE_ICONS.lock}</div>
                <h4>Secure Checkout</h4>
                <p>Your details are always protected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------- New arrivals ------- */}
      <section className="section" data-testid="new-arrivals-section">
        <div className="container">
          <Reveal className="section-head">
            <div className="section-head-title">
              <span className="eyebrow">Fresh in</span>
              <h2>New <em>Arrivals.</em></h2>
            </div>
            <Link to="/shop?isNew=true" className="link-arrow" data-testid="new-arrivals-view-all">
              All new <span className="arrow">→</span>
            </Link>
          </Reveal>

          <Reveal className="product-grid stagger">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------- Story ------- */}
      <section className="story-block" data-testid="story-section">
        <div className="container story-inner">
          <Reveal className="story-image">
            <img
              src="https://images.pexels.com/photos/7895502/pexels-photo-7895502.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900"
              alt="Radha atelier"
            />
          </Reveal>

          <Reveal className="story-copy">
            <span className="eyebrow">Our Story</span>
            <h2>Made for the moments <em>that matter.</em></h2>
            <p>
              Radha Imitation Jewellery began with a simple idea — that
              celebration-worthy jewellery shouldn't need a locker key. Every
              piece we design borrows from traditional Indian craft while
              staying light, wearable and kind to your skin.
            </p>
            <Link to="/shop" className="btn" data-testid="story-cta">
              Explore the collection
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

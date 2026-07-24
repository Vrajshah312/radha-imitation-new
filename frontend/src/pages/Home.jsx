import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import useReveal from "../components/useReveal.js";
import "./Home.css";

function Reveal({ children, className = "", as = "div" }) {
  const ref = useReveal();
  const Tag = as;
  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}

// Curated category imagery
const CATEGORY_IMG = {
  necklaces: "https://images.unsplash.com/photo-1599459183200-59c7687a1c22?w=1200&q=80",
  earrings: "https://images.unsplash.com/photo-1635767582909-345c063a70e7?w=1200&q=80",
  "bangles-bracelets": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=80",
};

function HeroBlock({ slides, active, onSelect }) {
  return (
    <section className="hero-editorial" data-testid="hero-section">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-caption">
            <div className="hero-meta">
              <span>Volume 01</span>
              <em>Chapter one — {slides[active]?.eyebrow || "The Archive"}</em>
              <span>2026</span>
            </div>
            <h1 className="hero-headline">
              {slides[active]?.title || "Objects of"}<br />
              <em>{slides[active]?.accent || "Devotion."}</em>
            </h1>
            <p className="hero-copy">
              {slides[active]?.description ||
                "A curated catalogue of imitation heirlooms — where temple craft meets brutalist form, and every piece is designed to be worn, not locked away."}
            </p>
            <div className="hero-actions">
              <Link to={slides[active]?.buttonLink || "/shop"} className="btn" data-testid="hero-primary-cta">
                <span>{slides[active]?.buttonLabel || "Enter The Archive"} →</span>
              </Link>
              <Link to="/shop?isNew=true" className="btn btn-outline" data-testid="hero-secondary-cta">
                <span>New Arrivals</span>
              </Link>
            </div>
          </div>

          <div className="hero-media">
            {slides.map((banner, i) => (
              <div className={`hero-media-slide ${i === active ? "is-active" : ""}`} key={banner.id || `slide-${i}`}>
                {banner.image && <img src={banner.image} alt={banner.title || "editorial"} />}
              </div>
            ))}
            <div className="hero-media-tags">
              <span>№ {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              <span>Radha / Editorial</span>
            </div>
            <div className="hero-media-caption">
              &mdash; {slides[active]?.accent ? `“${slides[active].accent}”` : "“For every celebration.”"}
            </div>
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

function Ticker() {
  const items = [
    "Handset Kundan",
    "Temple Motifs",
    "Meenakari Enamel",
    "Nickel-Free",
    "Made in India",
    "Pearl Drops",
    "Chandbali Silhouettes",
    "Kada Weight",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="ticker" data-testid="ticker">
      <div className="ticker-track">
        <span>
          {doubled.map((item, i) => (
            <span key={i}>
              <em>{item}</em>
              <span className="ticker-dot" />
            </span>
          ))}
        </span>
      </div>
    </div>
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
    const timer = setInterval(() => setActiveBanner((c) => (c + 1) % banners.length), 6500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const fallbackBanner = {
    id: "fallback",
    eyebrow: "The Archive",
    title: "Objects of",
    accent: "Devotion.",
    description:
      "A curated catalogue of imitation heirlooms — kundan, temple, kemp and meenakari — where craft meets brutalist form.",
    buttonLabel: "Enter The Archive",
    buttonLink: "/shop",
    image:
      "https://images.pexels.com/photos/33268181/pexels-photo-33268181.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
  };
  const slides = banners.length ? banners : [fallbackBanner];

  return (
    <div className="home">
      <HeroBlock slides={slides} active={activeBanner} onSelect={setActiveBanner} />
      <Ticker />

      {/* ------- Categories ------- */}
      <section className="chapter" data-testid="categories-section">
        <div className="container">
          <Reveal className="chapter-head">
            <span className="chapter-index">01</span>
            <div className="chapter-title-wrap">
              <span className="eyebrow eyebrow-mute">The Archive · Categories</span>
              <h2 className="chapter-title">
                Three chapters, <em>nine sub-plots.</em>
              </h2>
            </div>
            <Link to="/shop" className="link-arrow chapter-cta" data-testid="categories-view-all">
              View all <span className="arrow">→</span>
            </Link>
          </Reveal>

          <Reveal className="categories-grid stagger">
            {categories.slice(0, 3).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.id}`}
                className={`category-tile category-tile-${i + 1}`}
                data-testid={`category-tile-${cat.id}`}
              >
                <img
                  src={CATEGORY_IMG[cat.id] || `https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80`}
                  alt={cat.name}
                />
                <div className="category-tile-content">
                  <div className="category-tile-top">
                    <span>№ {String(i + 1).padStart(2, "0")}</span>
                    <span>{cat.subcategories?.length || 0} pieces</span>
                  </div>
                  <div>
                    <h3>{cat.name}</h3>
                    <p>{cat.tagline}</p>
                    <span className="category-tile-link">Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------- Bestsellers ------- */}
      <section className="chapter" data-testid="bestsellers-section">
        <div className="container">
          <Reveal className="chapter-head">
            <span className="chapter-index">02</span>
            <div className="chapter-title-wrap">
              <span className="eyebrow eyebrow-mute">Chapter Two · The Canon</span>
              <h2 className="chapter-title">
                Repeat <em>offenders.</em>
              </h2>
            </div>
            <Link to="/shop?bestseller=true" className="link-arrow chapter-cta" data-testid="bestsellers-view-all">
              See all bestsellers <span className="arrow">→</span>
            </Link>
          </Reveal>

          <Reveal className="product-grid-tetris stagger">
            {bestsellers.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------- Values ------- */}
      <section className="values-band" data-testid="values-section">
        <div className="container">
          <div className="values-grid">
            <div className="value-cell">
              <span className="num">01</span>
              <h4>Skin Kind</h4>
              <p>Anti-tarnish, nickel-free plating that behaves.</p>
            </div>
            <div className="value-cell">
              <span className="num">02</span>
              <h4>Seven-Day Grace</h4>
              <p>Easy returns, easier exchanges — no fine print.</p>
            </div>
            <div className="value-cell">
              <span className="num">03</span>
              <h4>Handfinished</h4>
              <p>Artisan-touched, piece by piece. No two identical.</p>
            </div>
            <div className="value-cell">
              <span className="num">04</span>
              <h4>Discreet Checkout</h4>
              <p>Encrypted end to end. Wallet, card or UPI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------- New arrivals ------- */}
      <section className="chapter" data-testid="new-arrivals-section">
        <div className="container">
          <Reveal className="chapter-head">
            <span className="chapter-index">03</span>
            <div className="chapter-title-wrap">
              <span className="eyebrow eyebrow-mute">Chapter Three · Fresh Editions</span>
              <h2 className="chapter-title">
                Just <em>arrived.</em>
              </h2>
            </div>
            <Link to="/shop?isNew=true" className="link-arrow chapter-cta" data-testid="new-arrivals-view-all">
              All new pieces <span className="arrow">→</span>
            </Link>
          </Reveal>

          <Reveal className="product-grid stagger">
            {newArrivals.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
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
            <span className="story-image-tag">— from the atelier, 2026</span>
          </Reveal>

          <Reveal className="story-copy">
            <span className="eyebrow eyebrow-mute">Manifesto · No. 04</span>
            <h2>
              Made for the moments<br />that <em>matter.</em>
            </h2>
            <p>
              Radha began with a stubborn belief — that celebration-worthy jewellery
              shouldn't need a locker key. Every piece borrows from traditional
              Indian craft while staying light, wearable and kind to your skin.
            </p>
            <Link to="/shop" className="btn" data-testid="story-cta">
              <span>Read the archive →</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

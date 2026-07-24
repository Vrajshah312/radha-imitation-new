import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import SparkleField from "../components/SparkleField.jsx";
import useReveal from "../components/useReveal.js";
import "./Home.css";

function RevealSection({ children, className = "" }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

function HomeCarousel({ slides, activeSlide, onSelect }) {
  return (
    <section className="hero home-carousel">
      <div className="hero-ring gold-ring" />
      <div className="hero-ring gold-ring hero-ring-2" />
      <SparkleField count={16} />
      {slides.map((banner, index) => (
        <div className={`hero-slide ${index === activeSlide ? "is-active" : ""}`} key={banner.id || "fallback"}>
          {banner.image && <img className="hero-slide-image" src={banner.image} alt="" />}
          <div className="hero-slide-shade" />
          <div className="container hero-inner">
            <span className="eyebrow">{banner.eyebrow}</span>
            <h1>{banner.title} {banner.accent && <em>{banner.accent}</em>}</h1>
            {banner.description && <p className="hero-copy">{banner.description}</p>}
            <div className="hero-actions">
              <Link to={banner.buttonLink} className="btn btn-primary">{banner.buttonLabel}</Link>
              <Link to="/shop?isNew=true" className="btn btn-outline">New Arrivals</Link>
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 && <div className="carousel-dots" aria-label="Banner slides">
        {slides.map((banner, index) => <button key={banner.id} className={index === activeSlide ? "is-active" : ""} onClick={() => onSelect(index)} aria-label={`Show slide ${index + 1}`} />)}
      </div>}
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
    api
      .get("/products", { params: { bestseller: true } })
      .then((res) => setBestsellers(res.data.products.slice(0, 4)));
    api
      .get("/products", { params: { isNew: true } })
      .then((res) => setNewArrivals(res.data.products.slice(0, 4)));
    api.get("/banners").then((res) => setBanners(res.data.banners)).catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => setActiveBanner((current) => (current + 1) % banners.length), 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const fallbackBanner = { eyebrow: "Imitation Jewellery, Reimagined", title: "Adornments for every", accent: "Radha", description: "Kundan, temple, meenakari and everyday-ethnic pieces — handpicked to feel as good as they look.", buttonLabel: "Shop the Collection", buttonLink: "/shop", image: "" };
  const slides = banners.length ? banners : [fallbackBanner];

  return (
    <div className="home">
      {/* ---------- Hero ---------- */}
      <HomeCarousel slides={slides} activeSlide={activeBanner} onSelect={setActiveBanner} />
      <section className="legacy-hero">
        <div className="hero-ring gold-ring" />
        <div className="hero-ring gold-ring hero-ring-2" />
        <SparkleField count={16} />
        <div className="container hero-inner">
          <span className="eyebrow">Imitation Jewellery, Reimagined</span>
          <h1>
            Adornments for every <em>Radha</em> in her own story
          </h1>
          <p className="hero-copy">
            Kundan, temple, meenakari and everyday-ethnic pieces — handpicked
            and finished to feel as good as they look, without the price tag
            of real gold.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop the Collection
            </Link>
            <Link to="/shop?isNew=true" className="btn btn-outline">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Category showcase ---------- */}
      <section className="section categories-section">
        <div className="container">
          <RevealSection className="section-head">
            <span className="eyebrow">Shop by Category</span>
            <h2>Find your piece</h2>
            <div className="divider" />
          </RevealSection>

          <div className="category-grid">
            {categories.map((cat, i) => (
              <RevealSection key={cat.id} className={`category-tile-wrap delay-${i}`}>
                <Link to={`/shop/${cat.id}`} className="category-tile">
                  <div className="category-tile-media ring-frame">
                    <img
                      src={`https://picsum.photos/seed/${cat.id}/640/760`}
                      alt={cat.name}
                    />
                  </div>
                  <h3>{cat.name}</h3>
                  <p>{cat.tagline}</p>
                  <span className="category-tile-link">Discover &rarr;</span>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Bestsellers ---------- */}
      <section className="section bestseller-section">
        <div className="container">
          <RevealSection className="section-head">
            <span className="eyebrow">Loved By Many</span>
            <h2>Bestsellers</h2>
            <div className="divider" />
          </RevealSection>
          <div className="product-grid">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/shop?bestseller=true" className="btn btn-outline">
              View All Bestsellers
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Brand strip ---------- */}
      <section className="brand-strip">
        <div className="container brand-strip-inner">
          <div>
            <h4>Skin Friendly</h4>
            <p>Anti-tarnish, nickel-free plating</p>
          </div>
          <div>
            <h4>7-Day Returns</h4>
            <p>Easy exchange, no questions asked</p>
          </div>
          <div>
            <h4>Handfinished</h4>
            <p>Detailed by artisans, piece by piece</p>
          </div>
          <div>
            <h4>Secure Checkout</h4>
            <p>Your details are always protected</p>
          </div>
        </div>
      </section>

      {/* ---------- New arrivals ---------- */}
      <section className="section new-section">
        <div className="container">
          <RevealSection className="section-head">
            <span className="eyebrow">Fresh In</span>
            <h2>New Arrivals</h2>
            <div className="divider" />
          </RevealSection>
          <div className="product-grid">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Story banner ---------- */}
      <section className="story-banner">
        <div className="container story-banner-inner">
          <RevealSection>
            <span className="eyebrow">Our Story</span>
            <h2>Made for the moments that matter</h2>
            <p>
              Radha Imitation Jewellery began with a simple idea — that
              celebration-worthy jewellery shouldn't need a locker key. Every
              piece we design borrows from traditional Indian craft while
              staying light, wearable and kind to your skin.
            </p>
            <Link to="/shop" className="btn btn-maroon">
              Explore the Edit
            </Link>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

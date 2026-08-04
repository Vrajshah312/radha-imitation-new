"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import "@/styles/Home.css";

const CATEGORY_IMG = {
  necklaces: "https://images.unsplash.com/photo-1640183298005-3a4497cc6a37?auto=format&fit=crop&w=1200&q=80",
  earrings: "https://images.unsplash.com/photo-1651160670627-2896ddf7822f?auto=format&fit=crop&w=1200&q=80",
  "bangles-bracelets": "https://images.unsplash.com/photo-1758995116383-f51775896add?auto=format&fit=crop&w=1200&q=80",
};

function Hero({ slide }) {
  return (
    <section className="hero" data-testid="hero-section">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{slide?.eyebrow || "New Collection"}</span>
            <h1 className="hero-title">
              {slide?.title || "Adornments for"} <em>{slide?.accent || "every Radha"}</em>
            </h1>
            <p className="hero-desc">{slide?.description || "Kundan, temple, meenakari and everyday-ethnic pieces — handpicked to feel as good as they look."}</p>
            <div className="hero-actions">
              <Link href={slide?.buttonLink || "/shop"} className="btn" data-testid="hero-primary-cta">{slide?.buttonLabel || "Shop the Collection"}</Link>
              <Link href="/shop?isNew=true" className="btn btn-outline" data-testid="hero-secondary-cta">New Arrivals</Link>
            </div>
            <div className="hero-meta">
              <span><strong>500+</strong>Pieces crafted</span>
              <span><strong>4.8</strong>Avg rating</span>
              <span><strong>7-day</strong>Easy returns</span>
            </div>
          </div>
          <div className="hero-media">
            <div className="hero-media-slide is-active">{slide?.image && <img src={slide.image} alt={slide.title || ""} />}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.categories)).catch(() => {});
    api.get("/products", { params: { bestseller: true } }).then((r) => setBestsellers(r.data.products.slice(0, 4))).catch(() => {});
    api.get("/products", { params: { isNew: true } }).then((r) => setNewArrivals(r.data.products.slice(0, 4))).catch(() => {});
    api.get("/banners").then((r) => setBanner(r.data.banners?.[0])).catch(() => {});
  }, []);

  return (
    <div className="home">
      <Hero slide={banner} />

      <section className="section" data-testid="categories-section">
        <div className="container">
          <div className="section-head">
            <div className="section-head-title">
              <span className="eyebrow">Shop by Category</span>
              <h2>Find your <em>piece.</em></h2>
            </div>
            <Link href="/shop" className="link-arrow" data-testid="categories-view-all">View all <span className="arrow">→</span></Link>
          </div>
          <div className="categories-grid">
            {categories.slice(0, 3).map((cat) => (
              <Link key={cat.id} href={`/shop/${cat.id}`} className="category-tile" data-testid={`category-tile-${cat.id}`}>
                <img src={CATEGORY_IMG[cat.id] || "https://images.unsplash.com/photo-1640183298005-3a4497cc6a37?auto=format&fit=crop&w=1200&q=80"} alt={cat.name} />
                <div className="category-tile-content">
                  <h3>{cat.name}</h3>
                  <p>{cat.tagline}</p>
                  <span className="category-tile-link">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-testid="bestsellers-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div className="section-head-title">
              <span className="eyebrow">Loved by many</span>
              <h2>Best<em>sellers.</em></h2>
            </div>
            <Link href="/shop?bestseller=true" className="link-arrow" data-testid="bestsellers-view-all">See all <span className="arrow">→</span></Link>
          </div>
          <div className="product-grid">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section" data-testid="new-arrivals-section">
        <div className="container">
          <div className="section-head">
            <div className="section-head-title">
              <span className="eyebrow">Fresh in</span>
              <h2>New <em>Arrivals.</em></h2>
            </div>
            <Link href="/shop?isNew=true" className="link-arrow" data-testid="new-arrivals-view-all">All new <span className="arrow">→</span></Link>
          </div>
          <div className="product-grid">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="story-block" data-testid="story-section">
        <div className="container story-inner">
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1617633150878-7df1d12a9a57?auto=format&fit=crop&w=900&q=80" alt="Radha atelier" />
          </div>
          <div className="story-copy">
            <span className="eyebrow">Our Story</span>
            <h2>Made for the moments <em>that matter.</em></h2>
            <p>Radha Imitation Jewellery began with a simple idea — that celebration-worthy jewellery shouldn't need a locker key. Every piece borrows from traditional Indian craft while staying light, wearable and kind to your skin.</p>
            <Link href="/shop" className="btn" data-testid="story-cta">Explore the collection</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

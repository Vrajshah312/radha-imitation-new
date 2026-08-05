"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import "@/styles/ProductDetail.css";

// Receives product + related from the server component so the initial HTML is
// fully rendered (good for SEO / Google indexing). Only interactivity is client.
export default function ProductView({ product, related = [] }) {
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  function handleAdd() { addToCart(product, qty); setAdded(true); setTimeout(() => setAdded(false), 1600); }

  return (
    <div className="pdp">
      <div className="container pdp-grid">
        <div className="pdp-gallery" data-testid="pdp-gallery">
          <div className="pdp-thumbs">
            {product.images.map((img, i) => (
              <button key={img + i} className={`pdp-thumb ${activeImage === i ? "is-active" : ""}`} onClick={() => setActiveImage(i)} data-testid={`pdp-thumb-${i}`}>
                <img src={img} alt="" />
              </button>
            ))}
          </div>
          <div className="pdp-main-image"><img src={product.images[activeImage]} alt={product.name} /></div>
        </div>

        <div className="pdp-info">
          <div className="pdp-meta-top">
            <span>SKU · {product.id}</span>
            <span>{product.reviews} reviews</span>
          </div>
          <div className="pdp-badges">
            {product.isNew && <span className="badge badge-new">New</span>}
            {product.isBestseller && <span className="badge badge-best">Bestseller</span>}
          </div>
          <h1 data-testid="pdp-title">{product.name}</h1>
          <div className="pdp-rating">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}<span>({product.reviews} reviews)</span></div>
          <div className="price-row pdp-price">
            <span className="price-now">₹{product.price.toLocaleString("en-IN")}</span>
            {discount > 0 && <span className="price-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>}
            {discount > 0 && <span className="price-off">{discount}% off</span>}
          </div>
          <p className="pdp-desc">{product.description}</p>
          <div className="pdp-meta">
            {product.material && <div><span>Material</span><p>{product.material}</p></div>}
            {product.colors?.length > 0 && <div><span>Colours</span><p>{product.colors.join(", ")}</p></div>}
            <div><span>Availability</span><p>{product.stock > 0 ? `In stock — ${product.stock} left` : "Out of stock"}</p></div>
            {product.subcategory && <div><span>Subcategory</span><p style={{ textTransform: "capitalize" }}>{product.subcategory.replace(/-/g, " ")}</p></div>}
          </div>
          <div className="pdp-actions">
            <div className="qty-stepper" data-testid="pdp-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="pdp-qty-decrease">–</button>
              <span data-testid="pdp-qty-value">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} data-testid="pdp-qty-increase">+</button>
            </div>
            <button className="btn" onClick={handleAdd} disabled={product.stock === 0} data-testid="pdp-add-to-bag">{added ? "Added ✓" : "Add to Bag"}</button>
          </div>
          <ul className="pdp-trust"><li>Anti-tarnish plating</li><li>Nickel-free, skin-kind</li><li>Seven-day returns</li><li>Ships in 2–3 days</li></ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container pdp-related">
          <div className="section-head" style={{ marginBottom: 32 }}>
            <div className="section-head-title">
              <span className="eyebrow">You may also like</span>
              <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 400, margin: 0 }}>Complete the <em style={{ fontStyle: "italic", color: "var(--gold)" }}>look.</em></h2>
            </div>
          </div>
          <div className="product-grid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}

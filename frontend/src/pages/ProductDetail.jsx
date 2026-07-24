import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard.jsx";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQty(1);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        return api.get("/products", { params: { category: res.data.product.category } });
      })
      .then((res) => {
        if (res) setRelated(res.data.products.filter((p) => p.id !== id).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader">Loading product…</div>;
  if (!product) {
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-outline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  function handleAdd() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="pdp">
      <div className="container pdp-grid">
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
          <div className="pdp-thumbs">
            {product.images.map((img, i) => (
              <button
                key={img}
                className={`pdp-thumb ${activeImage === i ? "is-active" : ""}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <div className="pdp-badges">
            {product.isNew && <span className="badge badge-new">New</span>}
            {product.isBestseller && <span className="badge badge-best">Bestseller</span>}
          </div>
          <h1>{product.name}</h1>
          <div className="pdp-rating">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
            <span>({product.reviews} reviews)</span>
          </div>

          <div className="price-row pdp-price">
            <span className="price-now">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="price-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>
            <span className="price-off">{discount}% off</span>
          </div>

          <p className="pdp-desc">{product.description}</p>

          <div className="pdp-meta">
            <div>
              <span>Material</span>
              <p>{product.material}</p>
            </div>
            <div>
              <span>Available Colours</span>
              <p>{product.colors.join(", ")}</p>
            </div>
            <div>
              <span>Availability</span>
              <p>{product.stock > 0 ? `In stock (${product.stock} left)` : "Out of stock"}</p>
            </div>
          </div>

          <div className="pdp-actions">
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>–</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary" onClick={handleAdd} disabled={product.stock === 0}>
              {added ? "Added ✓" : "Add to Bag"}
            </button>
          </div>

          <ul className="pdp-trust">
            <li>Anti-tarnish, nickel-free plating</li>
            <li>7-day easy returns &amp; exchange</li>
            <li>Dispatched within 2–3 business days</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section pdp-related">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">You May Also Like</span>
              <h2>Complete the look</h2>
              <div className="divider" />
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

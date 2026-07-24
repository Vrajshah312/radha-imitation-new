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

  if (loading) return <div className="page-loader">Loading piece…</div>;
  if (!product) {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <span className="eyebrow eyebrow-mute">404</span>
        <h2 style={{ margin: "16px 0 20px" }}>Piece not found</h2>
        <Link to="/shop" className="btn btn-outline"><span>Back to archive →</span></Link>
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
        <div className="pdp-gallery" data-testid="pdp-gallery">
          <div className="pdp-thumbs">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                className={`pdp-thumb ${activeImage === i ? "is-active" : ""}`}
                onClick={() => setActiveImage(i)}
                data-testid={`pdp-thumb-${i}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
          <div className="pdp-main-image">
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
        </div>

        <div className="pdp-info">
          <div className="pdp-meta-top">
            <span>RJ · {product.id}</span>
            <em>{product.category.replace("-", " ")}</em>
            <span>№ {String(product.reviews).padStart(3, "0")}</span>
          </div>

          <div className="pdp-badges">
            {product.isNew && <span className="badge badge-new">New</span>}
            {product.isBestseller && <span className="badge badge-best">Bestseller</span>}
          </div>

          <h1 data-testid="pdp-title">{product.name}</h1>

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
              <span>Colours</span>
              <p>{product.colors.join(", ")}</p>
            </div>
            <div>
              <span>Availability</span>
              <p>{product.stock > 0 ? `In stock — ${product.stock} left` : "Out of stock"}</p>
            </div>
            <div>
              <span>Subcategory</span>
              <p style={{ textTransform: "capitalize" }}>{product.subcategory.replace("-", " ")}</p>
            </div>
          </div>

          <div className="pdp-actions">
            <div className="qty-stepper" data-testid="pdp-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="pdp-qty-decrease">–</button>
              <span data-testid="pdp-qty-value">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} data-testid="pdp-qty-increase">+</button>
            </div>
            <button
              className="btn"
              onClick={handleAdd}
              disabled={product.stock === 0}
              data-testid="pdp-add-to-bag"
            >
              <span>{added ? "Added ✓" : "Add to Bag →"}</span>
            </button>
          </div>

          <ul className="pdp-trust">
            <li>Anti-tarnish plating</li>
            <li>Nickel-free, skin-kind</li>
            <li>Seven-day returns</li>
            <li>Ships in 2–3 days</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container pdp-related">
          <div className="chapter-head">
            <span className="chapter-index">↳</span>
            <div className="chapter-title-wrap">
              <span className="eyebrow eyebrow-mute">Complete the look</span>
              <h2 className="chapter-title">
                Related <em>editions.</em>
              </h2>
            </div>
            <span />
          </div>
          <div className="product-grid">
            {related.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

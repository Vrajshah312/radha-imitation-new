import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

export default function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const hasHoverImage = product.images?.length > 1 && product.images[1] !== product.images[0];
  const idx = typeof index === "number" ? String(index + 1).padStart(3, "0") : product.id;

  return (
    <article className="product-card" data-testid={`product-card-${product.id}`}>
      <div className={`product-media ${hasHoverImage ? "has-hover-image" : ""}`}>
        <Link to={`/product/${product.id}`} data-testid={`product-card-link-${product.id}`}>
          <img src={product.images[0]} alt={product.name} loading="lazy" />
          {hasHoverImage && (
            <img src={product.images[1]} alt="" className="product-media-hover" loading="lazy" />
          )}
        </Link>
        <div className="product-badges">
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.isBestseller && <span className="badge badge-best">Bestseller</span>}
        </div>
        <button
          className="product-quickadd"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to bag`}
          data-testid={`product-quickadd-${product.id}`}
        >
          Add to Bag —
        </button>
      </div>

      <div className="product-info">
        <div className="product-index-line">
          <span>RJ</span>
          <span className="index-num">№ {idx}</span>
          <span>{discount}% off</span>
        </div>
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="price-row">
          <span className="price-now">₹{product.price.toLocaleString("en-IN")}</span>
          <span className="price-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </article>
  );
}

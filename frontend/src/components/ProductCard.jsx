import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const hasHoverImage = product.images?.length > 1 && product.images[1] !== product.images[0];

  return (
    <div className="product-card">
      <div className={`product-media ${hasHoverImage ? "has-hover-image" : ""}`}>
        <Link to={`/product/${product.id}`}>
          <img src={product.images[0]} alt={product.name} loading="lazy" />
          {hasHoverImage && <img src={product.images[1]} alt="" className="product-media-hover" loading="lazy" />}
        </Link>
        <div className="product-badges">
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.isBestseller && <span className="badge badge-best">Bestseller</span>}
        </div>
        <button
          className="product-quickadd"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to bag`}
        >
          Add to Bag
        </button>
      </div>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="price-row">
          <span className="price-now">₹{product.price.toLocaleString("en-IN")}</span>
          <span className="price-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>
          <span className="price-off">{discount}% off</span>
        </div>
      </div>
    </div>
  );
}

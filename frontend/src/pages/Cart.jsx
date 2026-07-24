import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

export default function Cart() {
  const { items, updateQty, removeFromCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = totalPrice >= 999 || totalPrice === 0 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  function handleCheckout() {
    navigate(user ? "/checkout" : "/login", { state: { from: { pathname: "/checkout" } } });
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty container" data-testid="cart-empty">
        <span className="eyebrow eyebrow-mute">The Bag</span>
        <h1>Nothing on the <em>counter.</em></h1>
        <p>Wander through the archive and add a few pieces you love.</p>
        <Link to="/shop" className="btn" data-testid="cart-empty-cta">
          <span>Enter The Archive →</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-heading">
          <div>
            <span className="eyebrow eyebrow-mute">The Bag · Volume 01</span>
            <h1 data-testid="cart-heading">
              {totalItems} <em>{totalItems === 1 ? "piece" : "pieces"}</em>
            </h1>
          </div>
          <Link to="/shop" className="link-arrow" data-testid="cart-continue-shopping">
            <span className="arrow">←</span> Continue
          </Link>
        </div>

        <div className="cart-layout">
          <div className="cart-items" data-testid="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.id} data-testid={`cart-item-${item.id}`}>
                <Link to={`/product/${item.id}`} className="cart-item-media">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p className="cart-item-price">₹{item.price.toLocaleString("en-IN")}</p>
                  <div className="cart-item-row">
                    <div className="qty-stepper">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} data-testid={`cart-decrease-${item.id}`}>–</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} data-testid={`cart-increase-${item.id}`}>+</button>
                    </div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.id)} data-testid={`cart-remove-${item.id}`}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary" data-testid="cart-summary">
            <span className="eyebrow eyebrow-mute">Summary</span>
            <h3>Ledger</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Complimentary" : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p className="summary-note">
                Add ₹{(999 - totalPrice).toLocaleString("en-IN")} more for complimentary shipping.
              </p>
            )}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <button className="btn btn-block" onClick={handleCheckout} data-testid="cart-checkout-btn">
              <span>Proceed to Checkout →</span>
            </button>
            <Link to="/shop" className="cart-continue">← Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="cart-empty container">
        <span className="eyebrow">Your Bag</span>
        <h1>Your bag is feeling light</h1>
        <p>Browse the collection and add a few pieces you love.</p>
        <Link to="/shop" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-heading">
          <span className="eyebrow">Your Bag</span>
          <h1>{totalItems} {totalItems === 1 ? "Item" : "Items"}</h1>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.id}>
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
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>–</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
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

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p className="summary-note">
                Add ₹{(999 - totalPrice).toLocaleString("en-IN")} more for free shipping
              </p>
            )}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <Link to="/shop" className="cart-continue">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

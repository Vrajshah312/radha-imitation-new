import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Checkout.css";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const shipping = totalPrice >= 999 || totalPrice === 0 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    // Demo checkout — no real payment gateway is wired up, but the order
    // is genuinely created on the backend so it shows up in the admin
    // dashboard's order management.
    setError("");
    setSubmitting(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        shippingAddress: form,
      });
      setPlaced(true);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="checkout-success container">
        <div className="gold-ring success-ring" />
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you, {form.fullName.split(" ")[0] || "there"}!</h1>
        <p>
          Your order has been placed (demo mode — no live payment was
          processed). A confirmation would normally be sent to your email.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-success container">
        <h1>Your bag is empty</h1>
        <p>Add a few pieces to your bag before checking out.</p>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-heading">
        <span className="eyebrow">Almost There</span>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h3>Shipping Details</h3>
          <div className="form-field">
            <label>Full Name</label>
            <input name="fullName" required value={form.fullName} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Address</label>
            <input name="address" required value={form.address} onChange={handleChange} />
          </div>
          <div className="checkout-form-row">
            <div className="form-field">
              <label>City</label>
              <input name="city" required value={form.city} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>State</label>
              <input name="state" required value={form.state} onChange={handleChange} />
            </div>
          </div>
          <div className="checkout-form-row">
            <div className="form-field">
              <label>Pincode</label>
              <input name="pincode" required value={form.pincode} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input name="phone" required value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <h3>Payment</h3>
          <div className="payment-note">
            This is a demo store — no real payment gateway is connected. Placing
            an order simply confirms the flow end-to-end.
          </div>
          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? "Placing Order…" : `Place Order — ₹${grandTotal.toLocaleString("en-IN")}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="checkout-line" key={item.id}>
              <span>
                {item.name} <em>× {item.qty}</em>
              </span>
              <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

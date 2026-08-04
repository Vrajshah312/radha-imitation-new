"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import "@/styles/Checkout.css";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [placed, setPlaced] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", address: "", city: "", state: "", pincode: "", phone: "" });

  useEffect(() => { if (!loading && !user) router.replace("/login?redirect=/checkout"); }, [loading, user, router]);
  useEffect(() => { if (user) setForm((f) => ({ ...f, fullName: f.fullName || user.name || "" })); }, [user]);

  const shipping = totalPrice >= 999 || totalPrice === 0 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const r = await api.post("/orders", { items: items.map((i) => ({ id: i.id, qty: i.qty })), shippingAddress: form });
      setPlaced(r.data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not place your order. Please try again.");
    } finally { setSubmitting(false); }
  }

  if (placed) {
    return (
      <div className="checkout-success container" data-testid="checkout-success">
        <div className="checkout-success-tick">✓</div>
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you, <em>{form.fullName.split(" ")[0] || "friend"}.</em></h1>
        <p>Your order <strong>{placed.id}</strong> has been placed{placed.preview ? " (preview — connect WordPress to create it in your live store)" : " in your WooCommerce store"}. Payment method: Cash on Delivery.</p>
        <button className="btn" onClick={() => router.push("/shop")} data-testid="checkout-success-continue">Continue Shopping</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-success container">
        <h1>Your bag is <em>empty.</em></h1>
        <p>Add a few pieces to your bag before checking out.</p>
        <button className="btn" onClick={() => router.push("/shop")}>Shop Now</button>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-heading"><span className="eyebrow">Almost there</span><h1>Check<em>out.</em></h1></div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder} data-testid="checkout-form">
          <h3>Shipping Details</h3>
          <div className="form-field"><label>Full Name</label><input name="fullName" required value={form.fullName} onChange={handleChange} data-testid="checkout-fullName" /></div>
          <div className="form-field"><label>Address</label><input name="address" required value={form.address} onChange={handleChange} data-testid="checkout-address" /></div>
          <div className="checkout-form-row">
            <div className="form-field"><label>City</label><input name="city" required value={form.city} onChange={handleChange} data-testid="checkout-city" /></div>
            <div className="form-field"><label>State</label><input name="state" required value={form.state} onChange={handleChange} data-testid="checkout-state" /></div>
          </div>
          <div className="checkout-form-row">
            <div className="form-field"><label>Pincode</label><input name="pincode" required value={form.pincode} onChange={handleChange} data-testid="checkout-pincode" /></div>
            <div className="form-field"><label>Phone</label><input name="phone" required value={form.phone} onChange={handleChange} data-testid="checkout-phone" /></div>
          </div>
          <h3>Payment</h3>
          <div className="payment-note">Payment is <strong>Cash on Delivery</strong>. Placing the order creates it in your connected WooCommerce store.</div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-block" type="submit" disabled={submitting} data-testid="checkout-place-order">{submitting ? "Placing Order…" : `Place Order — ₹${grandTotal.toLocaleString("en-IN")}`}</button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="checkout-line" key={item.id}><span>{item.name} <em>× {item.qty}</em></span><span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span></div>
          ))}
          <div className="summary-row" style={{ marginTop: 10 }}><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          <div className="summary-row summary-total"><span>Total</span><span>₹{grandTotal.toLocaleString("en-IN")}</span></div>
        </div>
      </div>
    </div>
  );
}

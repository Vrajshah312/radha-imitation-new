"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import "@/styles/Checkout.css";

// ── Shipping logic ──────────────────────────────────────────
function calcShipping(city, subtotal) {
  if (subtotal === 0) return 0;
  const isAhmedabad = city.trim().toLowerCase().replace(/\s+/g, "") === "ahmedabad";
  return isAhmedabad ? 40 : 80;
}

// ── Pincode → City / State lookup ───────────────────────────
async function fetchPincodeData(pin) {
  if (pin.length !== 6) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data[0]?.Status === "Success") {
      const post = data[0].PostOffice[0];
      return { city: post.District, state: post.State };
    }
  } catch {}
  return null;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [placed, setPlaced] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", address: "", city: "", state: "", pincode: "", phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/checkout");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, fullName: f.fullName || user.name || "" }));
  }, [user]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch {} };
  }, []);

  // Auto-fill city & state from pincode
  const handleChange = useCallback(async (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "pincode" && value.length === 6) {
      setPincodeLoading(true);
      const result = await fetchPincodeData(value);
      if (result) {
        setForm((f) => ({ ...f, city: result.city, state: result.state }));
      }
      setPincodeLoading(false);
    }
  }, []);

  const shipping = calcShipping(form.city, totalPrice);
  const grandTotal = totalPrice + shipping;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError(""); setSubmitting(true);

    const orderPayload = {
      items: items.map((i) => ({ id: i.id, qty: i.qty })),
      shippingAddress: form,
    };

    if (paymentMethod === "cod") {
      try {
        const r = await api.post("/orders", orderPayload);
        setPlaced(r.data.order);
        clearCart();
      } catch (err) {
        setError(err.response?.data?.message || "Could not place your order. Please try again.");
      } finally { setSubmitting(false); }

    } else if (paymentMethod === "razorpay") {
      try {
        const { data: orderParams } = await api.post("/razorpay/create-order", { items: orderPayload.items });

        if (orderParams.id.startsWith("mock_order_")) {
          alert("Razorpay keys missing. Simulating successful payment for development.");
          const mockVerify = await api.post("/razorpay/verify", {
            razorpay_order_id: orderParams.id,
            razorpay_payment_id: "pay_mock123",
            razorpay_signature: "mock_sig",
            ...orderPayload,
          });
          setPlaced(mockVerify.data.order);
          clearCart();
          setSubmitting(false);
          return;
        }

        const options = {
          key: orderParams.key,
          amount: orderParams.amount,
          currency: orderParams.currency,
          name: "Radha Imitation Jewellery",
          description: "Jewellery Purchase",
          image: "/logo.png",
          order_id: orderParams.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post("/razorpay/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...orderPayload,
              });
              setPlaced(verifyRes.data.order);
              clearCart();
            } catch (verErr) {
              setError(verErr.response?.data?.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: form.fullName,
            email: user?.email || "",
            contact: form.phone,
          },
          theme: { color: "#1c1a17" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          setError(response.error.description || "Payment failed. Please try again.");
        });
        rzp.open();
      } catch (err) {
        setError(err.response?.data?.message || "Could not initiate Razorpay checkout.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  // ── Success screen ─────────────────────────────────────────
  if (placed) {
    return (
      <div className="checkout-success container" data-testid="checkout-success">
        <div className="checkout-success-tick">✓</div>
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you, <em>{form.fullName.split(" ")[0] || "friend"}.</em></h1>
        <p>
          Your order <strong>{placed.id}</strong> has been placed
          {placed.preview ? " (preview — connect WordPress to go live)" : " successfully"}.
          Payment via {placed.paymentId ? "Razorpay" : "Cash on Delivery"}.
        </p>
        <button className="btn" onClick={() => router.push("/shop")} data-testid="checkout-success-continue">
          Continue Shopping
        </button>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="checkout-success container">
        <h1>Your bag is <em>empty.</em></h1>
        <p>Add a few pieces to your bag before checking out.</p>
        <button className="btn" onClick={() => router.push("/shop")}>Shop Now</button>
      </div>
    );
  }

  const isAhmedabad = form.city.trim().toLowerCase().replace(/\s+/g, "") === "ahmedabad";

  // ── Main checkout ──────────────────────────────────────────
  return (
    <div className="checkout-page container">
      <div className="checkout-heading">
        <span className="eyebrow">Almost there</span>
        <h1>Check<em>out.</em></h1>
      </div>

      <div className="checkout-layout">
        {/* ── LEFT: Form ── */}
        <form className="checkout-form" onSubmit={handlePlaceOrder} data-testid="checkout-form">

          <h3>Shipping Details</h3>

          <div className="form-field">
            <label>Full Name</label>
            <input name="fullName" required value={form.fullName} onChange={handleChange} data-testid="checkout-fullName" placeholder="e.g. Radha Patel" />
          </div>

          <div className="form-field">
            <label>Address</label>
            <input name="address" required value={form.address} onChange={handleChange} data-testid="checkout-address" placeholder="Street, Building, Area" />
          </div>

          {/* Pincode first — auto-fills city & state */}
          <div className="checkout-form-row">
            <div className="form-field">
              <label>
                Pincode
                {pincodeLoading && <span className="pincode-loading"> detecting…</span>}
              </label>
              <input
                name="pincode"
                required
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={handleChange}
                data-testid="checkout-pincode"
                placeholder="6-digit PIN"
              />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input name="phone" required inputMode="tel" value={form.phone} onChange={handleChange} data-testid="checkout-phone" placeholder="10-digit mobile" />
            </div>
          </div>

          <div className="checkout-form-row">
            <div className="form-field">
              <label>City {form.city && <span className="auto-filled">auto-filled</span>}</label>
              <input name="city" required value={form.city} onChange={handleChange} data-testid="checkout-city" placeholder="City / District" />
            </div>
            <div className="form-field">
              <label>State {form.state && <span className="auto-filled">auto-filled</span>}</label>
              <input name="state" required value={form.state} onChange={handleChange} data-testid="checkout-state" placeholder="State" />
            </div>
          </div>

          {/* Shipping info banner */}
          {form.city && (
            <div className={`shipping-info-banner ${isAhmedabad ? "is-local" : "is-outstation"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              {isAhmedabad
                ? "Local delivery · Ahmedabad — ₹40 shipping"
                : `Outstation delivery — ₹80 shipping to ${form.city}`}
            </div>
          )}

          {/* ── Payment Method ── */}
          <h3>Payment Method</h3>

          <div className="payment-options">
            {/* Razorpay card */}
            <label className={`payment-card ${paymentMethod === "razorpay" ? "is-selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-card-body">
                <div className="payment-card-left">
                  {/* Razorpay SVG logo */}
                  <svg className="razorpay-logo" viewBox="0 0 260 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Razorpay">
                    <path d="M36.2 0L11.5 47.2l9.2 5.4L41.5 13l-5.3-13z" fill="#3395FF"/>
                    <path d="M11.5 47.2L0 70h20.7l9.2-17.4-18.4-5.4z" fill="#072654"/>
                    <path d="M36.2 0l-9.2 5.4 14.8 34.4 9.2-5.3L36.2 0z" fill="#3395FF"/>
                    <path d="M41.8 39.8l-2 4.5L29.9 52.6l9.2 17.4H59L51.3 52l-9.5-12.2z" fill="#072654"/>
                    <text x="68" y="50" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700" fill="#072654">razorpay</text>
                  </svg>
                  <div className="payment-card-info">
                    <span className="payment-card-title">Pay Online</span>
                    <span className="payment-card-subtitle">UPI · Cards · Netbanking · Wallets</span>
                  </div>
                </div>
                <div className="payment-card-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </label>

            {/* COD card */}
            <label className={`payment-card ${paymentMethod === "cod" ? "is-selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-card-body">
                <div className="payment-card-left">
                  <div className="payment-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                  </div>
                  <div className="payment-card-info">
                    <span className="payment-card-title">Cash on Delivery</span>
                    <span className="payment-card-subtitle">Pay when your order arrives</span>
                  </div>
                </div>
                <div className="payment-card-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            className="btn btn-block"
            type="submit"
            disabled={submitting}
            data-testid="checkout-place-order"
          >
            {submitting ? "Processing…" : `Place Order — ₹${grandTotal.toLocaleString("en-IN")}`}
          </button>
        </form>

        {/* ── RIGHT: Order summary ── */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="checkout-line" key={item.id}>
              <span>{item.name} <em>× {item.qty}</em></span>
              <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? "shipping-free" : ""}>
              {form.city
                ? (shipping === 0 ? "Free" : `₹${shipping}`)
                : <em className="shipping-pending">Enter pincode</em>
              }
            </span>
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

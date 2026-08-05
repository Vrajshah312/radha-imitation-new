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

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  useEffect(() => { if (!loading && !user) router.replace("/login?redirect=/checkout"); }, [loading, user, router]);
  useEffect(() => { if (user) setForm((f) => ({ ...f, fullName: f.fullName || user.name || "" })); }, [user]);
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const shipping = totalPrice >= 999 || totalPrice === 0 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError(""); setSubmitting(true);

    const orderPayload = { items: items.map((i) => ({ id: i.id, qty: i.qty })), shippingAddress: form };

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
        // 1. Create Razorpay Order
        const { data: orderParams } = await api.post("/razorpay/create-order", { items: orderPayload.items });
        
        if (orderParams.id.startsWith("mock_order_")) {
           // Fallback for development if keys are missing
           alert("Razorpay keys missing. Simulating successful payment.");
           const mockVerify = await api.post("/razorpay/verify", {
             razorpay_order_id: orderParams.id,
             razorpay_payment_id: "pay_mock123",
             razorpay_signature: "mock_sig",
             ...orderPayload
           });
           setPlaced(mockVerify.data.order);
           clearCart();
           setSubmitting(false);
           return;
        }

        // 2. Open Razorpay Widget
        const options = {
          key: orderParams.key,
          amount: orderParams.amount,
          currency: orderParams.currency,
          name: "Radha Imitation Jewellery",
          description: "Purchase",
          order_id: orderParams.id,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              const verifyRes = await api.post("/razorpay/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...orderPayload
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
        rzp.on('payment.failed', function (response){
           setError(response.error.description || "Payment failed.");
        });
        rzp.open();
      } catch (err) {
        setError(err.response?.data?.message || "Could not initiate Razorpay checkout.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  if (placed) {
    return (
      <div className="checkout-success container" data-testid="checkout-success">
        <div className="checkout-success-tick">✓</div>
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you, <em>{form.fullName.split(" ")[0] || "friend"}.</em></h1>
        <p>Your order <strong>{placed.id}</strong> has been placed{placed.preview ? " (preview — connect WordPress to create it in your live store)" : " in your WooCommerce store"}. Payment method: {placed.paymentId ? "Razorpay" : "Cash on Delivery"}.</p>
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
          <h3>Payment Method</h3>
          <div className="payment-options" style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === "razorpay"} onChange={(e) => setPaymentMethod(e.target.value)} />
              Pay Online (Razorpay)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} />
              Cash on Delivery
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-block" type="submit" disabled={submitting} data-testid="checkout-place-order">{submitting ? "Processing…" : `Place Order — ₹${grandTotal.toLocaleString("en-IN")}`}</button>
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

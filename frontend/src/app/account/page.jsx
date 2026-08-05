"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import "@/styles/Profile.css";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => { if (!loading && !user) router.replace("/login?redirect=/account"); }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    api.get("/orders").then((r) => setOrders(r.data.orders || [])).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
  }, [user]);

  if (!user) return <div className="page-loader">Loading…</div>;

  const statusClass = (s) => `order-status order-status-${s}`;

  return (
    <div className="profile-page container" data-testid="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <div><span className="eyebrow">My Account</span><h1>Hi, <em>{user.name?.split(" ")[0]}.</em></h1></div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account Details</h3>
          <div className="profile-row"><span>Name</span><span>{user.name}</span></div>
          <div className="profile-row"><span>Email</span><span>{user.email}</span></div>
        </div>

        <div className="profile-card profile-orders" data-testid="account-orders">
          <h3>Order History</h3>
          {ordersLoading ? (
            <p className="profile-empty">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <p className="profile-empty" data-testid="account-orders-empty">
              No orders yet. When you check out, your WooCommerce orders will appear here.
            </p>
          ) : (
            <ul className="order-list">
              {orders.map((o) => (
                <li className="order-item" key={o.id} data-testid={`account-order-${o.id}`}>
                  <div className="order-item-head">
                    <div>
                      <strong>Order #{o.id}</strong>
                      {o.date && <span className="order-date">{new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                    <span className={statusClass(o.status)}>{o.status}</span>
                  </div>
                  <div className="order-item-body">
                    <div className="order-thumbs">
                      {(o.items || []).slice(0, 4).map((it, i) => (
                        it.image ? <img key={i} src={it.image} alt={it.name || ""} /> : null
                      ))}
                    </div>
                    <div className="order-item-meta">
                      <span>{(o.items || []).reduce((s, it) => s + (it.qty || 0), 0)} item(s)</span>
                      <strong>₹{Number(o.total || 0).toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button className="btn btn-outline" onClick={logout} data-testid="profile-signout">Sign Out</button>
    </div>
  );
}

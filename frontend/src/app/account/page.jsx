"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "@/styles/Profile.css";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !user) router.replace("/login?redirect=/account"); }, [loading, user, router]);
  if (!user) return <div className="page-loader">Loading…</div>;

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
        <div className="profile-card">
          <h3>Orders</h3>
          <p className="profile-empty">Your order history is available in your WordPress store account. Orders you place here are created in WooCommerce (Cash on Delivery).</p>
        </div>
      </div>
      <button className="btn btn-outline" onClick={logout} data-testid="profile-signout">Sign Out</button>
    </div>
  );
}

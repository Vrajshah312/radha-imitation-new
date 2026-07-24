import { useAuth } from "../context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="profile-page container">
      <div className="profile-header">
        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div>
          <span className="eyebrow">My Account</span>
          <h1>Hi, {user?.name?.split(" ")[0]}</h1>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account Details</h3>
          <div className="profile-row">
            <span>Name</span>
            <span>{user?.name}</span>
          </div>
          <div className="profile-row">
            <span>Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="profile-row">
            <span>Member Since</span>
            <span>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        <div className="profile-card">
          <h3>Orders</h3>
          <p className="profile-empty">
            You haven't placed any orders yet — once you check out, your order
            history will show up here.
          </p>
        </div>
      </div>

      <button className="btn btn-outline" onClick={logout}>
        Sign Out
      </button>
    </div>
  );
}

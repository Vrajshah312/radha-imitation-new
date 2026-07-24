import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  function loadUsers() {
    setLoading(true);
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function toggleStatus(u) {
    const nextStatus = u.status === "active" ? "blocked" : "active";
    if (!window.confirm(`${nextStatus === "blocked" ? "Block" : "Unblock"} ${u.name}?`)) return;
    await api.patch(`/admin/users/${u.id}/status`, { status: nextStatus });
    loadUsers();
  }

  async function toggleRole(u) {
    const nextRole = u.role === "admin" ? "customer" : "admin";
    if (!window.confirm(`Change ${u.name}'s role to ${nextRole}?`)) return;
    await api.patch(`/admin/users/${u.id}/role`, { role: nextRole });
    loadUsers();
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">People</span>
          <h1>Users</h1>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-toolbar-filters">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">No users found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="admin-row-name">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`pill ${u.role === "admin" ? "pill-amber" : "pill-grey"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${u.status === "active" ? "pill-green" : "pill-red"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="btn btn-outline btn-small"
                        onClick={() => toggleRole(u)}
                        disabled={u.id === currentUser.id}
                        title={u.id === currentUser.id ? "You can't change your own role" : ""}
                      >
                        {u.role === "admin" ? "Make Customer" : "Make Admin"}
                      </button>
                      <button
                        className="btn btn-outline btn-small"
                        onClick={() => toggleStatus(u)}
                        disabled={u.id === currentUser.id}
                        title={u.id === currentUser.id ? "You can't block yourself" : ""}
                      >
                        {u.status === "active" ? "Block" : "Unblock"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

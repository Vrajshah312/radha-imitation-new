import * as User from "../../models/User.js";

export async function listUsers(req, res) {
  const users = (await User.getAllUsers()).map(User.toPublicUser);
  return res.json({ users });
}

export async function updateUserStatus(req, res) {
  const { status } = req.body;
  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'active' or 'blocked'" });
  }
  const user = await User.updateUser(Number(req.params.id), { status });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user: User.toPublicUser(user) });
}

export async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'customer' or 'admin'" });
  }
  const user = await User.updateUser(Number(req.params.id), { role });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user: User.toPublicUser(user) });
}

export default { listUsers, updateUserStatus, updateUserRole };

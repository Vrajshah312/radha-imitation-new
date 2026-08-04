import bcrypt from "bcryptjs";

// In-memory user store (auth is app-level and shared by both data modes).
let users = [];
let counter = 0;

const clone = (u) => (u ? { ...u } : u);

export async function findUserByEmail(email) {
  return clone(users.find((u) => u.email === email.toLowerCase()) || null);
}

export async function findUserById(id) {
  return clone(users.find((u) => u.id === Number(id)) || null);
}

export async function createUser({ name, email, hashedPassword, role = "customer" }) {
  counter += 1;
  const user = {
    id: counter,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return clone(user);
}

export async function getAllUsers() {
  return users.map(clone).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateUser(id, updates) {
  const user = users.find((u) => u.id === Number(id));
  if (!user) return null;
  if (updates.status) user.status = updates.status.toLowerCase();
  if (updates.role) user.role = updates.role.toLowerCase();
  return clone(user);
}

export function toPublicUser(user) {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
}

export async function seedAdminUser() {
  if (await findUserByEmail("admin@radhajewellery.com")) return;
  await createUser({
    name: "Radha Admin",
    email: "admin@radhajewellery.com",
    hashedPassword: await bcrypt.hash("Admin@123", 10),
    role: "admin",
  });
}

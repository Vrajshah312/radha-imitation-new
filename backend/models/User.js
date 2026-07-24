import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
const mapUser = (user) => user && ({ ...user, password: user.passwordHash, role: user.role.toLowerCase(), status: user.status.toLowerCase() });
export async function findUserByEmail(email) { return mapUser(await prisma.user.findUnique({ where: { email: email.toLowerCase() } })); }
export async function findUserById(id) { return mapUser(await prisma.user.findUnique({ where: { id: Number(id) } })); }
export async function createUser({ name, email, hashedPassword, role = "customer" }) { return mapUser(await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: hashedPassword, role: role.toUpperCase() } })); }
export async function getAllUsers() { return (await prisma.user.findMany({ orderBy: { createdAt: "desc" } })).map(mapUser); }
export async function updateUser(id, updates) { try { return mapUser(await prisma.user.update({ where: { id: Number(id) }, data: { status: updates.status?.toUpperCase(), role: updates.role?.toUpperCase() } })); } catch { return null; } }
export function toPublicUser(user) { if (!user) return null; const { password, passwordHash, ...publicUser } = user; return publicUser; }
export async function seedAdminUser() { if (await findUserByEmail("admin@radhajewellery.com")) return; await createUser({ name: "Radha Admin", email: "admin@radhajewellery.com", hashedPassword: await bcrypt.hash("Admin@123", 10), role: "admin" }); }

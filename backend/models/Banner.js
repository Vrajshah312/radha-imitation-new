import prisma from "../lib/prisma.js";
export const getAll = () => prisma.banner.findMany({ orderBy: { order: "asc" } });
export const getActive = () => prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" } });
export const getById = (id) => prisma.banner.findUnique({ where: { id } });
export async function create(data) { const count = await prisma.banner.count(); return prisma.banner.create({ data: { id: data.id || `banner-${count + 1}`, eyebrow: data.eyebrow, title: data.title, accent: data.accent || "", description: data.description || "", buttonLabel: data.buttonLabel, buttonLink: data.buttonLink, image: data.image, active: data.active !== false, order: Number(data.order) || count + 1 } }); }
export async function update(id, data) { try { return await prisma.banner.update({ where: { id }, data: { eyebrow: data.eyebrow, title: data.title, accent: data.accent || "", description: data.description || "", buttonLabel: data.buttonLabel, buttonLink: data.buttonLink, image: data.image, active: !!data.active, order: Number(data.order) } }); } catch { return null; } }
export async function remove(id) { try { await prisma.banner.delete({ where: { id } }); return true; } catch { return false; } }

import prisma from "../lib/prisma.js";

const includeImages = { images: { orderBy: { position: "asc" } } };
const mapProduct = (product) => product && ({ ...product, category: product.categoryId, subcategory: product.subcategoryId, price: Number(product.price), mrp: Number(product.mrp), rating: Number(product.rating), images: product.images.map((image) => image.url) });

export async function getAll() { return (await prisma.product.findMany({ include: includeImages, orderBy: { createdAt: "desc" } })).map(mapProduct); }
export async function getById(id) { return mapProduct(await prisma.product.findUnique({ where: { id }, include: includeImages })); }
async function newId() { const count = await prisma.product.count(); return `p${String(count + 1).padStart(3, "0")}`; }
export async function create(data) {
  const product = await prisma.product.create({ data: { id: data.id || await newId(), name: data.name, categoryId: data.category, subcategoryId: data.subcategory, price: Number(data.price), mrp: Number(data.mrp), rating: Number(data.rating ?? 0), reviews: Number(data.reviews ?? 0), stock: Number(data.stock ?? 0), material: data.material || "", colors: data.colors || [], isNew: !!data.isNew, isBestseller: !!data.isBestseller, description: data.description || "", images: { create: (data.images?.length ? data.images : [`https://picsum.photos/seed/${encodeURIComponent(data.name || "product")}/700/850`]).map((url, position) => ({ url, position })) } }, include: includeImages });
  return mapProduct(product);
}
export async function update(id, updates) {
  try {
    const data = { name: updates.name, categoryId: updates.category, subcategoryId: updates.subcategory, price: updates.price === undefined ? undefined : Number(updates.price), mrp: updates.mrp === undefined ? undefined : Number(updates.mrp), rating: updates.rating === undefined ? undefined : Number(updates.rating), reviews: updates.reviews === undefined ? undefined : Number(updates.reviews), stock: updates.stock === undefined ? undefined : Number(updates.stock), material: updates.material, colors: updates.colors, isNew: updates.isNew, isBestseller: updates.isBestseller, description: updates.description };
    if (updates.images) data.images = { deleteMany: {}, create: updates.images.map((url, position) => ({ url, position })) };
    return mapProduct(await prisma.product.update({ where: { id }, data, include: includeImages }));
  } catch { return null; }
}
export async function remove(id) { try { await prisma.product.delete({ where: { id } }); return true; } catch { return false; } }
export async function adjustStock(id, delta) { try { return mapProduct(await prisma.product.update({ where: { id }, data: { stock: { increment: Number(delta) } }, include: includeImages })); } catch { return null; } }
export async function setStock(id, stock) { try { return mapProduct(await prisma.product.update({ where: { id }, data: { stock: Math.max(0, Number(stock)) }, include: includeImages })); } catch { return null; } }

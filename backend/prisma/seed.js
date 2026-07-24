import fs from "fs";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (filename) => JSON.parse(fs.readFileSync(path.join(dirname, "../data", filename), "utf8"));
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const categories = readJson("categories.json");
  const products = readJson("products.json");
  for (const category of categories) {
    await prisma.category.upsert({ where: { id: category.id }, update: { name: category.name, tagline: category.tagline }, create: { id: category.id, name: category.name, tagline: category.tagline } });
    for (const subcategory of category.subcategories) {
      await prisma.subcategory.upsert({ where: { id_categoryId: { id: subcategory.id, categoryId: category.id } }, update: { name: subcategory.name }, create: { id: subcategory.id, name: subcategory.name, categoryId: category.id } });
    }
  }
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { name: product.name, categoryId: product.category, subcategoryId: product.subcategory, price: product.price, mrp: product.mrp, rating: product.rating, reviews: product.reviews, stock: product.stock, material: product.material, colors: product.colors, isNew: product.isNew, isBestseller: product.isBestseller, description: product.description, images: { deleteMany: {}, create: product.images.map((url, position) => ({ url, position })) } },
      create: { id: product.id, name: product.name, categoryId: product.category, subcategoryId: product.subcategory, price: product.price, mrp: product.mrp, rating: product.rating, reviews: product.reviews, stock: product.stock, material: product.material, colors: product.colors, isNew: product.isNew, isBestseller: product.isBestseller, description: product.description, images: { create: product.images.map((url, position) => ({ url, position })) } },
    });
  }
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({ where: { email: "admin@radhajewellery.com" }, update: {}, create: { name: "Radha Admin", email: "admin@radhajewellery.com", passwordHash, role: UserRole.ADMIN } });
  await prisma.banner.upsert({ where: { id: "banner-1" }, update: {}, create: { id: "banner-1", eyebrow: "Limited-Time Offer", title: "Festive sparkle,", accent: "special prices", description: "Discover statement jewellery for every celebration.", buttonLabel: "Shop the Festive Edit", buttonLink: "/shop?isNew=true", image: "https://picsum.photos/seed/radha-festive/1600/850", order: 1 } });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });

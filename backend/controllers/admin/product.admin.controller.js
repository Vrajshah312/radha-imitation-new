import * as Product from "../../models/Product.js";
import * as Category from "../../models/Category.js";

function toBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function normaliseBulkProduct(row) {
  return {
    name: String(row.name || "").trim(),
    category: String(row.category || "").trim(),
    subcategory: String(row.subcategory || "").trim(),
    price: Number(row.price),
    mrp: Number(row.mrp),
    stock: Number(row.stock),
    material: String(row.material || "").trim(),
    colors: Array.isArray(row.colors)
      ? row.colors
      : String(row.colors || "").split("|").map((value) => value.trim()).filter(Boolean),
    images: Array.isArray(row.images)
      ? row.images
      : String(row.images || "").split("|").map((value) => value.trim()).filter(Boolean),
    description: String(row.description || "").trim(),
    isNew: toBoolean(row.isNew),
    isBestseller: toBoolean(row.isBestseller),
  };
}

async function validateBulkProduct(product) {
  const errors = [];
  const category = await Category.getById(product.category);
  if (!product.name) errors.push("name is required");
  if (!category) errors.push("category must be an existing category ID");
  if (category && !category.subcategories.some((sub) => sub.id === product.subcategory)) {
    errors.push("subcategory must belong to the selected category");
  }
  if (!Number.isFinite(product.price) || product.price < 0) errors.push("price must be zero or greater");
  if (!Number.isFinite(product.mrp) || product.mrp < 0) errors.push("mrp must be zero or greater");
  if (!Number.isFinite(product.stock) || product.stock < 0 || !Number.isInteger(product.stock)) {
    errors.push("stock must be a whole number zero or greater");
  }
  return errors;
}

export async function listProducts(req, res) {
  return res.json({ products: await Product.getAll() });
}

export async function createProduct(req, res) {
  const { name, category, subcategory, price, mrp } = req.body;
  if (!name || !category || !subcategory || price === undefined || mrp === undefined) {
    return res.status(400).json({
      message: "name, category, subcategory, price and mrp are required",
    });
  }
  const product = await Product.create(req.body);
  return res.status(201).json({ product });
}

// Imports are validated as a complete batch first, so an invalid CSV never
// leaves the catalogue half-imported.
export async function bulkCreateProducts(req, res) {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Provide at least one product to import" });
  }
  if (products.length > 500) {
    return res.status(400).json({ message: "A single import can contain at most 500 products" });
  }

  const normalised = products.map(normaliseBulkProduct);
  const errors = (await Promise.all(normalised.map(async (product, index) => ({ row: index + 2, errors: await validateBulkProduct(product) })))).filter((entry) => entry.errors.length);

  if (errors.length) {
    return res.status(400).json({
      message: "Fix the invalid rows and try again. No products were imported.",
      errors,
    });
  }

  const created = await Promise.all(normalised.map((product) => Product.create(product)));
  return res.status(201).json({ count: created.length, products: created });
}

export async function updateProduct(req, res) {
  const product = await Product.update(req.params.id, req.body);
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ product });
}

export async function deleteProduct(req, res) {
  const ok = await Product.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: "Product not found" });
  return res.json({ message: "Product deleted" });
}

export default { listProducts, createProduct, updateProduct, deleteProduct };

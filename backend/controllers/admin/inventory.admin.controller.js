import * as Product from "../../models/Product.js";

const LOW_STOCK_THRESHOLD = 10;

export async function listInventory(req, res) {
  const products = (await Product.getAll()).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    image: p.images?.[0],
    stock: p.stock,
    status: p.stock === 0 ? "out-of-stock" : p.stock <= LOW_STOCK_THRESHOLD ? "low-stock" : "in-stock",
  }));
  return res.json({ inventory: products, lowStockThreshold: LOW_STOCK_THRESHOLD });
}

export async function adjustStock(req, res) {
  const { delta } = req.body;
  if (delta === undefined || isNaN(Number(delta))) {
    return res.status(400).json({ message: "A numeric 'delta' is required" });
  }
  const product = await Product.adjustStock(req.params.id, Number(delta));
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ product });
}

export async function setStock(req, res) {
  const { stock } = req.body;
  if (stock === undefined || isNaN(Number(stock))) {
    return res.status(400).json({ message: "A numeric 'stock' value is required" });
  }
  const product = await Product.setStock(req.params.id, Number(stock));
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ product });
}

export default { listInventory, adjustStock, setStock };

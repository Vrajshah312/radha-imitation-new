// Server-only WordPress (WPGraphQL + WooGraphQL) data layer.
// When WORDPRESS_GRAPHQL_URL is not set, everything falls back to bundled
// sample data so the storefront is fully previewable before a store is connected.
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const sampleProducts = JSON.parse(fs.readFileSync(path.join(dataDir, "products.json"), "utf8"));
const sampleCategories = JSON.parse(fs.readFileSync(path.join(dataDir, "categories.json"), "utf8"));

export function wpConfigured() {
  return Boolean(process.env.WORDPRESS_GRAPHQL_URL);
}

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export async function wpQuery(query, variables = {}, token) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
  const headers = { "Content-Type": "application/json" };
  const auth = token || process.env.WORDPRESS_AUTH_TOKEN;
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ query, variables }) });
  if (!res.ok) throw new Error(`WordPress GraphQL responded with ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const CATEGORIES_QUERY = `
query WooCategories {
  productCategories(first: 100, where: { parent: 0, hideEmpty: false }) {
    nodes { slug name description children { nodes { slug name } } }
  }
}`;

const PRODUCT_FIELDS = `
  databaseId slug name
  description(format: RENDERED) shortDescription(format: RENDERED)
  averageRating reviewCount
  image { sourceUrl } galleryImages { nodes { sourceUrl } }
  productTags { nodes { slug } }
  productCategories { nodes { slug name parentDatabaseId } }
  ... on SimpleProduct { price(format: RAW) regularPrice(format: RAW) stockQuantity }
  ... on VariableProduct { price(format: RAW) regularPrice(format: RAW) stockQuantity }
`;
const PRODUCTS_QUERY = `query WooProducts($first:Int!){ products(first:$first){ nodes { ${PRODUCT_FIELDS} } } }`;
const PRODUCT_QUERY = `query WooProduct($slug:ID!){ product(id:$slug, idType:SLUG){ ${PRODUCT_FIELDS} } }`;

function mapCategory(node) {
  return {
    id: node.slug,
    name: node.name,
    tagline: stripHtml(node.description || ""),
    subcategories: (node.children?.nodes || []).map((c) => ({ id: c.slug, name: c.name })),
  };
}

function mapProduct(node, childParent = {}) {
  const cats = node.productCategories?.nodes || [];
  const child = cats.find((c) => c.parentDatabaseId) || cats.find((c) => childParent[c.slug]);
  const parent = cats.find((c) => !c.parentDatabaseId && !childParent[c.slug]);
  const tags = (node.productTags?.nodes || []).map((t) => t.slug);
  const images = [node.image?.sourceUrl, ...((node.galleryImages?.nodes || []).map((i) => i.sourceUrl))].filter(Boolean);
  const price = num(node.price);
  return {
    id: node.slug || String(node.databaseId),
    databaseId: node.databaseId,
    name: node.name,
    category: childParent[child?.slug] || parent?.slug || cats[0]?.slug || "",
    subcategory: child ? child.slug : "",
    price,
    mrp: num(node.regularPrice) || price,
    rating: Number(node.averageRating) || 0,
    reviews: Number(node.reviewCount) || 0,
    stock: Number.isFinite(node.stockQuantity) ? node.stockQuantity : 99,
    material: "",
    colors: [],
    isNew: tags.includes("new") || tags.includes("new-arrival"),
    isBestseller: tags.includes("bestseller") || tags.includes("featured"),
    description: stripHtml(node.description || node.shortDescription || ""),
    images: images.length ? images : [`https://picsum.photos/seed/${encodeURIComponent(node.slug || "woo")}/700/850`],
  };
}

export async function getCategories() {
  if (!wpConfigured()) return sampleCategories;
  try {
    const data = await wpQuery(CATEGORIES_QUERY);
    return (data.productCategories?.nodes || []).map(mapCategory);
  } catch (e) {
    console.warn("[wp] getCategories:", e.message);
    return [];
  }
}

async function childParentMap() {
  const cats = await getCategories();
  const map = {};
  for (const c of cats) for (const s of c.subcategories) map[s.id] = c.id;
  return map;
}

export async function getProducts() {
  if (!wpConfigured()) return sampleProducts;
  try {
    const cp = await childParentMap();
    const data = await wpQuery(PRODUCTS_QUERY, { first: 100 });
    return (data.products?.nodes || []).map((n) => mapProduct(n, cp));
  } catch (e) {
    console.warn("[wp] getProducts:", e.message);
    return [];
  }
}

export async function getProduct(slug) {
  if (!wpConfigured()) return sampleProducts.find((p) => p.id === slug) || null;
  try {
    const cp = await childParentMap();
    const data = await wpQuery(PRODUCT_QUERY, { slug });
    return data.product ? mapProduct(data.product, cp) : null;
  } catch (e) {
    console.warn("[wp] getProduct:", e.message);
    return null;
  }
}

// A signed-in customer's own WooCommerce orders (needs their WPGraphQL JWT).
const CUSTOMER_ORDERS = `
query MyOrders {
  customer {
    orders(first: 25) {
      nodes {
        orderNumber date status total
        lineItems { nodes { quantity total product { node { name slug image { sourceUrl } } } } }
      }
    }
  }
}`;

export async function getCustomerOrders(token) {
  if (!wpConfigured() || !token) return [];
  try {
    const data = await wpQuery(CUSTOMER_ORDERS, {}, token);
    const nodes = data.customer?.orders?.nodes || [];
    return nodes.map((o) => ({
      id: o.orderNumber,
      date: o.date,
      status: (o.status || "pending").toLowerCase(),
      total: num(o.total),
      items: (o.lineItems?.nodes || []).map((li) => ({
        name: li.product?.node?.name,
        qty: li.quantity,
        image: li.product?.node?.image?.sourceUrl,
      })),
    }));
  } catch (e) {
    console.warn("[wp] getCustomerOrders:", e.message);
    return [];
  }
}

// ---- Auth (WPGraphQL JWT) ----
const LOGIN = `mutation LogIn($username:String!,$password:String!){ login(input:{username:$username,password:$password}){ authToken user{ databaseId email firstName lastName } } }`;
const REGISTER = `mutation Register($input:RegisterCustomerInput!){ registerCustomer(input:$input){ authToken customer{ databaseId email firstName lastName } } }`;

const fullName = (u) => [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;

export async function wpLogin(email, password) {
  const data = await wpQuery(LOGIN, { username: email, password });
  const { authToken, user } = data.login;
  return { token: authToken, user: { id: user.databaseId, email: user.email, name: fullName(user), createdAt: new Date().toISOString() } };
}

export async function wpRegister({ name, email, password }) {
  const [firstName, ...rest] = String(name || "").trim().split(" ");
  const input = { username: email, email, password, firstName: firstName || email, lastName: rest.join(" ") };
  const data = await wpQuery(REGISTER, { input });
  const { authToken, customer } = data.registerCustomer;
  return { token: authToken, user: { id: customer.databaseId, email: customer.email, name: fullName(customer), createdAt: new Date().toISOString() } };
}

// ---- Orders (WooGraphQL createOrder, Cash-on-Delivery) ----
const CREATE_ORDER = `mutation CreateOrder($input:CreateOrderInput!){ createOrder(input:$input){ order { databaseId orderNumber status total date } } }`;

export async function wpCreateOrder(payload) {
  const lineItems = (payload.items || [])
    .filter((i) => i.databaseId)
    .map((i) => ({ productId: Number(i.databaseId), quantity: i.qty }));
  if (!lineItems.length) {
    const e = new Error("These products could not be matched to your WordPress store.");
    e.code = "NO_LINE_ITEMS";
    throw e;
  }
  const a = payload.address || {};
  const [firstName, ...rest] = String(a.fullName || payload.customerName || "Guest").trim().split(" ");
  const billing = {
    firstName, lastName: rest.join(" ") || "-", email: payload.customerEmail,
    address1: a.address || "", city: a.city || "", state: a.state || "",
    postcode: a.pincode || "", phone: a.phone || "", country: "IN",
  };
  const input = { paymentMethod: "cod", paymentMethodTitle: "Cash on Delivery", isPaid: false, billing, shipping: billing, lineItems };
  const data = await wpQuery(CREATE_ORDER, { input });
  const order = data.createOrder?.order;
  if (!order) throw new Error("WordPress did not return the created order.");
  return { id: order.orderNumber || String(order.databaseId), status: (order.status || "pending").toLowerCase(), total: num(order.total) || payload.total };
}

# Radha Imitation Jewellery — Full Stack E-commerce Site

A trendy, animated e-commerce storefront for an imitation jewellery brand,
built with **React (Vite)** on the frontend and **Node.js + Express** on the
backend, with JWT-based authentication and dummy product data.

## What's included

- Home page with an animated hero, category showcase, bestsellers, new
  arrivals and a brand story section
- **Shop menu with a hover mega-menu** — 3 main categories, each with 3
  sub-categories:
  - **Necklaces & Sets** → Kundan Necklace Sets, Temple Jewellery Sets, Choker Sets
  - **Earrings** → Jhumkas, Studs & Tops, Chandbalis
  - **Bangles & Bracelets** → Kada, Meenakari Bangles, Charm Bracelets
- Shop/listing page with category, sub-category, bestseller/new filters and sorting
- Product detail page with gallery, quantity selector and related products
- Cart with persistent (localStorage) state
- Full authentication: **Register / Login / Protected Profile & Checkout**
  using JWT, hashed passwords (bcrypt), stored in an in-memory user store
  (swap in MongoDB/Postgres later — the model file is written to make that easy)
- Demo checkout flow that creates a real order on the backend (no live
  payment gateway — clearly labelled as demo)
- Gold-and-maroon design system inspired by your logo, with a signature
  rotating "gold ring" motif, scroll reveal animations, hover states and a
  mobile-friendly responsive layout throughout
- **A full admin dashboard** at `/admin`, with its own premium dark-sidebar
  UI, role-based login, and:
  - **Dashboard** — revenue (7-day chart), order/customer/product counts,
    orders-by-status breakdown, recent orders
  - **Product management** — add / edit / delete products, set price, MRP,
    stock, images, tags (New / Bestseller)
  - **Category management** — add / edit / delete categories and their
    subcategories (the ones that power the storefront's mega-menu)
  - **Order management** — view every order placed on the storefront, see
    full item/shipping details, update order status
  - **User management** — view all registered users, promote/demote
    admin role, block/unblock accounts
  - **Inventory management** — stock levels with low-stock/out-of-stock
    flags and quick +/- stock adjustment

Your uploaded logo has already been placed at
`frontend/src/assets/logo.png` and is used in the navbar, footer, admin
sidebar and browser tab icon.

### Admin login

```
URL:      http://localhost:5173/admin/login
Email:    admin@radhajewellery.com
Password: Admin@123
```

This account is auto-seeded the first time the backend starts. Any
customer account can also be promoted to admin from the Users page.

## Project structure

```
radha-imitation-jewellery/
├── backend/                  Express API
│   ├── controllers/           auth, products, categories, orders
│   │   └── admin/              admin-only: products, categories, orders, users, inventory, stats
│   ├── data/                  seed data: products.json & categories.json
│   ├── middleware/            JWT auth + admin-only middleware
│   ├── models/                 in-memory User / Product / Category / Order stores
│   ├── routes/                 auth, products, categories, orders, admin
│   ├── utils/
│   ├── server.js
│   └── .env.example
└── frontend/                  React (Vite) app
    ├── src/
    │   ├── assets/             logo.png
    │   ├── components/         Navbar (mega-menu), Footer, ProductCard...
    │   ├── context/             AuthContext, CartContext
    │   ├── pages/               Home, Shop, ProductDetail, Cart, Login, Register, Profile, Checkout
    │   │   └── admin/            AdminLogin, AdminLayout, Dashboard, Products, Categories, Orders, Users, Inventory
    │   ├── routes/               ProtectedRoute, AdminRoute
    │   └── services/             axios api instance
    └── .env.example
```

## Getting started

You'll need [Node.js](https://nodejs.org) 18+ installed.

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # starts on http://localhost:5000
```

### PostgreSQL database

The backend now includes Prisma and a PostgreSQL schema. Install PostgreSQL locally,
create a database named `radha_jewellery`, and update `backend/.env` with its
connection string. Then run:

```bash
cd backend
npm run db:migrate:init  # creates the tables
npm run db:seed          # imports categories, products, default admin and banner
npm run db:studio        # optional visual database browser
```

For a hosted database, replace `DATABASE_URL` with the connection string from
your provider before running the migration. The API reads and writes through
Prisma/PostgreSQL; the JSON files are now only used to seed initial data.

### 2. Frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser. Register a new account to
try the customer login flow, or use the admin credentials above for the
dashboard. Everything (users, products, categories, orders, stock levels)
lives in memory for now — any changes you make (including through the admin
dashboard) reset whenever the backend restarts.

## Swapping in real data later

- Replace `backend/data/products.json` / `categories.json` with real seed
  data, or point `models/Product.js` / `models/Category.js` at a real
  database — both are already written as a small function-based data
  layer (`getAll`, `create`, `update`, `remove`, …) so the swap is
  mechanical.
- Replace `backend/models/User.js` and `models/Order.js`'s in-memory
  arrays with Mongoose/Sequelize models the same way — function names are
  already shaped to drop straight in.
- Product images currently use placeholder images (picsum.photos) —
  swap the `images` arrays for your real product photography, either
  directly in `products.json` or through the admin Products page.
- Wire up a real payment gateway (Razorpay/Stripe) in `Checkout.jsx` when
  you're ready to accept live payments.

## Notes on the design

- Colours and type are pulled from your logo: warm ivory background, deep
  antique gold, and a wine-maroon accent, with an italic serif for headings
  (echoing the script "Radha") and a wide-tracked uppercase sans for labels
  (echoing "I M I T A T I O N").
- The thin rotating gold ring in the hero, auth pages and around product/category
  images on hover is a deliberate callback to your logo's circular frame.

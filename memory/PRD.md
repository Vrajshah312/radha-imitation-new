# Radha Imitation Jewellery — PRD

## Product
Customer-facing storefront for an imitation-jewellery brand. Kundan, temple, meenakari and
everyday-ethnic pieces. WordPress/WooCommerce is the source of truth for catalogue, accounts and orders.

## Current architecture (Next.js — after conversion)
- **Single Next.js 14 App Router app** in `/app/frontend`, intended for **Vercel** (serverless).
  There is NO separate backend service in production — Next.js API route handlers do the server work.
- **Live-only**: no Demo toggle, no custom admin dashboard. Catalogue is managed in WordPress wp-admin.
- **Data**: `src/lib/wp.js` queries WordPress (WPGraphQL + WooGraphQL). When `WORDPRESS_GRAPHQL_URL`
  is not set it falls back to bundled sample data (`/app/frontend/data/*.json`, 18 products, 3 categories)
  so the app is fully previewable before a store is connected.
- **Auth**: WordPress accounts via WPGraphQL JWT (`login` / `registerCustomer`). Session stored in a
  signed **httpOnly cookie** (`src/lib/session.js`). Without WordPress, a demo fallback accepts any valid input.
- **Orders (checkout)**: WooGraphQL `createOrder` mutation, **Cash on Delivery**. Without WordPress,
  checkout returns a PREVIEW confirmation.
- **API routes** (`src/app/api/*`): mode, products, products/[slug], categories, banners,
  auth/{login,register,me,logout}, orders.
- **Pages**: home, shop (+ [category] + [category]/[subcategory]), product/[slug], cart, checkout,
  login, register, account, not-found. Cart is client-side (localStorage) with hydration-safe persistence.

### Emergent preview only
- Emergent ingress routes `/api` -> :8001 and the rest -> :3000. Next.js serves everything on :3000,
  so a tiny **preview proxy** (`/app/frontend/scripts/preview-proxy.mjs`, supervisor program `nodeapi`,
  http-proxy devDependency) forwards :8001 -> :3000. This is dev-only, ignored on Vercel (`.vercelignore`
  excludes `scripts/`). The old `/app/backend` folder has been removed — the app is now frontend-only.
- supervisor `frontend` runs `yarn start` = `next dev -p 3000 -H 0.0.0.0`.

## Connecting a real store / going live
1. Set up WordPress + WooCommerce + WPGraphQL + WooGraphQL + WPGraphQL JWT Authentication
   (WordPress ideally on a subdomain e.g. `cms.yourdomain.com`).
2. In `/app/frontend/.env` (and in Vercel env): `WORDPRESS_GRAPHQL_URL=https://cms.yourdomain.com/graphql`,
   `WORDPRESS_AUTH_TOKEN=<JWT for a user allowed to create orders>`, `SESSION_SECRET=<random>`.
3. Restart (preview) / redeploy (Vercel). The storefront then uses real products, accounts and orders.

## History
- 2026-06: Converted backend from Prisma/Postgres -> WordPress GraphQL (WooGraphQL) with Demo/Live toggle (Express+Vite).
- 2026-06: On-brand images, live-mode banner, live WooCommerce COD orders.
- 2026-06: **Full rewrite to Next.js** (Vite+Express removed) — Live-only, WordPress JWT auth,
  WooCommerce COD checkout, sample-data fallback for preview. Verified: 16/16 backend API tests,
  all storefront flows (browse, filter, search, PDP, cart, register/login, protected redirects,
  checkout preview order, account). Fixed cart-persists-on-reload bug (localStorage hydration flag).

## Backlog / next
- P1: Deploy to Vercel + connect `yourdomain.com`; WordPress on `cms.` subdomain.
- P2: Real payment gateway (beyond COD) via WooCommerce hosted checkout or a gateway.

## Implemented — follow-up (2026-06)
- SEO: product pages are now **server-rendered** (`app/product/[slug]/page.jsx` is a server component fetching data server-side) with `generateMetadata` (title/description/OpenGraph) and **Product JSON-LD** structured data. Initial HTML contains name/price/description/images — Google-indexable. `ProductView` now takes props instead of client-fetching.
- Order history: session cookie now stores the customer's WPGraphQL JWT; `getCustomerOrders(token)` queries `customer.orders`; `GET /api/orders` returns them; the `/account` page renders an order-history list (empty state until a store is connected).

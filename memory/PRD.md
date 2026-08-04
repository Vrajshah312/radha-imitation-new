# Radha Imitation Jewellery — PRD

## Original problem statement (this session)
User imported an existing GitHub repo (Node/Express + Prisma/Postgres backend, React/Vite frontend) and asked to:
- Convert the backend from Prisma + Postgres to a WordPress GraphQL (WooCommerce/WooGraphQL) data source.
- Remove the old Prisma/Postgres layer, keep a thin Express layer that queries WordPress GraphQL.
- Keep the existing demo data.
- Add one Live/Demo toggle button in the header (visible to everyone) to switch data source.

## Architecture (current)
- Backend: Node/Express (ESM), runs on port 8001 via supervisor program `nodeapi` (the default `backend` uvicorn program is stopped; this is a Node app, not FastAPI).
- Frontend: React + Vite, runs on port 3000 via `yarn start` (script added: `vite --host 0.0.0.0 --port 3000`).
- Data source is per-request, chosen by the `X-Data-Mode: demo|live` header (AsyncLocalStorage in `lib/mode.js`).
  - DEMO: in-memory data seeded from `backend/data/*.json` (products, categories). Admin edits persist until restart.
  - LIVE: WordPress GraphQL / WooGraphQL via `lib/wpgraphql.js` + `lib/woo.js`. Endpoint set via `WORDPRESS_GRAPHQL_URL` (+ optional `WORDPRESS_AUTH_TOKEN`). Currently EMPTY — user will plug in later.
- Auth (JWT), orders, users and banners are app-level and in-memory (shared by both modes).
- Admin catalog writes (products/categories/inventory) are blocked in LIVE mode (409) — catalog is managed in WordPress. Allowed in DEMO.
- Frontend: `ModeContext` (localStorage `radha_data_mode`, default demo) + `ModeToggle` in the Navbar header/mobile. Switching reloads so every page refetches.

## Implemented (2026-06)
- Removed Prisma/Postgres (deleted `lib/prisma.js`, `prisma/`, prisma config; dropped prisma deps from package.json).
- Rewrote all models (Product, Category, Order, User, Banner) — mode-aware / in-memory.
- Added WordPress GraphQL client + WooCommerce mappers (products, categories) that fail soft (empty results if endpoint missing/unreachable).
- Added `/api/mode` endpoint (reports mode + wordpressConfigured).
- Frontend Live/Demo toggle with a warning dot when Live is selected but no endpoint is configured.

## Verified
- Backend (curl + 29/29 pytest): health, /mode, demo catalogue with filters, live empty fail-soft, auth, admin write-guard (409 live / 201 demo), demo order create+list, live order friendly handling (no 500s).
- Frontend (100% of tested flows): demo storefront, Demo/Live toggle, on-brand images load, live-mode banner shows only in Live and toggles correctly.

## Implemented — follow-up iteration (2026-06)
- On-brand imagery: replaced all picsum placeholders in `data/products.json` (18 products), Home category tiles and hero banner with real jewellery photos (images.unsplash.com).
- Live-mode banner: `frontend/src/components/LiveModeBanner.jsx` — site-wide notice shown only in Live mode (green when a store is connected, amber warning when not) with a one-click "Switch to Demo".
- Live orders: WooGraphQL `createOrder` mutation in `lib/woo.js` (Cash-on-Delivery, no gateway). `Order.create` is mode-aware; live orders are created in WordPress and mirrored in-memory for the session. Requires `WORDPRESS_GRAPHQL_URL` + `WORDPRESS_AUTH_TOKEN` (a WP user allowed to create orders). Fails soft with a clear 502 message when unavailable.


## To connect a real store later
1. Install WordPress + WooCommerce + WPGraphQL + WPGraphQL WooCommerce (WooGraphQL) plugins.
2. Set `WORDPRESS_GRAPHQL_URL=https://your-store.com/graphql` in `backend/.env` and restart `nodeapi`.
3. Tag products `bestseller`/`new` in WooCommerce for the storefront's Bestseller/New sections.

## Backlog / next
- P1: Real WooCommerce order creation (checkout mutation) in Live mode.
- P2: Admin catalog management writing to WooCommerce via GraphQL mutations.
- P2: Cache live catalogue responses to reduce GraphQL calls.

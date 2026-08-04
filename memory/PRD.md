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
- Backend (curl): health, /mode, demo categories/products, live returns empty (not configured), admin login, admin write blocked in live (409) / allowed in demo (201).

## To connect a real store later
1. Install WordPress + WooCommerce + WPGraphQL + WPGraphQL WooCommerce (WooGraphQL) plugins.
2. Set `WORDPRESS_GRAPHQL_URL=https://your-store.com/graphql` in `backend/.env` and restart `nodeapi`.
3. Tag products `bestseller`/`new` in WooCommerce for the storefront's Bestseller/New sections.

## Backlog / next
- P1: Real WooCommerce order creation (checkout mutation) in Live mode.
- P2: Admin catalog management writing to WooCommerce via GraphQL mutations.
- P2: Cache live catalogue responses to reduce GraphQL calls.

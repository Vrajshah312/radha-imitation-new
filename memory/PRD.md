# Radha Imitation Jewellery — PRD

## Original Problem Statement
> "I want to re-design my current repo web app please look at that and re-design whole app please"

Follow-ups:
- User: keep the PostgreSQL + Prisma + Node/Express backend untouched
- User: "do not add big big text and all of that make it simple but attractive please"

## User Choices (verbatim)
- Design direction: *Surprise me*
- Scope: *Everything*
- Keep existing functionality intact
- Product photography: *Unsplash-curated*
- Motion level: *Rich (scroll reveals, entry animations, micro-interactions)*
- Refined pass: *simple but attractive — no big big text*

## Stack (unchanged)
- **Frontend**: React 18 + Vite + React Router 6 (redesigned UI, same architecture)
- **Backend**: Node/Express + Prisma + PostgreSQL (untouched — user-managed)
- `framer-motion` installed but not yet leveraged

## Design System — "Refined Minimal"
Reset from the earlier brutalist-editorial pass to a warm, product-forward minimal system.

- **Typography**: Fraunces (display, italic accents) + Inter Tight (body/UI). Heading sizes capped ~2.6rem.
- **Palette**: Warm ivory `#f8f5ee`, ink `#1c1a17`, gold `#a3803a` (accent), soft alt `#efeadd`.
- **Motifs**: Pill-shaped buttons, 12px rounded card corners, gold italic accent per section title (e.g. "Find your *piece*"), subtle hover reveals on product cards, soft dividers.
- **Motion**: Splash logo with animated gold progress line, hero image slow-zoom on load, image swap on card hover, "+ Add to Bag" slide-up, staggered reveals on scroll, link-arrow gap-grow on hover.

## What's Been Implemented (2026-01)
- **v1 (Neo-Heritage Archive)** — dramatic editorial (rolled back per user)
- **v2 (Refined Minimal)** — current:
  - Simplified `index.css` — warmer palette, Fraunces + Inter Tight, capped heading sizes, pill buttons, 12px card radii
  - `Navbar` — glass topbar, center wordmark "Radha.", simple Home / Shop / Bestsellers labels, refined mega-menu
  - `Footer` — normal footer with brand mark, columns, gold subscribe pill (no giant manifesto)
  - `EntryExperience` — clean 1.7s splash with just the wordmark + animated gold progress line
  - `Home` — hero split with soft stats row, section headers with italic gold accents, gentle category cards with hover zoom, product grids, values band inside cream card, story block
  - `Shop`, `ProductDetail`, `Cart`, `Checkout`, `Login`, `Register`, `Profile`, `NotFound` — all resized to sensible heading sizes with consistent tone
  - `Admin` — kept dark sidebar + dense tables but softened all headings, rounded modal, gentler numbers in KPI cards
- API contracts untouched; frontend still points at `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api`)
- Every interactive element has a `data-testid`
- `yarn build` passes cleanly (~51 kB gzip CSS + 91 kB gzip JS)

## Not Touched (as requested)
- All of `/app/backend/**` — Node/Express, Prisma schema, routes, controllers, models
- API endpoints, auth flow, order flow, admin CRUD contracts
- `.env.example` files, ports, deploy config

## Files Changed (v2)
- `frontend/index.html` (fonts → Fraunces + Inter Tight)
- `frontend/src/index.css` (design system reset)
- `frontend/src/components/{Navbar,Footer,ProductCard,EntryExperience}.{jsx,css}`
- `frontend/src/pages/{Home,Shop,ProductDetail,Cart,Checkout,Login,Register,Profile,NotFound}.{jsx,css}`
- `frontend/src/pages/admin/{AdminLayout,AdminLogin,Admin.css}`

## Verified
- Vite dev server + screenshots — Home, Shop, Cart, Login all render correctly at refined sizes
- `yarn build` — passes

## Next Action Items
- Start backend (`cd backend && npm run dev`) + frontend (`cd frontend && npm run dev`) to browse with real products
- If any block feels off with real content loaded, share a screenshot and I'll tune

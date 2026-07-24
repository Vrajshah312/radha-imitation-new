# Radha Imitation Jewellery — PRD

## Original Problem Statement
> "I want to re-design my current repo web app please look at that and re-design whole app please"

Follow-up user directive: **do not touch the PostgreSQL + Prisma backend** — only update the design.

## User Choices (verbatim)
- Design direction: *Surprise me — you pick the most distinctive direction*
- Scope: *Everything* (storefront + admin dashboard)
- Keep existing functionality intact
- Product photography: *Use curated jewellery-themed stock images (Unsplash)*
- Motion level: *Rich (scroll reveals, parallax, entry animations, micro-interactions)*

## Stack (unchanged by this session)
- **Frontend**: React 18 + Vite + React Router 6 (untouched core; UI redesigned in-place)
- **Backend**: Node/Express + Prisma + PostgreSQL (untouched — user-managed)
- **New dependency**: `framer-motion` added for future rich animations

## Design System — "Neo-Heritage Archive"
Full brutalist-museum editorial redesign based on `/app/design_guidelines.json`.

- **Typography**: Bodoni Moda (display, italics) + General Sans (body/UI)
- **Palette**: Monochrome canvas — Paper `#f4f2ea`, Ink `#0a0b0a`, Kemp `#7a1420` (signal)
- **Motifs**: 1px razor rules, no shadows, chapter-indexed sections (01/02/03), editorial serial numbers on every product ("RJ / № 001"), subtle SVG grain overlay, marquee ticker
- **Motion**: Splash marque with per-letter rise, editorial hero parallax, product hover swap + slide-up "Add to Bag", link swipe underlines, staggered scroll reveals

## What's Been Implemented (2026-01)
- New global design tokens & typography (`src/index.css`, `index.html`)
- Redesigned **Navbar** — center brand mark, mega-menu with dark feature column, glass topbar
- Redesigned **Footer** — massive manifesto headline + link columns + newsletter
- Redesigned **EntryExperience** — animated splash with rising Bodoni letters + editorial gate
- Redesigned **ProductCard** — image swap on hover, RJ index numbering, sharp quick-add
- Redesigned pages: **Home** (editorial hero + ticker + tetris grids + values band + story), **Shop** (chapter title + sidebar filters), **ProductDetail** (2-col sticky gallery), **Cart** (ledger summary), **Checkout** (grand sticky ledger), **Login/Register** (split editorial), **Profile** (brutalist cards), **NotFound**
- Redesigned **Admin** — dark sidebar, dense high-contrast tables, sharp KPI grid, brutalist modals & bar chart
- API contracts untouched — frontend still calls `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api`)
- `data-testid` attributes added throughout for every interactive/critical element

## Not Touched (as requested)
- All of `/app/backend/**` — Node/Express, Prisma schema, routes, controllers, models
- API endpoints, auth flow, order flow, admin CRUD contracts
- `.env.example` files, ports, deploy config

## Files Changed
- `frontend/index.html` (fonts)
- `frontend/src/index.css` (design system)
- `frontend/src/components/{Navbar,Footer,ProductCard,EntryExperience,Breadcrumbs}.{jsx,css}`
- `frontend/src/pages/{Home,Shop,ProductDetail,Cart,Checkout,Login,Register,Profile,NotFound}.{jsx,css}`
- `frontend/src/pages/admin/{AdminLayout,AdminLogin,Admin.css}`

## Verified
- `yarn build` — passes, 60 kB gzipped CSS + 92 kB gzipped JS
- Screenshots captured for Home, Shop, Cart, Login, Admin Login — all render correctly

## Notes
- Backend must be started separately by the user (per instruction) — frontend expects it on `http://localhost:5000/api`
- Product images use Unsplash URLs seeded via backend/frontend; frontend gracefully renders when API is offline
- No `data-testid` regressions; every button, form input, nav element carries one for QA

## Next Action Items
- User to run their own PG/Prisma backend + `yarn dev` in `frontend/`
- Optional: hook up framer-motion for further scroll-linked parallax if desired
- Optional: replace fallback banner + category imagery with brand photography

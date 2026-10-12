# Blaze & Bun — Gourmet Burger Ordering Platform

A complete, production-ready restaurant ordering website built with Next.js 16.
The design language is **fiery, bold, gourmet-burger** — deep charcoal, ember
orange and warm cream, with heavy condensed display type.

> **Note on originality:** this is an original brand. It was informed by common
> patterns in the Pakistani fast-food space (order-type → location → menu →
> bucket → checkout, midnight drops, sharing buckets, loyalty rewards), but no
> copy, imagery, logos or code were reproduced from any existing site. All
> photography is AI-generated for this brand; all menu art is generated SVG.

---

## Quick start

```bash
cd app
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run start          # serve the production build

npm test               # 76 unit tests (pricing + hydration + server pricing)
npm run qa             # tests + production build — the pre-deploy gate
```

Requires Node 20+. The site runs without a database (in-memory fallback); to
make data durable, see **Setting it up** under *Data & state* below.

### What the tests cover

They compile `useStore`, `pricing`, `brand`, `utils` and the menu data to JS and
assert against the **actual** modules — not reimplementations.

`scripts/test-pricing.js` — 29 tests on `computeTotals()`:

- subtotal and item count across multiple lines
- delivery fee: waived for pick-up, charged below the threshold, waived at
  `freeDeliveryOver`, and **not charged on an empty cart**
- `belowMinimum` and `freeDeliveryRemaining` flags at the boundary values
- SST applied to the *discounted* subtotal, never to the tip
- all three coupon kinds (percent / flat / delivery)
- an over-large flat coupon clamping the total to ≥ 0 instead of going negative
- menu data integrity: positive finite prices, no duplicate slugs

`scripts/test-hydration.js` — 47 tests in three parts:

1. **No localStorage, no persist.** With a full returning-visitor cart already
   sitting in a `localStorage` shim, the store must still start empty — that is
   what keeps the first client render identical to the server's.
2. **`applyRemoteState` validation.** Bogus `orderType`, absurd/negative/NaN tip
   and loyalty values, malformed cart lines, `qty` clamping, and a retired coupon
   code that must not be resurrected from an old database row.
3. **Server-authoritative pricing.** A coupon below its `minSpend` is rejected
   and explained, an invented code is ignored, lookup is case-insensitive,
   loyalty matches the client formula exactly, and negative inputs cannot
   produce a negative charge.

Both scripts install a resolver hook for the `@/` path alias so the compiled
modules load outside a bundler.

---

## Renaming the brand

Everything brand-specific lives in **one file**: `src/config/brand.ts`.

Change `name`, `tagline`, colours in `src/app/globals.css` (`@theme` block),
and swap `src/components/brand/Logo.tsx` if you want a different mark.
The logo is inline SVG, so it recolours automatically — no image assets to
regenerate.

---

## Design system — type & rhythm

All typography runs off a single canonical scale defined in
`src/app/globals.css`. **Do not add ad-hoc `text-[clamp(...)]` or
`leading-[...]` values to headings** — use these classes instead.

| Class | Use | Size | Line-height |
|---|---|---|---|
| `t-hero` | Home hero only | `clamp(3rem, 9.5vw, 6.6rem)` | 0.86 |
| `t-page` | Page hero `<h1>` | `clamp(2.3rem, 5.8vw, 4rem)` | 0.90 |
| `t-section` | Top-level page section `<h2>` | `clamp(1.85rem, 4.2vw, 2.85rem)` | 0.95 |
| `t-section-sm` | Panel / card-level `<h2>` | `clamp(1.5rem, 2.9vw, 2rem)` | 1.00 |
| `t-sub` | `<h3>` subsections, card titles | `clamp(1.28rem, 2.3vw, 1.58rem)` | 1.06 |
| `t-card` | `<h4>`, small card titles | `1.1rem` | 1.15 |
| `t-eyebrow` | Kicker / label above a heading | `11px`, `0.26em` tracking | 1.20 |

Body copy: `t-lead` (15.5/1.6), `t-body` (14/1.6), `t-small` (13/1.55),
`t-meta` (12/1.5), `t-article` (16/1.7). Long-form containers use
`prose-blaze` for paragraph rhythm and `u-measure` for a 62ch reading width.

Vertical rhythm: `section-y` is the standard section padding
(48px → 64px → 72px across breakpoints). Prefer it over raw `py-*`.

These classes are defined **unlayered**, so they always win over leftover
Tailwind size utilities — a safety net while migrating.

### Heading hierarchy rule

Every page has exactly one `<h1>` and never skips a level. Card grids that
sit directly under an `<h1>` get a visually-hidden group heading:

```tsx
<h2 className="sr-only">Our branches</h2>
```

This keeps the document outline correct for screen readers and SEO without
adding visible chrome.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` config) |
| Animation | Framer Motion v12 |
| Client state | Zustand (in-memory only — no `persist`, no localStorage) |
| Database | Supabase (Postgres) via `@supabase/supabase-js`, server-side only |
| API | Next.js Route Handlers under `/api/*`, service-role key |
| Icons | lucide-react + custom inline SVG social marks |
| Fonts | Bebas Neue (display) + Plus Jakarta Sans (body) via `next/font` |
| Tests | 76 assertions via `tsc` + plain Node scripts (no test framework needed) |

---

## Routes

| Route | What it is |
|---|---|
| `/` | Home — hero carousel, category rail, best sellers, deals, story, midnight drop, testimonials, rewards, locations |
| `/menu` | Full menu browser — search, category filter, sort, veg filter, allergen info, item configurator |
| `/deals` | All live offers with terms and time windows |
| `/locations` | Branch finder — city/feature filters, stylised maps |
| `/cart` | "Your bucket" — line editing, upsells, coupon, tip, summary |
| `/checkout` | 3-step checkout — details → fulfilment → payment |
| `/track` | Live order tracking with ETA countdown and timeline |
| `/about` | Brand story, values, timeline |
| `/contact` | Contact channels, form, FAQs |
| `/blog`, `/blog/[slug]` | Journal with reading progress |
| `/franchise` | Franchise pitch, investment breakdown, ROI calculator, enquiry |
| `/careers` | Open roles, perks, application form |
| `/catering` | Catering packages and quote enquiry |
| `/feedback` | Star-rating feedback form |
| `/legal` | Terms, privacy, refunds, allergen policy |
| `/admin` | **POS console** — dashboard, orders, inventory, branches, reports |

---

## Ordering flow

1. **Order type** — Delivery / Pick-Up / Catering (header control or the
   onboarding modal on first visit).
2. **Location** — city + branch picker with "use current location"
   (geolocation → nearest branch by haversine distance).
3. **Menu** — category rail, search, sort, dietary filters.
4. **Item configurator** — sizes, required option groups, add-ons, kitchen
   note. Price recomputes live.
5. **Bucket** — quantity editing, upsell rail, promo codes, rider tip,
   free-delivery progress meter.
6. **Checkout** — validated 3-step wizard; payment via COD / card /
   JazzCash / EasyPaisa / bank transfer (simulated).
7. **Tracking** — live status chain with countdown, timeline, reorder.

### Promo codes

`BLAZE20` (20% off, min Rs 800) · `FREERIDE` (free delivery, min Rs 1,200) ·
`BUN250` (Rs 250 off, min Rs 1,500) · `STUDENT` (20% off, no minimum)

---

## Data & state — Supabase, not localStorage

Nothing is written to `localStorage`. Durable state lives in **Supabase
(Postgres)**, and the browser only ever talks to same-origin `/api/*` route
handlers. No Supabase key reaches the client.

```
Browser ──► /api/*  (Route Handlers, server)  ──► Supabase
              │        service-role key
              │        authorisation enforced here
              └── guest identity via httpOnly `bb_guest` cookie
```

### Why this shape

`src/lib/db.ts` imports `server-only`, so if any client component ever imports
it the **build fails**. That is the guardrail keeping the service-role key —
which bypasses Row Level Security — off the client. RLS is enabled on every
table with **no** `anon`/`authenticated` policies, so direct PostgREST access
from a browser is denied outright.

Guest identity is a random UUID in an httpOnly `bb_guest` cookie
(`src/lib/guest-token.ts`). It scopes a guest's cart and order history without
an account, and being httpOnly it cannot be read or forged by injected page
scripts. Admin endpoints require a separate `ADMIN_TOKEN` secret, compared with
a constant-time loop.

### The hydration contract (do not break this)

The store is **plain in-memory zustand** — there is no `persist` middleware.
This is load-bearing:

1. Store is created with initial state. Nothing reads `localStorage`, and
   nothing reads the network synchronously.
2. Server renders initial state. The client's first render is identical, so
   hydration always matches.
3. `AppProviders`' `useEffect` calls `GET /api/state` **after** mount.
4. `applyRemoteState()` validates the payload and applies it, triggering a
   second render with the real cart, orders and loyalty points.
5. Store changes are debounced (700 ms) and pushed with `PUT /api/state`.

Step 3 is what removes the whole class of persisted-store hydration mismatches:
async-after-mount data can never disagree with the server's HTML, because the
server never renders it.

`applyRemoteState()` validates every field before it lands in the store — a
corrupt or hand-edited database row cannot put the cart into an impossible
shape, resurrect a retired coupon code, or set a negative tip.

### Pricing is server-authoritative

`src/lib/pricing.ts` is a React-free module imported by **both** the client
store and the API routes, so there is exactly one set of numbers.

`POST /api/orders` does not trust the client's arithmetic. It re-prices every
line against `src/data/menu.ts` (base price, size delta, option deltas, add-on
prices), recomputes delivery/tax/total from `src/config/brand.ts`, and
**enforces the coupon's `minSpend`** — so a tampered request cannot apply
`BLAZE20` to a Rs 300 basket. A coupon that no longer qualifies is dropped and
reported back via `couponRejected`, and the customer is charged correctly and
told why.

### Cloud mode vs local fallback

`GET /api/health` reports whether the database is configured. Until the env
vars are set, every `/api/*` route returns **503 with an actionable message**,
and the storefront runs in-memory: ordering, tracking and the POS all work,
nothing is durable, and forms say so instead of pretending to have saved.
Nothing fails silently.

### Setting it up (about five minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Dashboard → SQL Editor → paste and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in:
   ```bash
   SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=…   # Project Settings → API → service_role
   ADMIN_TOKEN=…                 # openssl rand -hex 32
   ```
4. Restart the dev server. `/api/health` should report `"status":"cloud"`.
5. Open `/admin` → the cloud panel appears → paste `ADMIN_TOKEN` → Connect.

### Tables

| Table | Purpose |
|---|---|
| `orders` | Order header: customer, address, totals, status, branch |
| `order_items` | Normalised lines — options/add-ons as JSONB so the menu can evolve without a migration |
| `guest_state` | The cart blob, keyed by guest token. Replaces localStorage |
| `enquiries` | Contact / franchise / careers / catering, split by `kind`, extras in `payload` |
| `feedback` | Star ratings, aspects, comment, would-recommend |
| `newsletter` | Email capture, unique per address |
| `inventory` | POS stock state per menu slug |

Plus a `daily_revenue` view for reporting at scale.

### API surface

| Endpoint | Methods | Auth |
|---|---|---|
| `/api/health` | GET | public |
| `/api/state` | GET, PUT, DELETE | guest cookie |
| `/api/orders` | POST, GET | guest cookie (GET returns all with admin token) |
| `/api/orders/[number]` | GET, PATCH | guest must own it; PATCH is admin-only |
| `/api/enquiries` | POST | public (validated + size-capped) |
| `/api/feedback` | POST | public (validated) |
| `/api/newsletter` | POST | public (idempotent upsert) |
| `/api/admin/summary` | GET | `ADMIN_TOKEN` |
| `/api/admin/inventory` | GET, PATCH | `ADMIN_TOKEN` |

`robots.txt` disallows `/api/`, `/admin`, `/cart`, `/checkout` and `/track`.

### Development caching

`next.config.ts` sends `Cache-Control: no-store` for every path in development
only. Without it a stale HTML document or chunk produces "hydration failed"
errors that no longer match the source on disk, which sends you debugging a bug
that does not exist. Production keeps Next's default immutable caching for
hashed assets.

### Other hydration rules already applied

- `<body suppressHydrationWarning>` — browser extensions (Grammarly and
  similar) inject attributes into `<body>` before React hydrates. Scoped to
  that element only, so nested mismatches still surface.
- `<html data-scroll-behavior="smooth">` — required by Next when
  `scroll-behavior: smooth` is set in CSS.
- No `typeof window` branching anywhere.
- No render-time `Date.now()` / `Math.random()`. The midnight-drop clock starts
  as `null` and is populated in `useEffect`, so server and first client render
  both show `--:--`.
- All date formatting pins `en-PK` explicitly, so server and client agree.

---

## Imagery

- **Photography** (`public/media/hero`, `/story`, `/items`) — AI-generated
  brand photography, encoded as progressive JPEG (max 2000px wide, q78–82).
  Total media weight: **1.9 MB** across 15 files. Next's optimizer serves
  these as WebP at ~75–130 KB to browsers.
- **Page heroes** — every interior page carries a full-bleed fast-food
  photograph graded with a charcoal wash so the left-hand copy column stays
  legible, and faded into the page background at the bottom. Pass `image`,
  `focus` (`left|right|center`) and `tone` (`deep|soft`) to `PageHero`.
  `/admin` is deliberately image-free — it is an internal console.
- **Generative art** — items without a photo render `FoodGlyph`, a flat-vector
  SVG illustration tinted by that item's hue, composited over a duotone
  backdrop. Drop a file into `public/media/items/` and set `image` on the menu
  entry to upgrade any tile to photography — `MediaFrame` handles the swap and
  falls back gracefully if the asset is missing.

If you regenerate or add photography, keep sources under ~2000px wide and
re-encode to JPEG; do not commit multi-megabyte PNGs.

---

## POS console

`/admin` has two layers, and the UI is explicit about which one you are looking
at.

**Cloud panel (`CloudConnect`)** — the real thing. It appears above every view
and has three states:

- *Not configured* → explains exactly which env vars to set and which SQL to run.
- *Configured, not authenticated* → asks for `ADMIN_TOKEN`.
- *Connected* → live KPIs, real orders from the database with working **Advance**
  buttons, top sellers, revenue-by-day bars, and stock toggles that write
  straight to the `inventory` table. The reporting window is switchable across
  1/7/14/30/90 days.

An order placed on the storefront appears here immediately; advancing its status
here moves the customer's `/track` page within 15 seconds (it polls).

**Demo panels** — deterministic `seededRandom` data so the console is still
worth looking at before a database exists: hourly volume heatmap, branch
performance, payment and fulfilment mixes, low-stock alerts.

### Remaining roadmap

1. **Auth + roles** — replace the single `ADMIN_TOKEN` with Supabase Auth and
   per-role policies (counter staff, branch manager, head office). Add a
   `customer_uuid` column to `orders` so logged-in customers can read their own
   history directly under RLS.
2. **Kitchen display (KDS)** and receipt printing views.
3. **Real payments** — JazzCash / EasyPaisa / Stripe, with settlement
   reconciliation in Reports. Payment is currently simulated at checkout.
4. **Realtime** — Supabase Realtime channels would replace the 15-second polling
   on `/track` and in the POS live feed.
5. **Move aggregation into SQL** — `/api/admin/summary` aggregates in JS over up
   to 2,000 rows. Fine at launch volume; switch to the `daily_revenue` view or a
   Postgres RPC as order volume grows.

---

## Project layout

```
supabase/schema.sql       ← run this once in the Supabase SQL editor
scripts/
  test-pricing.js         29 tests on the pricing engine
  test-hydration.js       47 tests on SSR safety + server-authoritative pricing
tsconfig.test.json        compiles the modules under test to .tmp-test/

src/
  app/
    api/                  route handlers — the ONLY code that touches Supabase
      health/             reports whether cloud storage is configured
      state/              guest cart blob (GET / PUT / DELETE)
      orders/             create + list; [number]/ read one + admin status PATCH
      enquiries/          contact, franchise, careers, catering
      feedback/           star ratings
      newsletter/         email capture
      admin/              summary KPIs + inventory (ADMIN_TOKEN)
    (pages)/              the 17 storefront and console routes
  components/
    admin/                POS console + CloudConnect (live Supabase panel)
    blog/                 reading progress
    brand/                logo + social SVG marks
    forms/                contact, enquiry, feedback forms
    franchise/            ROI calculator
    home/                 homepage sections
    layout/               header, footer, cart drawer, order-type modal, providers
    menu/                 item card, configurator, menu browser
    orders/               tracking board (polls the cloud for live status)
    seo/                  JSON-LD
    ui/                   design primitives
  config/brand.ts         ← rename the whole site here
  data/                   menu, deals, branches, blog, content
  lib/
    db.ts                 server-only Supabase client (service-role key)
    guest-token.ts        httpOnly guest cookie
    api.ts                route-handler response + admin-auth helpers
    pricing.ts            shared client/server pricing — single source of truth
    cloud.ts              browser-side /api client
    useCloudSubmit.ts     shared form submit plumbing
    utils.ts              formatting, validation, helpers
  store/useStore.ts       in-memory app + order state (cloud-synced)
```

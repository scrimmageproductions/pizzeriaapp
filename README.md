# DeepDish

The "Anti-Aggregator" for pizzerias — a dual-sided SaaS prototype built on three pillars:
**0% per-order commissions** (flat $99/month), **100% white-labeled storefronts**, and
**total ownership of customer data**. An onboarding wizard turns a paper menu and a logo into
a live, fully-branded ordering site in under a minute, backed by an owner dashboard that makes
the commission savings and data ownership tangible from day one.

## Stack

- **React 19** + **Vite** + **React Router DOM**
- **Tailwind CSS v4** — Tomato Red (`#E31837`) + Charcoal (`#121212`) DeepDish platform palette;
  generated pizzeria sites pick their own accent color and typography independently
- **Framer Motion** for the onboarding transitions and confetti
- **Lucide React** for icons
- State lives in a single React Context + reducer (`src/context/ShopContext.jsx`) — shop
  profile, menu, orders, and CRM customers — synced to `localStorage` on every change.

## Running locally

```bash
npm install
npm run dev
```

## Routes

- `/` — marketing landing page ("Keep your dough.")
- `/onboarding` — the 4-step "Claim Shop → Branding → Menu Scan → Launch" wizard
- `/admin` — the owner dashboard (Overview, Live Order KDS, Menu & Brand, Customer CRM,
  Automated Marketing); redirects to `/onboarding` if no shop exists yet
- `/:slug` — the 100% white-labeled public ordering site for that shop (no DeepDish branding
  anywhere a customer can see)

## The onboarding "magic moment"

1. **Claim Your Shop** — type a name, watch `deepdish.store/your-slug` generate live.
2. **Smart Branding** — drop in a logo; a real canvas-based color sampler (not a mock) picks
   the dominant color from the image and sets it as the brand color.
3. **Paper to Digital** — drop a photo of a paper menu (or skip); a mock 3-second "scan"
   populates 5 realistic items across Pizzas/Sides directly into the shared menu state.
4. **Launch My Store 🚀** — fires a confetti burst, creates the shop (pre-seeded with 5 CRM
   customers, 2 in-flight KDS orders, and a sales baseline), opens the new public site in a new
   tab, and drops the owner into a fully-populated `/admin`.

## Building the moat (`/admin`)

- **Overview** — Total Sales, Active Orders, and a highlighted "Commission Saved this Month"
  card (15% of total sales) alongside the three pillars.
- **Live Order KDS** — a 3-column Kanban board (Received / Prepping / Ready). Orders auto-accept
  and cook themselves off the shop's prep time; nobody clicks through statuses by hand.
- **Menu & Brand** — item CRUD, brand color, storefront typography, hours, prep time, and an
  accepting-orders toggle, all on one page.
- **Customer CRM** — every customer who's ordered (name/email/phone/orders/lifetime value),
  with a one-click CSV export to prove the data is actually theirs.
- **Automated Marketing** — toggles for a 30-day win-back SMS and an abandoned-cart SMS, with a
  mock "recovered sales" metric.

## The customer loop (`/:slug`)

Menu → cart (subtotal + 8% tax) → checkout (name, email, phone, and a mock card — required so
every order feeds the CRM) → a live 4-stage tracker (Received → Prepping → Baking → Ready) that
updates in real time as the same order progresses on the owner's KDS. Placing an order
immediately appears on the admin's Live Order KDS and upserts a CRM record — both sides read
the same shared, persisted state.

# DeepDish

The "Anti-Aggregator" for pizzerias — a dual-sided SaaS prototype built on three pillars:
**0% per-order commissions** (flat $99/month), **100% white-labeled storefronts**, and
**total ownership of customer data**. An onboarding wizard turns a paper menu and a logo into
a live, fully-branded ordering site in under a minute, backed by an owner dashboard that makes
the commission savings and data ownership tangible from day one.

DeepDish has grown from an online-ordering site into a full omni-channel restaurant operating
system: online storefront, a browser-based tablet POS for walk-in/phone orders, and a live
delivery dispatch map — all reading and writing the same shared state.

## Stack

- **React 19** + **Vite** + **React Router DOM**
- **Tailwind CSS v4** — Tomato Red (`#E31837`) + Charcoal (`#121212`) DeepDish platform palette;
  generated pizzeria sites pick their own accent color and typography independently
- **Framer Motion** for the onboarding transitions and confetti
- **Lucide React** for icons
- **Leaflet** + **React Leaflet** — free OpenStreetMap rendering for the Delivery Dispatch map,
  no API keys required
- **qrcode.react** — generates the "Scan & Pay" QR codes for hardware-free POS checkout
- State lives in a single React Context + reducer (`src/context/ShopContext.jsx`) — shop
  profile, menu, orders, and CRM customers — synced to `localStorage` on every change, with a
  cross-tab `storage`-event listener so two open tabs (e.g. a POS tablet and a customer's phone)
  stay in sync live, without a refresh.

## Running locally

```bash
npm install
npm run dev
```

## Routes

- `/` — marketing landing page ("Keep your dough.")
- `/onboarding` — the 4-step "Claim Shop → Branding → Menu Scan → Launch" wizard
- `/admin` — the owner dashboard (Overview, Live Order KDS, Tablet POS, Delivery Dispatch,
  Menu & Brand, Customer CRM, Automated Marketing); redirects to `/onboarding` if no shop
  exists yet
- `/admin/pos` — full-screen kiosk-mode Tablet POS (deliberately outside the dashboard sidebar
  for speed on a tablet)
- `/pay/:orderId` — the "Scan & Pay" payment page a customer's phone lands on after scanning a
  POS QR code
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

## Tablet POS (`/admin/pos`)

A full-screen, kiosk-mode point-of-sale designed for a touchscreen tablet at the front counter —
zero loading spinners, large tap targets, classic split-screen layout (70% menu grid / 30%
ticket). Toggle **Walk-in** vs **Phone Order** at the top of the ticket; a phone order requires a
customer name + phone, which upserts straight into the CRM. Tapping **Charge** opens a
zero-hardware payment modal with two options:

- **Cash** — a live change-due calculator with quick-amount buttons.
- **Scan & Pay** — generates a QR code pointing at `/pay/:orderId`; the customer scans it with
  their own phone to pay with Apple Pay / Google Pay. The POS tab watches for payment
  confirmation and updates live via the cross-tab `storage` sync — no polling, no refresh — with
  a manual "Confirm Manually" fallback for the cashier.

Once paid, the order is injected into the Live Order KDS exactly like an online order.

## Delivery Dispatch (`/admin/delivery`)

A live Leaflet/OpenStreetMap view of the shop (center pin) plus every order that's
`fulfillment: "delivery"` and has hit the "Ready" stage. Clicking a ticket in the queue flies the
map to that order's (mock-geocoded) destination pin. Each ready ticket has an "Assign to…"
driver dropdown; picking a driver moves the order into "Out for Delivery," stamps a
`dispatchedAt` time, and immediately updates the customer's Pizza Tracker (`Mike R. is on the
way!`) via the same cross-tab state sync.

## The customer loop (`/:slug`)

Menu → cart (subtotal + 8% tax) → checkout (name, email, phone, and a mock card — required so
every order feeds the CRM) → a live 4-stage tracker (Received → Prepping → Baking → Ready) that
updates in real time as the same order progresses on the owner's KDS. Placing an order
immediately appears on the admin's Live Order KDS and upserts a CRM record — both sides read
the same shared, persisted state. Delivery orders get a 4th real-world state — the tracker's
final step reads "Out for Delivery" (with the assigned driver's name) once dispatched from the
Delivery Dispatch page.

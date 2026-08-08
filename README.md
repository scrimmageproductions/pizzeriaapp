# PizzaPlug

A dual-sided SaaS prototype for local pizzerias: a frictionless onboarding wizard that turns a
paper menu and a logo into a live, branded ordering website in under a minute, plus the owner
dashboard and customer storefront that come with it.

## Stack

- **React 19** + **Vite** + **React Router DOM**
- **Tailwind CSS v4**
- **Framer Motion** for the onboarding transitions and confetti
- **Lucide React** for icons
- State lives in a single React Context + reducer (`src/context/ShopContext.jsx`), synced to
  `localStorage` on every change — refreshing the page never loses data.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL.

## Routes

- `/` — marketing landing page
- `/onboarding` — the 4-step "Claim Shop → Branding → Menu Scan → Launch" wizard
- `/admin` — the owner dashboard (Overview, Menu Manager, Store Settings, Order KDS); redirects
  to `/onboarding` if no shop has been created yet
- `/:slug` — the public, customer-facing ordering site for that shop

## The onboarding "magic moment"

1. **Claim Your Shop** — type a name, watch `pizzaplug.com/your-slug` generate live.
2. **Smart Branding** — drop in a logo; a real canvas-based color sampler (not a mock) picks
   the dominant color from the image and sets it as the brand color.
3. **Paper to Digital** — drop a photo of a paper menu (or skip); a mock 3-second "scan"
   populates 5 realistic items across Pizzas/Sides directly into the shared menu state.
4. **Launch My App 🚀** — fires a confetti burst, creates the shop, opens the new public site
   in a new tab, and drops the owner into `/admin`.

## Automated Order KDS

Orders auto-accept and cook themselves off the shop's configured prep time — nobody clicks
through "accepted → cooking → ready" by hand. The Kitchen Display System is a live 3-column
Kanban board (Order Received / Prepping / Ready); the only manual action is completing an
order once it's picked up or handed to a driver. Placing an order on the public storefront
appears on the KDS instantly, and the customer's tracker reflects admin-side changes live —
both read the same shared, persisted state.

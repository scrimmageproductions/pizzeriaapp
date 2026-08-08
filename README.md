# PizzaPlug

A multi-tenant SaaS prototype that lets pizzeria owners generate, customize, and manage a
digital storefront, while giving their customers a seamless ordering and live-tracking
experience — all in a single React app.

## Stack

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **Lucide React** for icons
- Multi-tenant state simulated with a single React Context + reducer (`src/context/AppContext.jsx`)

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL. The app boots directly into the **Admin Command Center**,
pre-populated with a sample pizzeria ("Luigi's Pizza"), a full menu, two coupons, and two
active orders already in flight.

## What's inside

- **Admin dashboard** (`src/components/admin`) — shop profile & logistics, brand/design
  (logo, colors, font), a menu builder with a simulated AI paper-menu scanner, deals &
  coupons, mocked Google Reviews / Sheets integrations, and a live Kanban-style Kitchen
  Display System for managing orders in real time.
- **Customer storefront** (`src/components/storefront`) — a mobile-first menu, cart drawer
  with promo codes and pickup/delivery selection, and a live 4-stage order tracker.
- Click **Preview Storefront** (bottom of the admin sidebar) to jump to the customer view.
  Both views stay mounted, so placing an order and switching back to Admin to advance its
  status (Accept → In the Oven → Ready → Completed) is reflected instantly back on the
  customer's tracker.

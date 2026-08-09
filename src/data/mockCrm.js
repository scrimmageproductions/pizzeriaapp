// Seed CRM + KDS data so a freshly-onboarded shop feels like a real, running business —
// this is the data DeepDish hands the owner outright (the "data sovereignty" pillar), not a
// sample the platform holds hostage.
import { jitterLatLng, uid } from "../utils/helpers";

export const MOCK_CUSTOMERS = [
  { name: "Maria Gonzalez", email: "maria.g@example.com", phone: "(555) 201-4471", totalOrders: 12, lifetimeValue: 342.5, accountStatus: "registered", points: 380 },
  { name: "James Whitfield", email: "j.whitfield@example.com", phone: "(555) 887-2039", totalOrders: 7, lifetimeValue: 198.75, accountStatus: "registered", points: 210 },
  { name: "Priya Natarajan", email: "priya.n@example.com", phone: "(555) 340-9982", totalOrders: 21, lifetimeValue: 611.2, accountStatus: "registered", points: 640 },
  { name: "Tommy Alessi", email: "tommy.alessi@example.com", phone: "(555) 118-6654", totalOrders: 3, lifetimeValue: 74.85, accountStatus: "guest", points: 0 },
  { name: "Kayla Brooks", email: "kayla.brooks@example.com", phone: "(555) 552-7710", totalOrders: 9, lifetimeValue: 256.4, accountStatus: "registered", points: 290 },
];

export function buildMockCustomers() {
  return MOCK_CUSTOMERS.map((c) => ({ id: uid("cust"), ...c, lastOrderAt: Date.now() - Math.random() * 20 * 86400000 }));
}

/** A couple of intercepted low-star complaints already sitting in the Reputation inbox on day one. */
export function buildSeedFeedback() {
  const now = Date.now();
  return [
    {
      id: uid("fb"),
      orderId: "DD-2214",
      customerName: "Derek Simmons",
      rating: 2,
      comment: "Pizza showed up lukewarm and the order was missing a side of garlic knots.",
      createdAt: now - 2 * 86400000,
      resolved: false,
    },
    {
      id: uid("fb"),
      orderId: "DD-2198",
      customerName: "Ana Reyes",
      rating: 3,
      comment: "Good flavor but the crust was way too thin and undercooked in the middle.",
      createdAt: now - 4 * 86400000,
      resolved: false,
    },
    {
      id: uid("fb"),
      orderId: "DD-2151",
      customerName: "Owen Park",
      rating: 1,
      comment: "Waited 45 minutes past the quoted pickup time with no update from the counter.",
      createdAt: now - 6 * 86400000,
      resolved: true,
    },
  ];
}

/**
 * Two orders already on the board the moment a shop launches: one delivery order already
 * "Ready" (so the Delivery Dispatch map has an immediate pin to show), one pickup order still
 * mid-cook (so the KDS demonstrates its live countdown too).
 */
export function buildSeedOrders({ prepMinutes, items, shop }) {
  if (items.length === 0) return []; // no menu yet (scan step was skipped) — nothing to seed an order with

  const now = Date.now();
  const pick = (i) => items[i % items.length];
  const deliveryDestination = jitterLatLng(shop.lat, shop.lng);

  return [
    {
      id: `DD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Maria Gonzalez",
      customerEmail: "maria.g@example.com",
      customerPhone: "(555) 201-4471",
      fulfillment: "delivery",
      address: "412 Willow Ave",
      items: [{ itemId: pick(0).id, name: pick(0).name, qty: 1, price: pick(0).price }],
      total: pick(0).price * 1.08,
      createdAt: now - (prepMinutes + 5) * 60000, // already past ready — populates the dispatch queue instantly
      prepMinutes,
      completedAt: null,
      source: "online",
      paymentMethod: "card",
      paidAt: now - (prepMinutes + 5) * 60000,
      assignedDriver: null,
      dispatchedAt: null,
      lat: deliveryDestination.lat,
      lng: deliveryDestination.lng,
    },
    {
      id: `DD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "James Whitfield",
      customerEmail: "j.whitfield@example.com",
      customerPhone: "(555) 887-2039",
      fulfillment: "pickup",
      address: null,
      items: [
        { itemId: pick(1).id, name: pick(1).name, qty: 2, price: pick(1).price },
        { itemId: pick(3).id, name: pick(3).name, qty: 1, price: pick(3).price },
      ],
      total: (pick(1).price * 2 + pick(3).price) * 1.08,
      createdAt: now - Math.min(4, prepMinutes - 1) * 60000, // well into prep
      prepMinutes,
      completedAt: null,
      source: "online",
      paymentMethod: "card",
      paidAt: now - Math.min(4, prepMinutes - 1) * 60000,
      assignedDriver: null,
      dispatchedAt: null,
      lat: null,
      lng: null,
    },
  ];
}

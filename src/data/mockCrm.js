// Seed CRM + KDS data so a freshly-onboarded shop feels like a real, running business —
// this is the data DeepDish hands the owner outright (the "data sovereignty" pillar), not a
// sample the platform holds hostage.
import { jitterLatLng, uid } from "../utils/helpers";

export const MOCK_CUSTOMERS = [
  {
    name: "Maria Gonzalez",
    email: "maria.g@example.com",
    phone: "(555) 201-4471",
    totalOrders: 12,
    lifetimeValue: 342.5,
    loyaltyPoints: 150,
    accountType: "registered",
  },
  {
    name: "James Whitfield",
    email: "j.whitfield@example.com",
    phone: "(555) 887-2039",
    totalOrders: 7,
    lifetimeValue: 198.75,
    loyaltyPoints: 85,
    accountType: "guest",
  },
  {
    name: "Priya Natarajan",
    email: "priya.n@example.com",
    phone: "(555) 340-9982",
    totalOrders: 21,
    lifetimeValue: 611.2,
    loyaltyPoints: 520,
    accountType: "registered",
  },
  {
    name: "Tommy Alessi",
    email: "tommy.alessi@example.com",
    phone: "(555) 118-6654",
    totalOrders: 3,
    lifetimeValue: 74.85,
    loyaltyPoints: 30,
    accountType: "guest",
  },
  {
    name: "Kayla Brooks",
    email: "kayla.brooks@example.com",
    phone: "(555) 552-7710",
    totalOrders: 9,
    lifetimeValue: 256.4,
    loyaltyPoints: 110,
    accountType: "guest",
  },
];

export function buildMockCustomers() {
  return MOCK_CUSTOMERS.map((c) => ({ id: uid("cust"), lastAddress: null, ...c, lastOrderAt: Date.now() - Math.random() * 20 * 86400000 }));
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
      thirdPartySource: null,
      assignedDriver: null,
      assignedDriverId: null,
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
      thirdPartySource: null,
      assignedDriver: null,
      assignedDriverId: null,
      dispatchedAt: null,
      lat: null,
      lng: null,
    },
  ];
}

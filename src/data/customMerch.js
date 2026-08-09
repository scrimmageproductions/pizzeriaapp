// Custom-branded merchandise catalog for the Brand Studio — every product overlays the owner's
// own logo + primary color onto a CSS-mocked product template, so the upsell feels tailor-made.
export const CUSTOM_MERCH_PRODUCTS = [
  {
    id: "custom-pizza-box",
    name: "The Classic Pizza Box (Case of 250)",
    mockup: "pizza-box",
    tiers: [
      { minQty: 1, label: "1 Case", price: 120.0 },
      { minQty: 5, label: "5 Cases", price: 100.0 },
    ],
  },
  {
    id: "custom-paper-bags",
    name: "Quad City Style Paper Pizza Bags (Case of 500)",
    mockup: "paper-bag",
    tiers: [
      { minQty: 1, label: "1 Case", price: 85.0 },
      { minQty: 5, label: "5 Cases", price: 70.0 },
    ],
  },
  {
    id: "custom-visors",
    name: "Staff Visors (Pack of 5)",
    mockup: "visor",
    tiers: [
      { minQty: 1, label: "1 Pack", price: 45.0 },
      { minQty: 5, label: "5 Packs", price: 38.0 },
    ],
  },
  {
    id: "custom-hot-bag",
    name: "Delivery Hot Bag",
    mockup: "hot-bag",
    tiers: [
      { minQty: 1, label: "1 Bag", price: 55.0 },
      { minQty: 5, label: "5 Bags", price: 47.0 },
    ],
  },
];

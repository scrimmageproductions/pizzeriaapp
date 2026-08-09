// Mock catalog for the internal Merchant Supply Store — hardware & consumables an owner can
// order without leaving the DeepDish dashboard.
export const SUPPLY_PRODUCTS = [
  {
    id: "qr-table-tents",
    name: "Custom QR Table Tents (Pack of 10)",
    price: 25.0,
    description: "Acrylic table markers. We auto-print your custom QR codes so customers can order from their table.",
    icon: "QrCode",
  },
  {
    id: "delivery-bag",
    name: "DeepDish Insulated Delivery Bag",
    price: 45.0,
    description: "Keeps pizzas piping hot for up to 45 minutes. Waterproof and highly durable.",
    icon: "ShoppingBag",
  },
  {
    id: "bt-printer",
    name: "Bluetooth Thermal Receipt Printer",
    price: 199.0,
    description: "Pre-configured to sync instantly with your DeepDish POS. Just plug it in.",
    icon: "Printer",
  },
  {
    id: "printer-paper",
    name: "Thermal Printer Paper (50 Rolls)",
    price: 39.0,
    description: "Fits every standard 80mm thermal printer, including the DeepDish Bluetooth printer.",
    icon: "Receipt",
    subscribable: true,
  },
];

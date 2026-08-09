// Mock third-party marketplace integration — stands in for real DoorDash/UberEats/Grubhub order
// webhooks so the KDS source-badging and Box Topper conversion flow can be demoed live.
export const THIRD_PARTY_META = {
  doordash: { label: "DoorDash", color: "#E31837", bg: "#FDECEC" },
  ubereats: { label: "Uber Eats", color: "#06C167", bg: "#E6F9EF" },
  grubhub: { label: "Grubhub", color: "#F26B21", bg: "#FEEEE3" },
};

const FAKE_CUSTOMERS = ["Alex P.", "Jordan K.", "Taylor S.", "Morgan B.", "Casey L."];

/** A single mock order arriving from a third-party app — always pickup (their own courier collects it). */
export function buildMockThirdPartyOrder(source, items, shop) {
  const item = items[Math.floor(Math.random() * items.length)];
  const qty = 1 + Math.floor(Math.random() * 2);
  const size = item.sizes && item.sizes.length > 0 ? item.sizes[Math.floor(Math.random() * item.sizes.length)] : null;
  const price = size ? size.price : item.price ?? 10;
  const name = size ? `${item.name} (${size.label})` : item.name;
  const total = +(price * qty * 1.08).toFixed(2);

  return {
    id: `DD-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: FAKE_CUSTOMERS[Math.floor(Math.random() * FAKE_CUSTOMERS.length)],
    customerEmail: "",
    customerPhone: "",
    fulfillment: "pickup",
    address: null,
    items: [{ itemId: item.id, name, qty, price }],
    total,
    createdAt: Date.now(),
    prepMinutes: shop.prepMinutes,
    completedAt: null,
    source: "online",
    thirdPartySource: source,
    paymentMethod: "card",
    paidAt: Date.now(),
    assignedDriver: null,
    assignedDriverId: null,
    dispatchedAt: null,
    lat: null,
    lng: null,
  };
}

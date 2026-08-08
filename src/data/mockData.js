// Seed data for the PizzaPlug prototype. In a real product this would live in a database;
// here it hydrates the in-memory multi-tenant "DB" simulated by AppContext.

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const FONT_OPTIONS = [
  { id: "bangers", label: "Bangers (Fun & Bold)", family: "'Bangers', cursive" },
  { id: "fredoka", label: "Fredoka (Friendly & Round)", family: "'Fredoka', sans-serif" },
  { id: "poppins", label: "Poppins (Clean & Modern)", family: "'Poppins', sans-serif" },
];

export const BRAND_COLORS = {
  tomato: "#E31837",
  basil: "#00A651",
  mozzarella: "#F8F9FA",
  crust: "#F39C12",
};

export const initialConfig = {
  name: "Luigi's Pizza",
  tagline: "Wood-fired pies, made with love since 1987",
  location: "412 Mulberry St, Brooklyn, NY 11201",
  phone: "(718) 555-0192",
  hours: {
    open: "11:00",
    close: "22:00",
  },
  prepTimeMinutes: 18,
  deliveryEnabled: true,
  deliveryTransitMinutes: 25,
  logoUrl: "",
  coverUrl: "",
  primaryColor: BRAND_COLORS.tomato,
  secondaryColor: BRAND_COLORS.basil,
  font: "bangers",
  googleMapsUrl: "https://maps.google.com/?cid=luigis-pizza-brooklyn",
  googleReviewsSynced: true,
  googleReviewRating: 4.8,
  googleReviewCount: 312,
  googleSheetsSyncEnabled: false,
};

export const initialCategories = [
  { id: "cat_pizzas", name: "Pizzas", icon: "Pizza" },
  { id: "cat_sides", name: "Sides", icon: "Salad" },
  { id: "cat_drinks", name: "Drinks", icon: "CupSoda" },
  { id: "cat_desserts", name: "Desserts", icon: "IceCreamCone" },
];

export const initialItems = [
  {
    id: "item_margherita",
    categoryId: "cat_pizzas",
    name: "Classic Margherita",
    description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.",
    price: 16.5,
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80&auto=format&fit=crop",
    popular: true,
  },
  {
    id: "item_pepperoni",
    categoryId: "cat_pizzas",
    name: "Pepperoni Classic",
    description: "Double pepperoni, house mozzarella blend, oregano.",
    price: 18.0,
    imageUrl:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80&auto=format&fit=crop",
    popular: true,
  },
  {
    id: "item_veggie",
    categoryId: "cat_pizzas",
    name: "Garden Veggie",
    description: "Bell peppers, red onion, mushroom, black olives, mozzarella.",
    price: 17.5,
    imageUrl:
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
  {
    id: "item_bbqchicken",
    categoryId: "cat_pizzas",
    name: "BBQ Chicken",
    description: "Smoked chicken, tangy BBQ sauce, red onion, cilantro.",
    price: 19.5,
    imageUrl:
      "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
  {
    id: "item_meatlovers",
    categoryId: "cat_pizzas",
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, mozzarella blend.",
    price: 20.5,
    imageUrl:
      "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600&q=80&auto=format&fit=crop",
    popular: true,
  },
  {
    id: "item_garlicknots",
    categoryId: "cat_sides",
    name: "Garlic Knots (6)",
    description: "Hand-tossed knots brushed with garlic butter & parmesan.",
    price: 6.5,
    imageUrl:
      "https://images.unsplash.com/photo-1619535212707-3a5b6b6d5db3?w=600&q=80&auto=format&fit=crop",
    popular: true,
  },
  {
    id: "item_caesar",
    categoryId: "cat_sides",
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, house caesar dressing.",
    price: 8.5,
    imageUrl:
      "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
  {
    id: "item_mozzsticks",
    categoryId: "cat_sides",
    name: "Mozzarella Sticks (8)",
    description: "Golden fried, served with marinara.",
    price: 7.5,
    imageUrl:
      "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
  {
    id: "item_coke",
    categoryId: "cat_drinks",
    name: "Coca-Cola (2L)",
    description: "Ice cold, family size.",
    price: 3.5,
    imageUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
  {
    id: "item_sanpellegrino",
    categoryId: "cat_drinks",
    name: "San Pellegrino",
    description: "Sparkling mineral water, 500ml.",
    price: 3.0,
    imageUrl:
      "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
  {
    id: "item_tiramisu",
    categoryId: "cat_desserts",
    name: "Tiramisu",
    description: "Classic Italian espresso-soaked layered dessert.",
    price: 7.0,
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80&auto=format&fit=crop",
    popular: true,
  },
  {
    id: "item_cannoli",
    categoryId: "cat_desserts",
    name: "Cannoli (2)",
    description: "Crisp shells, sweet ricotta filling, pistachio dust.",
    price: 6.5,
    imageUrl:
      "https://images.unsplash.com/photo-1626803775151-61d756612f97?w=600&q=80&auto=format&fit=crop",
    popular: false,
  },
];

export const initialCoupons = [
  { id: "coupon_welcome10", code: "WELCOME10", type: "percent", value: 10, active: true },
  { id: "coupon_flat5", code: "FLAT5", type: "flat", value: 5, active: true },
];

export const ORDER_STATUSES = ["received", "cooking", "ready", "completed"];

export const STATUS_LABELS = {
  received: "Order Received",
  cooking: "Prepping & Baking",
  ready: "Ready",
  completed: "Completed",
};

const now = Date.now();

export const initialOrders = [
  {
    id: "PZ-1042",
    customerName: "Jordan Lee",
    items: [
      { itemId: "item_margherita", name: "Classic Margherita", qty: 1, price: 16.5 },
      { itemId: "item_garlicknots", name: "Garlic Knots (6)", qty: 1, price: 6.5 },
    ],
    fulfillment: "delivery",
    address: "88 Willow Ave, Brooklyn, NY",
    status: "cooking",
    createdAt: now - 6 * 60 * 1000,
    prepTimeMinutes: 18,
    deliveryTransitMinutes: 25,
    total: 23.0,
  },
  {
    id: "PZ-1043",
    customerName: "Sam Rivera",
    items: [
      { itemId: "item_pepperoni", name: "Pepperoni Classic", qty: 2, price: 18.0 },
      { itemId: "item_coke", name: "Coca-Cola (2L)", qty: 1, price: 3.5 },
    ],
    fulfillment: "pickup",
    address: null,
    status: "received",
    createdAt: now - 2 * 60 * 1000,
    prepTimeMinutes: 18,
    deliveryTransitMinutes: 0,
    total: 39.5,
  },
];

// Mock ingredient + supplier data for the AI Inventory & Suppliers dashboard, plus the
// "recipe mapping" simulation that deducts raw stock whenever an order is completed.
import { uid } from "../utils/helpers";

export const SUPPLIER_SEED = [
  {
    id: "us-foods",
    name: "US Foods",
    items: [
      { ingredientId: "mozzarella", costPerUnit: 2.9 },
      { ingredientId: "pepperoni", costPerUnit: 4.5 },
      { ingredientId: "tomato-sauce", costPerUnit: 2.1 },
    ],
  },
  {
    id: "local-dairy-farm",
    name: "Local Dairy Farm",
    items: [{ ingredientId: "mozzarella", costPerUnit: 3.2 }],
  },
  {
    id: "webstaurantstore",
    name: "WebstaurantStore",
    items: [
      { ingredientId: "flour-00", costPerUnit: 1.15 },
      { ingredientId: "pizza-boxes", costPerUnit: 0.38 },
    ],
  },
];

export const INGREDIENT_SEED = [
  {
    id: "mozzarella",
    name: "Mozzarella Cheese",
    unit: "lbs",
    stock: 22,
    threshold: 20,
    restockAmount: 50,
    autoPurchaseEnabled: true,
    preferredSupplierId: "us-foods",
  },
  {
    id: "flour-00",
    name: "00 Flour",
    unit: "lbs",
    stock: 65,
    threshold: 30,
    restockAmount: 100,
    autoPurchaseEnabled: true,
    preferredSupplierId: "webstaurantstore",
  },
  {
    id: "pepperoni",
    name: "Pepperoni",
    unit: "lbs",
    stock: 19,
    threshold: 20,
    restockAmount: 40,
    autoPurchaseEnabled: false,
    preferredSupplierId: "us-foods",
  },
  {
    id: "pizza-boxes",
    name: "Pizza Boxes",
    unit: "boxes",
    stock: 140,
    threshold: 50,
    restockAmount: 300,
    autoPurchaseEnabled: true,
    preferredSupplierId: "webstaurantstore",
  },
  {
    id: "tomato-sauce",
    name: "Tomato Sauce",
    unit: "lbs",
    stock: 24,
    threshold: 15,
    restockAmount: 40,
    autoPurchaseEnabled: true,
    preferredSupplierId: "us-foods",
  },
];

// Illustrative example shown in the UI to explain how POS sales tie back to raw stock.
export const RECIPE_EXAMPLE = {
  itemName: "Pepperoni Pizza",
  deductions: [
    { ingredientName: "Mozzarella Cheese", amount: "0.5 lbs" },
    { ingredientName: "Pizza Boxes", amount: "1 box" },
  ],
};

/**
 * Simulated "recipe mapping": every pizza-ish line item deducts cheese, flour, sauce & a box;
 * pepperoni items also deduct pepperoni. Loose name-matching stands in for a real recipe/BOM system.
 * Returns { [ingredientId]: totalQtyDeducted }.
 */
export function computeDeductions(orderItems = []) {
  const deductions = {};
  const add = (ingredientId, amount) => {
    deductions[ingredientId] = +(((deductions[ingredientId] || 0) + amount).toFixed(3));
  };

  for (const line of orderItems) {
    const qty = line.qty || 0;
    const name = (line.name || "").toLowerCase();
    if (!qty || !name.includes("pizza")) continue;
    add("mozzarella", 0.5 * qty);
    add("flour-00", 0.3 * qty);
    add("tomato-sauce", 0.2 * qty);
    add("pizza-boxes", 1 * qty);
    if (name.includes("pepperoni")) add("pepperoni", 0.25 * qty);
  }

  return deductions;
}

export function buildAgentLogEntry({ ingredient, supplierName, cost }) {
  return {
    id: uid("agent"),
    ts: Date.now(),
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    supplierName,
    qty: ingredient.restockAmount,
    unit: ingredient.unit,
    cost,
    message: `🤖 DeepDish AI: ${ingredient.name} stock dropped below ${ingredient.threshold} ${ingredient.unit}. Auto-purchased ${ingredient.restockAmount} ${ingredient.unit} from ${supplierName} for $${cost.toFixed(2)}. Expected delivery: Tomorrow 8 AM.`,
  };
}

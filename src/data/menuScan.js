// Mock OCR extraction result — stands in for a real vision-model parse of a photographed
// paper menu during onboarding Step 3.
export const CATEGORIES = ["Pizzas", "Sides", "Drinks", "Desserts"];

export const SCANNED_MENU_ITEMS = [
  {
    name: "Classic Margherita",
    description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.",
    price: 16.5,
    category: "Pizzas",
  },
  {
    name: "Pepperoni Classic",
    description: "Double pepperoni, house mozzarella blend, oregano.",
    price: 18.0,
    category: "Pizzas",
  },
  {
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, mozzarella blend.",
    price: 20.5,
    category: "Pizzas",
  },
  {
    name: "Garlic Knots (6)",
    description: "Hand-tossed knots brushed with garlic butter & parmesan.",
    price: 6.5,
    category: "Sides",
  },
  {
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, house caesar dressing.",
    price: 8.5,
    category: "Sides",
  },
];

// Mock role-based access control for the prototype: a fixed PIN → role map instead of a real auth
// backend. Three roles per the Enterprise RBAC spec — Admin and Manager have full sidebar access,
// Cashier is redacted down to the shift-floor tools (KDS, Delivery/Dispatch) since the whole point
// is keeping financial data away from standard employees.
export const MOCK_PINS = {
  9999: { role: "Admin", name: "Owner" },
  5555: { role: "Manager", name: "Shift Manager" },
  1111: { role: "Cashier", name: "Cashier" },
};

export const ROLES = ["Admin", "Manager", "Cashier"];

/** Sidebar nav paths a Cashier is allowed to see — everything else (billing, reports, CRM, etc.) is redacted. */
export const CASHIER_VISIBLE_PATHS = new Set(["/admin/kds", "/admin/delivery"]);

export function canViewNavItem(role, path) {
  if (role !== "Cashier") return true;
  return CASHIER_VISIBLE_PATHS.has(path);
}

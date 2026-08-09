import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadState, saveState, STORAGE_KEY } from "../utils/storage";
import { getOrderTiming, uid } from "../utils/helpers";
import { buildMockCustomers, buildSeedOrders } from "../data/mockCrm";
import { buildAgentLogEntry, computeDeductions, INGREDIENT_SEED, SUPPLIER_SEED } from "../data/inventory";
import { DEFAULT_BILLING, DEFAULT_LOYALTY, DEFAULT_RECOVERED_SALES } from "../data/loyalty";

const ShopStateContext = createContext(null);
const ShopDispatchContext = createContext(null);

const DEFAULT_STATE = {
  shop: null, // null until onboarding completes
  items: [],
  orders: [],
  customers: [],
  ingredients: INGREDIENT_SEED,
  suppliers: SUPPLIER_SEED,
  agentActivityLog: [],
  printEvents: [],
  activeCustomerId: null, // the storefront visitor currently "logged in" in this browser, if any
};

function init() {
  const persisted = loadState();
  return persisted ? { ...DEFAULT_STATE, ...persisted } : DEFAULT_STATE;
}

function reducer(state, action) {
  switch (action.type) {
    case "COMPLETE_ONBOARDING": {
      const shop = {
        name: action.payload.name,
        slug: action.payload.slug,
        logoUrl: action.payload.logoUrl || "",
        primaryColor: action.payload.primaryColor || "#E31837",
        font: "poppins",
        hours: { open: "11:00", close: "22:00" },
        acceptingOrders: true,
        prepMinutes: 15,
        mockSalesBaseline: 3000, // seeds "Commission Saved" so the moat is visible on day one
        winBackSmsEnabled: true,
        abandonedCartSmsEnabled: false,
        printer: { connected: false, deviceName: null, autoPrintOnReady: false },
        loyalty: DEFAULT_LOYALTY,
        billing: DEFAULT_BILLING,
        recoveredSales: DEFAULT_RECOVERED_SALES,
        lat: 40.6782, // mock storefront location (Brooklyn, NY) — center pin for the delivery map
        lng: -73.9442,
        createdAt: Date.now(),
      };
      return {
        ...state,
        shop,
        orders: buildSeedOrders({ prepMinutes: shop.prepMinutes, items: state.items, shop }),
        customers: buildMockCustomers(),
      };
    }

    case "UPDATE_SHOP":
      return { ...state, shop: state.shop ? { ...state.shop, ...action.payload } : state.shop };

    case "ADD_ITEM":
      return { ...state, items: [...state.items, { id: uid("item"), ...action.payload }] };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.payload.id ? { ...i, ...action.payload.changes } : i)),
      };
    case "DELETE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
    case "IMPORT_SCANNED_ITEMS":
      return { ...state, items: [...state.items, ...action.payload.items.map((i) => ({ id: uid("item"), ...i }))] };

    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };
    case "COMPLETE_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.payload.id ? { ...o, completedAt: Date.now() } : o)),
      };
    case "MARK_ORDER_PAID":
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.payload.id ? { ...o, paidAt: Date.now() } : o)),
      };
    case "ASSIGN_DRIVER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? { ...o, assignedDriver: action.payload.driver, dispatchedAt: Date.now() } : o
        ),
      };

    case "ADD_SUPPLIER":
      return { ...state, suppliers: [...state.suppliers, { id: uid("supplier"), ...action.payload }] };

    case "UPDATE_INGREDIENT":
      return {
        ...state,
        ingredients: state.ingredients.map((i) => (i.id === action.payload.id ? { ...i, ...action.payload.changes } : i)),
      };

    case "PROCESS_ORDER_INVENTORY": {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (!order || order.inventoryProcessed) return state;

      const deductions = computeDeductions(order.items);
      const newLogEntries = [];
      const ingredients = state.ingredients.map((ing) => {
        const deducted = deductions[ing.id] ? Math.max(0, +(ing.stock - deductions[ing.id]).toFixed(2)) : ing.stock;
        const restocked = ing;
        if (deducted < ing.threshold && ing.autoPurchaseEnabled) {
          const supplier = state.suppliers.find((s) => s.id === ing.preferredSupplierId);
          const supplierItem = supplier?.items.find((it) => it.ingredientId === ing.id);
          const cost = +(ing.restockAmount * (supplierItem?.costPerUnit || 0)).toFixed(2);
          newLogEntries.push(buildAgentLogEntry({ ingredient: restocked, supplierName: supplier?.name || "Preferred Supplier", cost }));
          return { ...ing, stock: +(deducted + ing.restockAmount).toFixed(2) };
        }
        return { ...ing, stock: deducted };
      });

      return {
        ...state,
        ingredients,
        agentActivityLog: [...newLogEntries, ...state.agentActivityLog].slice(0, 50),
        orders: state.orders.map((o) => (o.id === order.id ? { ...o, inventoryProcessed: true } : o)),
      };
    }

    case "ADD_PRINT_EVENT": {
      const entry = { id: uid("print"), ts: Date.now(), message: action.payload.message, orderId: action.payload.orderId || null };
      return {
        ...state,
        printEvents: [entry, ...state.printEvents].slice(0, 50),
        orders: action.payload.orderId
          ? state.orders.map((o) => (o.id === action.payload.orderId ? { ...o, autoPrinted: true } : o))
          : state.orders,
      };
    }

    case "UPSERT_CUSTOMER": {
      const { name, email, phone, orderTotal, address } = action.payload;
      const emailKey = email?.trim().toLowerCase();
      const phoneKey = phone?.trim();
      if (!emailKey && !phoneKey) return state; // no identifying info (e.g. an anonymous walk-in) — nothing to record

      const pointsPerDollar = state.shop?.loyalty?.pointsPerDollar ?? DEFAULT_LOYALTY.pointsPerDollar;
      const pointsEarned = Math.floor(orderTotal * pointsPerDollar);

      const existing = state.customers.find(
        (c) => (emailKey && c.email?.toLowerCase() === emailKey) || (phoneKey && c.phone === phoneKey)
      );
      if (existing) {
        return {
          ...state,
          customers: state.customers.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  totalOrders: c.totalOrders + 1,
                  lifetimeValue: c.lifetimeValue + orderTotal,
                  loyaltyPoints: (c.loyaltyPoints || 0) + pointsEarned,
                  lastAddress: address || c.lastAddress || null,
                  lastOrderAt: Date.now(),
                }
              : c
          ),
        };
      }
      return {
        ...state,
        customers: [
          {
            id: uid("cust"),
            name,
            email: email || "",
            phone: phone || "",
            totalOrders: 1,
            lifetimeValue: orderTotal,
            loyaltyPoints: pointsEarned,
            accountType: "guest",
            lastAddress: address || null,
            lastOrderAt: Date.now(),
          },
          ...state.customers,
        ],
      };
    }

    case "UPDATE_LOYALTY_SETTINGS":
      return {
        ...state,
        shop: state.shop ? { ...state.shop, loyalty: { ...(state.shop.loyalty || DEFAULT_LOYALTY), ...action.payload } } : state.shop,
      };

    case "ADJUST_CUSTOMER_POINTS":
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.customerId ? { ...c, loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) + action.payload.delta) } : c
        ),
      };

    case "REDEEM_REWARD":
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.customerId ? { ...c, loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) - action.payload.pointsCost) } : c
        ),
      };

    case "REGISTER_CUSTOMER_ACCOUNT":
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.customerId ? { ...c, accountType: "registered" } : c)),
        activeCustomerId: action.payload.customerId,
      };

    case "SET_ACTIVE_CUSTOMER":
      return { ...state, activeCustomerId: action.payload.customerId };

    case "_HYDRATE":
      return { ...DEFAULT_STATE, ...action.payload };

    default:
      return state;
  }
}

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // The AI Inventory agent: whenever an order gets marked "Completed" (from the KDS or Delivery
  // Dispatch), deduct its ingredients and auto-reorder anything that drops below threshold.
  useEffect(() => {
    const pending = state.orders.filter((o) => o.completedAt && !o.inventoryProcessed);
    pending.forEach((o) => dispatch({ type: "PROCESS_ORDER_INVENTORY", payload: { orderId: o.id } }));
  }, [state.orders]);

  // Auto-print: once a connected printer has auto-print-on-ready enabled, "print" a receipt the
  // moment an order's timer flips to Ready — polls since "Ready" is a derived, time-based state.
  useEffect(() => {
    const printer = state.shop?.printer;
    if (!printer?.connected || !printer?.autoPrintOnReady) return;
    const id = setInterval(() => {
      const now = Date.now();
      const justReady = state.orders.filter((o) => !o.completedAt && !o.autoPrinted && getOrderTiming(o, now).stageIndex === 2);
      justReady.forEach((o) =>
        dispatch({
          type: "ADD_PRINT_EVENT",
          payload: { message: `🖨️ Printing receipt for Order #${o.id.replace("DD-", "")}...`, orderId: o.id },
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, [state.orders, state.shop?.printer]);

  // Cross-tab sync: e.g. a customer completing a QR payment in one tab (opened from the POS
  // screen's payment QR code) should be reflected immediately back on the POS tab.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      const fresh = loadState();
      if (fresh) dispatch({ type: "_HYDRATE", payload: fresh });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const actions = useMemo(
    () => ({
      completeOnboarding: (payload) => dispatch({ type: "COMPLETE_ONBOARDING", payload }),
      updateShop: (payload) => dispatch({ type: "UPDATE_SHOP", payload }),

      addItem: (payload) => dispatch({ type: "ADD_ITEM", payload }),
      updateItem: (id, changes) => dispatch({ type: "UPDATE_ITEM", payload: { id, changes } }),
      deleteItem: (id) => dispatch({ type: "DELETE_ITEM", payload: { id } }),
      importScannedItems: (items) => dispatch({ type: "IMPORT_SCANNED_ITEMS", payload: { items } }),

      addOrder: (order) => dispatch({ type: "ADD_ORDER", payload: order }),
      completeOrder: (id) => dispatch({ type: "COMPLETE_ORDER", payload: { id } }),
      markOrderPaid: (id) => dispatch({ type: "MARK_ORDER_PAID", payload: { id } }),
      assignDriver: (id, driver) => dispatch({ type: "ASSIGN_DRIVER", payload: { id, driver } }),

      upsertCustomer: (payload) => dispatch({ type: "UPSERT_CUSTOMER", payload }),

      addSupplier: (payload) => dispatch({ type: "ADD_SUPPLIER", payload }),
      updateIngredient: (id, changes) => dispatch({ type: "UPDATE_INGREDIENT", payload: { id, changes } }),
      addPrintEvent: (message, orderId = null) => dispatch({ type: "ADD_PRINT_EVENT", payload: { message, orderId } }),

      updateLoyaltySettings: (payload) => dispatch({ type: "UPDATE_LOYALTY_SETTINGS", payload }),
      adjustCustomerPoints: (customerId, delta) => dispatch({ type: "ADJUST_CUSTOMER_POINTS", payload: { customerId, delta } }),
      redeemReward: (customerId, pointsCost) => dispatch({ type: "REDEEM_REWARD", payload: { customerId, pointsCost } }),
      registerCustomerAccount: (customerId) => dispatch({ type: "REGISTER_CUSTOMER_ACCOUNT", payload: { customerId } }),
      setActiveCustomer: (customerId) => dispatch({ type: "SET_ACTIVE_CUSTOMER", payload: { customerId } }),
    }),
    []
  );

  return (
    <ShopStateContext.Provider value={state}>
      <ShopDispatchContext.Provider value={actions}>{children}</ShopDispatchContext.Provider>
    </ShopStateContext.Provider>
  );
}

export function useShopState() {
  const ctx = useContext(ShopStateContext);
  if (!ctx) throw new Error("useShopState must be used within ShopProvider");
  return ctx;
}

export function useShopActions() {
  const ctx = useContext(ShopDispatchContext);
  if (!ctx) throw new Error("useShopActions must be used within ShopProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadState, saveState } from "../utils/storage";
import { uid } from "../utils/helpers";
import { buildMockCustomers, buildSeedOrders } from "../data/mockCrm";

const ShopStateContext = createContext(null);
const ShopDispatchContext = createContext(null);

const DEFAULT_STATE = {
  shop: null, // null until onboarding completes
  items: [],
  orders: [],
  customers: [],
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
        createdAt: Date.now(),
      };
      return {
        ...state,
        shop,
        orders: buildSeedOrders({ prepMinutes: shop.prepMinutes, items: state.items }),
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

    case "UPSERT_CUSTOMER": {
      const { name, email, phone, orderTotal } = action.payload;
      const existing = state.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return {
          ...state,
          customers: state.customers.map((c) =>
            c.id === existing.id
              ? { ...c, totalOrders: c.totalOrders + 1, lifetimeValue: c.lifetimeValue + orderTotal, lastOrderAt: Date.now() }
              : c
          ),
        };
      }
      return {
        ...state,
        customers: [
          { id: uid("cust"), name, email, phone, totalOrders: 1, lifetimeValue: orderTotal, lastOrderAt: Date.now() },
          ...state.customers,
        ],
      };
    }

    default:
      return state;
  }
}

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    saveState(state);
  }, [state]);

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

      upsertCustomer: (payload) => dispatch({ type: "UPSERT_CUSTOMER", payload }),
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

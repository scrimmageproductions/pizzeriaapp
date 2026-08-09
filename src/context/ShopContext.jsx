import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadState, saveState, STORAGE_KEY } from "../utils/storage";
import { uid } from "../utils/helpers";
import { buildMockCustomers, buildSeedFeedback, buildSeedOrders } from "../data/mockCrm";

const ShopStateContext = createContext(null);
const ShopDispatchContext = createContext(null);

const DEFAULT_STATE = {
  shop: null, // null until onboarding completes
  items: [],
  orders: [],
  customers: [],
  feedback: [], // 1-3 star complaints intercepted before they reach Google (see Reputation dashboard)
  googleReviewsBoosted: 0,
};

const LOYALTY_SIGNUP_POINTS = 42;

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
        lat: 40.6782, // mock storefront location (Brooklyn, NY) — center pin for the delivery map
        lng: -73.9442,
        createdAt: Date.now(),
      };
      return {
        ...state,
        shop,
        orders: buildSeedOrders({ prepMinutes: shop.prepMinutes, items: state.items, shop }),
        customers: buildMockCustomers(),
        feedback: buildSeedFeedback(),
        googleReviewsBoosted: 14,
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

    case "UPSERT_CUSTOMER": {
      const { name, email, phone, orderTotal } = action.payload;
      const emailKey = email?.trim().toLowerCase();
      const phoneKey = phone?.trim();
      if (!emailKey && !phoneKey) return state; // no identifying info (e.g. an anonymous walk-in) — nothing to record

      const existing = state.customers.find(
        (c) => (emailKey && c.email?.toLowerCase() === emailKey) || (phoneKey && c.phone === phoneKey)
      );
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
          {
            id: uid("cust"),
            name,
            email: email || "",
            phone: phone || "",
            totalOrders: 1,
            lifetimeValue: orderTotal,
            lastOrderAt: Date.now(),
            accountStatus: "guest", // walk-up/phone orders start as guests until they claim their loyalty points
            points: 0,
          },
          ...state.customers,
        ],
      };
    }

    // Pager's loyalty upsell: a guest claims their signup points and becomes a registered member.
    case "CLAIM_LOYALTY_POINTS":
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.phone === action.payload.phone && c.accountStatus === "guest"
            ? { ...c, accountStatus: "registered", points: c.points + LOYALTY_SIGNUP_POINTS }
            : c
        ),
      };

    // Review gating: 4-5 star ratings never touch the inbox, they just bump the public counter.
    case "SUBMIT_FEEDBACK": {
      const { orderId, customerName, rating, comment } = action.payload;
      if (rating >= 4) {
        return { ...state, googleReviewsBoosted: state.googleReviewsBoosted + 1 };
      }
      return {
        ...state,
        feedback: [
          { id: uid("fb"), orderId, customerName, rating, comment: comment || "", createdAt: Date.now(), resolved: false },
          ...state.feedback,
        ],
      };
    }

    case "RESOLVE_FEEDBACK":
      return {
        ...state,
        feedback: state.feedback.map((f) => (f.id === action.payload.id ? { ...f, resolved: true } : f)),
      };

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
      claimLoyaltyPoints: (phone) => dispatch({ type: "CLAIM_LOYALTY_POINTS", payload: { phone } }),

      submitFeedback: (payload) => dispatch({ type: "SUBMIT_FEEDBACK", payload }),
      resolveFeedback: (id) => dispatch({ type: "RESOLVE_FEEDBACK", payload: { id } }),
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

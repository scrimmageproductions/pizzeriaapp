import { createContext, useContext, useMemo, useReducer } from "react";
import {
  initialCategories,
  initialConfig,
  initialCoupons,
  initialItems,
  initialOrders,
  uid,
} from "../data/mockData";

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

const initialState = {
  config: initialConfig,
  categories: initialCategories,
  items: initialItems,
  coupons: initialCoupons,
  orders: initialOrders,
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [
          ...state.categories,
          { id: uid("cat"), name: action.payload.name, icon: action.payload.icon || "UtensilsCrossed" },
        ],
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload.id),
        items: state.items.filter((i) => i.categoryId !== action.payload.id),
      };

    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, { id: uid("item"), popular: false, ...action.payload }],
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.payload.id ? { ...i, ...action.payload.changes } : i)),
      };
    case "DELETE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
    case "IMPORT_ITEMS":
      return { ...state, items: [...state.items, ...action.payload.items] };

    case "ADD_COUPON":
      return {
        ...state,
        coupons: [...state.coupons, { id: uid("coupon"), active: true, ...action.payload }],
      };
    case "UPDATE_COUPON":
      return {
        ...state,
        coupons: state.coupons.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload.changes } : c)),
      };
    case "DELETE_COUPON":
      return { ...state, coupons: state.coupons.filter((c) => c.id !== action.payload.id) };

    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };
    case "BUMP_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id && o.dispatchedAt == null ? { ...o, dispatchedAt: Date.now() } : o
        ),
      };
    case "ADD_RUSH_DELAY":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id
            ? { ...o, delaySeconds: o.delaySeconds + action.payload.seconds, lastDelayAt: Date.now() }
            : o
        ),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      updateConfig: (payload) => dispatch({ type: "UPDATE_CONFIG", payload }),

      addCategory: (payload) => dispatch({ type: "ADD_CATEGORY", payload }),
      updateCategory: (id, changes) => dispatch({ type: "UPDATE_CATEGORY", payload: { id, changes } }),
      deleteCategory: (id) => dispatch({ type: "DELETE_CATEGORY", payload: { id } }),

      addItem: (payload) => dispatch({ type: "ADD_ITEM", payload }),
      updateItem: (id, changes) => dispatch({ type: "UPDATE_ITEM", payload: { id, changes } }),
      deleteItem: (id) => dispatch({ type: "DELETE_ITEM", payload: { id } }),
      importItems: (items) => dispatch({ type: "IMPORT_ITEMS", payload: { items } }),

      addCoupon: (payload) => dispatch({ type: "ADD_COUPON", payload }),
      updateCoupon: (id, changes) => dispatch({ type: "UPDATE_COUPON", payload: { id, changes } }),
      deleteCoupon: (id) => dispatch({ type: "DELETE_COUPON", payload: { id } }),

      addOrder: (order) => dispatch({ type: "ADD_ORDER", payload: order }),
      bumpOrder: (id) => dispatch({ type: "BUMP_ORDER", payload: { id } }),
      addRushDelay: (id, seconds = 300) => dispatch({ type: "ADD_RUSH_DELAY", payload: { id, seconds } }),
    }),
    []
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={actions}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useAppActions() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error("useAppActions must be used within AppProvider");
  return ctx;
}

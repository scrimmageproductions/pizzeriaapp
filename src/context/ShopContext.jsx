import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadState, saveState, STORAGE_KEY } from "../utils/storage";
import { getOrderTiming, uid } from "../utils/helpers";
import { buildMockCustomers, buildSeedOrders } from "../data/mockCrm";
import { buildAgentLogEntry, computeDeductions, INGREDIENT_SEED, SUPPLIER_SEED } from "../data/inventory";
import { DEFAULT_BILLING, DEFAULT_CONVERSION_METRICS, DEFAULT_LOYALTY, DEFAULT_RECOVERED_SALES } from "../data/loyalty";
import { buildSeedApplicants, buildSeedDrivers, generateUniquePin } from "../data/drivers";
import { buildMockThirdPartyOrder } from "../data/thirdParty";

const ShopStateContext = createContext(null);
const ShopDispatchContext = createContext(null);

const DEFAULT_INTEGRATIONS = { doordash: false, ubereats: false, grubhub: false };

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
  drivers: [],
  applicants: [],
  shiftReports: [],
  zReports: [],
  merchantCart: [],
  supplyOrderHistory: [],
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
        printer: { connected: false, deviceName: null, autoPrintOnReady: false, autoPrintBoxTopper: false },
        loyalty: DEFAULT_LOYALTY,
        billing: DEFAULT_BILLING,
        recoveredSales: DEFAULT_RECOVERED_SALES,
        integrations: DEFAULT_INTEGRATIONS,
        conversionMetrics: DEFAULT_CONVERSION_METRICS,
        address: "412 Willow Ave, Brooklyn, NY 11201", // mock shop mailing address — used by the Merchant Supply Store checkout
        tableCount: 0, // QR Dine-In table generator
        lastZReportAt: null, // EOD register period start — null means "since midnight today"
        lat: 40.6782, // mock storefront location (Brooklyn, NY) — center pin for the delivery map
        lng: -73.9442,
        createdAt: Date.now(),
      };
      return {
        ...state,
        shop,
        orders: buildSeedOrders({ prepMinutes: shop.prepMinutes, items: state.items, shop }),
        customers: buildMockCustomers(),
        drivers: buildSeedDrivers(),
        applicants: buildSeedApplicants(),
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
    case "ASSIGN_DRIVER": {
      const driver = state.drivers.find((d) => d.id === action.payload.driverId);
      if (!driver) return state;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.orderId
            ? { ...o, assignedDriver: driver.name, assignedDriverId: driver.id, dispatchedAt: Date.now() }
            : o
        ),
        drivers: state.drivers.map((d) => (d.id === driver.id ? { ...d, status: "ON_ROAD", inStoreSince: null } : d)),
      };
    }

    case "MARK_ORDER_DELIVERED": {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (!order) return state;
      // A card-paid delivery generates a mock tip owed to the driver; cash orders have none (the
      // cash itself, collected at the door, is reconciled against the driver at end-of-shift).
      const tip = order.paymentMethod !== "cash" ? +(3 + Math.random() * 5).toFixed(2) : 0;
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === order.id ? { ...o, completedAt: Date.now(), tipAmount: tip } : o)),
      };
    }

    case "ADD_APPLICANT":
      return {
        ...state,
        applicants: [
          { id: uid("applicant"), stage: "new", appliedAt: Date.now(), ...action.payload },
          ...state.applicants,
        ],
      };

    case "UPDATE_APPLICANT_STAGE":
      return {
        ...state,
        applicants: state.applicants.map((a) => (a.id === action.payload.id ? { ...a, stage: action.payload.stage } : a)),
      };

    case "HIRE_APPLICANT": {
      const applicant = state.applicants.find((a) => a.id === action.payload.id);
      if (!applicant) return state;
      const driver = {
        id: uid("driver"),
        name: applicant.name,
        phone: applicant.phone,
        vehicleType: applicant.vehicleType,
        pin: generateUniquePin(state.drivers),
        authToken: uid("token"),
        status: "OFF_CLOCK",
        clockInAt: null,
        inStoreSince: null,
        hiredAt: Date.now(),
      };
      return {
        ...state,
        applicants: state.applicants.map((a) => (a.id === applicant.id ? { ...a, stage: "hired" } : a)),
        drivers: [...state.drivers, driver],
      };
    }

    case "SET_DRIVER_STATUS":
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.payload.driverId ? { ...d, status: action.payload.status, ...action.payload.extra } : d
        ),
      };

    case "CLOCK_OUT_DRIVER": {
      const driver = state.drivers.find((d) => d.id === action.payload.driverId);
      if (!driver) return state;
      const report = {
        id: uid("shift"),
        driverId: driver.id,
        driverName: driver.name,
        ...action.payload.summary,
        approvedAt: Date.now(),
      };
      return {
        ...state,
        drivers: state.drivers.map((d) => (d.id === driver.id ? { ...d, status: "OFF_CLOCK", clockInAt: null, inStoreSince: null } : d)),
        shiftReports: [report, ...state.shiftReports],
      };
    }

    case "RUN_Z_REPORT": {
      const report = { ...action.payload.summary, id: uid("zreport"), closedAt: Date.now() };
      return {
        ...state,
        zReports: [report, ...state.zReports],
        shop: state.shop ? { ...state.shop, lastZReportAt: report.closedAt } : state.shop,
      };
    }

    case "ADD_TO_MERCHANT_CART": {
      const addQty = action.payload.qty || 1;
      const existing = state.merchantCart.find((c) => c.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          merchantCart: state.merchantCart.map((c) =>
            c.productId === action.payload.productId ? { ...c, qty: c.qty + addQty } : c
          ),
        };
      }
      return { ...state, merchantCart: [...state.merchantCart, { ...action.payload, qty: addQty }] };
    }

    case "UPDATE_MERCHANT_CART_QTY":
      return {
        ...state,
        merchantCart:
          action.payload.qty <= 0
            ? state.merchantCart.filter((c) => c.productId !== action.payload.productId)
            : state.merchantCart.map((c) => (c.productId === action.payload.productId ? { ...c, qty: action.payload.qty } : c)),
      };

    case "REMOVE_FROM_MERCHANT_CART":
      return { ...state, merchantCart: state.merchantCart.filter((c) => c.productId !== action.payload.productId) };

    case "CHECKOUT_MERCHANT_CART": {
      if (state.merchantCart.length === 0) return state;
      const order = {
        id: uid("supply"),
        items: state.merchantCart,
        total: action.payload.total,
        placedAt: Date.now(),
      };
      return { ...state, merchantCart: [], supplyOrderHistory: [order, ...state.supplyOrderHistory] };
    }

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
  // The same pass also fires a "Box Topper" conversion coupon for third-party orders, if enabled.
  useEffect(() => {
    const printer = state.shop?.printer;
    if (!printer?.connected || (!printer.autoPrintOnReady && !printer.autoPrintBoxTopper)) return;
    const id = setInterval(() => {
      const now = Date.now();
      const justReady = state.orders.filter((o) => !o.completedAt && !o.autoPrinted && getOrderTiming(o, now).stageIndex === 2);
      justReady.forEach((o) => {
        const shortId = o.id.replace("DD-", "");
        if (printer.autoPrintOnReady) {
          dispatch({ type: "ADD_PRINT_EVENT", payload: { message: `🖨️ Printing receipt for Order #${shortId}...`, orderId: o.id } });
        }
        if (printer.autoPrintBoxTopper && o.thirdPartySource) {
          dispatch({
            type: "ADD_PRINT_EVENT",
            payload: { message: `🎟️ Printing DIRECT15 box topper for Order #${shortId} (${o.thirdPartySource})...`, orderId: o.id },
          });
        }
      });
    }, 2000);
    return () => clearInterval(id);
  }, [state.orders, state.shop?.printer]);

  // Auto-Dispatch: the moment a delivery order is Ready, hand it to whichever IN_STORE driver
  // has been waiting longest (FIFO). If nobody's in-store, it waits — the next driver to punch
  // "Returned to Store" gets swept up by this same poll within a couple seconds.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const waiting = state.orders.filter(
        (o) => o.fulfillment === "delivery" && !o.completedAt && !o.assignedDriverId && getOrderTiming(o, now).stageIndex === 2
      );
      if (waiting.length === 0) return;
      const available = state.drivers
        .filter((d) => d.status === "IN_STORE")
        .sort((a, b) => (a.inStoreSince || 0) - (b.inStoreSince || 0));
      if (available.length === 0) return;
      dispatch({ type: "ASSIGN_DRIVER", payload: { orderId: waiting[0].id, driverId: available[0].id } });
    }, 2000);
    return () => clearInterval(id);
  }, [state.orders, state.drivers]);

  // Mock third-party order injection: while at least one delivery-app integration is "connected",
  // occasionally drop a DoorDash/UberEats/Grubhub order into the live KDS pipeline so the source
  // badging and Box Topper flow can be exercised without a real API.
  useEffect(() => {
    const integrations = state.shop?.integrations;
    const enabled = integrations ? Object.keys(integrations).filter((k) => integrations[k]) : [];
    if (enabled.length === 0 || state.items.length === 0) return;
    const id = setInterval(() => {
      if (Math.random() > 0.35) return; // occasional, not every tick
      const activeThirdParty = state.orders.filter((o) => !o.completedAt && o.thirdPartySource).length;
      if (activeThirdParty >= 4) return; // don't let the demo pile up indefinitely
      const source = enabled[Math.floor(Math.random() * enabled.length)];
      dispatch({ type: "ADD_ORDER", payload: buildMockThirdPartyOrder(source, state.items, state.shop) });
    }, 20000);
    return () => clearInterval(id);
  }, [state.shop?.integrations, state.items, state.orders, state.shop]);

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
      markOrderDelivered: (id) => dispatch({ type: "MARK_ORDER_DELIVERED", payload: { id } }),
      markOrderPaid: (id) => dispatch({ type: "MARK_ORDER_PAID", payload: { id } }),
      assignDriver: (orderId, driverId) => dispatch({ type: "ASSIGN_DRIVER", payload: { orderId, driverId } }),

      upsertCustomer: (payload) => dispatch({ type: "UPSERT_CUSTOMER", payload }),

      addSupplier: (payload) => dispatch({ type: "ADD_SUPPLIER", payload }),
      updateIngredient: (id, changes) => dispatch({ type: "UPDATE_INGREDIENT", payload: { id, changes } }),
      addPrintEvent: (message, orderId = null) => dispatch({ type: "ADD_PRINT_EVENT", payload: { message, orderId } }),

      updateLoyaltySettings: (payload) => dispatch({ type: "UPDATE_LOYALTY_SETTINGS", payload }),
      adjustCustomerPoints: (customerId, delta) => dispatch({ type: "ADJUST_CUSTOMER_POINTS", payload: { customerId, delta } }),
      redeemReward: (customerId, pointsCost) => dispatch({ type: "REDEEM_REWARD", payload: { customerId, pointsCost } }),
      registerCustomerAccount: (customerId) => dispatch({ type: "REGISTER_CUSTOMER_ACCOUNT", payload: { customerId } }),
      setActiveCustomer: (customerId) => dispatch({ type: "SET_ACTIVE_CUSTOMER", payload: { customerId } }),

      addApplicant: (payload) => dispatch({ type: "ADD_APPLICANT", payload }),
      updateApplicantStage: (id, stage) => dispatch({ type: "UPDATE_APPLICANT_STAGE", payload: { id, stage } }),
      hireApplicant: (id) => dispatch({ type: "HIRE_APPLICANT", payload: { id } }),

      setDriverStatus: (driverId, status, extra = {}) => dispatch({ type: "SET_DRIVER_STATUS", payload: { driverId, status, extra } }),
      clockOutDriver: (driverId, summary) => dispatch({ type: "CLOCK_OUT_DRIVER", payload: { driverId, summary } }),

      runZReport: (summary) => dispatch({ type: "RUN_Z_REPORT", payload: { summary } }),

      addToMerchantCart: (product) => dispatch({ type: "ADD_TO_MERCHANT_CART", payload: product }),
      updateMerchantCartQty: (productId, qty) => dispatch({ type: "UPDATE_MERCHANT_CART_QTY", payload: { productId, qty } }),
      removeFromMerchantCart: (productId) => dispatch({ type: "REMOVE_FROM_MERCHANT_CART", payload: { productId } }),
      checkoutMerchantCart: (total) => dispatch({ type: "CHECKOUT_MERCHANT_CART", payload: { total } }),
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

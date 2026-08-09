import { createContext, useContext, useMemo, useState } from "react";
import { STORAGE_KEY, loadState } from "../utils/storage";

// Mock auth — no backend. Two small, separate localStorage records sit alongside the shop's own
// "deepdish:v1" blob: a `users` directory (one entry per account, each carrying that owner's own
// full snapshot of shop state) and a `session` pointer (which account, if any, is active). This
// keeps the existing single-tenant ShopContext/localStorage machinery completely untouched — Auth
// only ever reads/writes the live "deepdish:v1" blob at the moments an account is created, logged
// into, or logged out of; ShopContext itself never has to know accounts exist.
const USERS_KEY = "deepdish:users";
const SESSION_KEY = "deepdish:session";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // localStorage unavailable — accounts won't persist across reloads, but the session still works in-memory.
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function deriveName(shopState) {
  return shopState?.shop?.name ? `${shopState.shop.name} Owner` : "Owner";
}

function mockGoogleEmail(shopState) {
  const base = shopState?.shop?.slug || `owner${Date.now().toString(36)}`;
  return `${base}@gmail.com`;
}

const AuthStateContext = createContext(null);
const AuthActionsContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });

  const currentUser = useMemo(() => {
    if (!session) return null;
    const users = loadUsers();
    const entry = users[session];
    if (!entry) return null;
    return { email: entry.email, name: entry.name, phone: entry.phone || "", provider: entry.provider };
  }, [session]);

  const setActiveSession = (email) => {
    try {
      if (email) localStorage.setItem(SESSION_KEY, email);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore — in-memory session still works for this tab
    }
    setSession(email);
  };

  /** Saves the currently-live shop state (whatever the wizard/session just built) as this account's record. */
  const persistAccount = ({ email, password, name, phone, provider }) => {
    const users = loadUsers();
    const shopState = loadState();
    users[email] = { email, password: password || null, name, phone: phone || "", provider, createdAt: Date.now(), shopState };
    saveUsers(users);
    setActiveSession(email);
  };

  const signUpWithEmail = ({ email, password, phone }) => {
    const normalized = normalizeEmail(email || "");
    if (!normalized || !password) return { error: "Email and password are required." };
    const users = loadUsers();
    if (users[normalized]) return { error: "An account with that email already exists — try logging in instead." };
    persistAccount({ email: normalized, password, name: deriveName(loadState()), phone, provider: "email" });
    return { success: true };
  };

  const signUpWithGoogle = () => {
    const shopState = loadState();
    const email = mockGoogleEmail(shopState);
    persistAccount({ email, password: null, name: deriveName(shopState), phone: "", provider: "google" });
    return { success: true, email };
  };

  const loginWithEmail = ({ email, password }) => {
    const normalized = normalizeEmail(email || "");
    const users = loadUsers();
    const entry = users[normalized];
    if (!entry) return { error: "No account found with that email — create your store first." };
    if (entry.password !== password) return { error: "Incorrect password." };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.shopState));
    setActiveSession(normalized);
    return { success: true };
  };

  const loginWithGoogle = () => {
    const users = loadUsers();
    const googleAccounts = Object.values(users)
      .filter((u) => u.provider === "google")
      .sort((a, b) => b.createdAt - a.createdAt);
    const entry = googleAccounts[0];
    if (!entry) return { error: "No Google account found on this device — create your store first." };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.shopState));
    setActiveSession(entry.email);
    return { success: true };
  };

  const logout = () => {
    if (session) {
      // Save whatever changed during this session back onto the account before clearing it.
      const users = loadUsers();
      if (users[session]) {
        users[session] = { ...users[session], shopState: loadState() };
        saveUsers(users);
      }
    }
    // Wipe the live shop blob so the next visitor to this browser doesn't see this owner's store.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setActiveSession(null);
  };

  const actions = useMemo(
    () => ({ signUpWithEmail, signUpWithGoogle, loginWithEmail, loginWithGoogle, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  return (
    <AuthStateContext.Provider value={{ currentUser, isAuthenticated: !!currentUser }}>
      <AuthActionsContext.Provider value={actions}>{children}</AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
}

export function useAuthActions() {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error("useAuthActions must be used within AuthProvider");
  return ctx;
}

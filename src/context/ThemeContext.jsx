import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "deepdish:theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemPreference() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function getStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  } catch {
    return "system"; // localStorage unavailable (e.g. private browsing) — fall back to system preference each load
  }
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredMode); // 'light' | 'dark' | 'system' — the user's stored preference
  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  // Track the OS-level setting live, so a food truck stepping from a dim tent into direct sun
  // (device auto-switches) updates the app immediately when the owner hasn't overridden it.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(MEDIA_QUERY);
    const onChange = (e) => setSystemPreference(e.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = mode === "system" ? systemPreference : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setThemeMode = (nextMode) => {
    setMode(nextMode);
    try {
      localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // localStorage unavailable — the choice still applies for this session via React state.
    }
  };

  const value = useMemo(
    () => ({
      mode, // the raw stored preference — 'light' | 'dark' | 'system'
      resolvedTheme, // the actual theme in effect right now — 'light' | 'dark'
      isDark: resolvedTheme === "dark",
      setThemeMode,
      toggleTheme: () => setThemeMode(resolvedTheme === "dark" ? "light" : "dark"),
    }),
    [mode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

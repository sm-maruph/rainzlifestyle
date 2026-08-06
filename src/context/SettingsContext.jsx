// src/context/SettingsContext.jsx — load settings once + apply theme colors as CSS variables
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSettings } from "../api";

const SettingsContext = createContext(null);

const DEFAULT_THEME = {
  brand: "#000000", men: "#E11D48", women: "#DB2777",
  kids: "#F59E0B", accessories: "#0D9488", sale: "#7C3AED",
};

const FALLBACK = {
  storeName: "RAINZLIFESTYLE", tagline: "", currency: "BDT", supportEmail: "", supportPhone: "",
  logo: "", address: "", city: "", hours: "",
  delivery: { inside: 80, outside: 120, freeThreshold: 0 },
  payments: [], social: {}, maintenance: false, theme: DEFAULT_THEME,
};

// Write the theme onto :root so the whole site can use var(--brand) etc.
export function applyTheme(theme = {}) {
  const t = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement;
  root.style.setProperty("--brand", t.brand);
  root.style.setProperty("--accent-men", t.men);
  root.style.setProperty("--accent-women", t.women);
  root.style.setProperty("--accent-kids", t.kids);
  root.style.setProperty("--accent-accessories", t.accessories);
  root.style.setProperty("--accent-sale", t.sale);
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  // wrap setter so updating settings also re-applies the theme immediately
  const setSettings = useCallback((next) => {
    setSettingsState((current) => {
      const value = typeof next === "function" ? next(current) : next;
      if (value?.theme) applyTheme(value.theme);
      return value;
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    const next = await getSettings();
    setSettings(next);
    return next;
  }, [setSettings]);

  useEffect(() => {
    // apply defaults instantly so there's no flash before the API responds
    applyTheme(DEFAULT_THEME);
    let alive = true;
    getSettings()
      .then((next) => { if (alive) setSettings(next); })
      .catch(() => alive && setSettingsState(FALLBACK))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [setSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, setSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  return ctx || { settings: FALLBACK, loading: false, setSettings: () => {}, refreshSettings: async () => FALLBACK };
}

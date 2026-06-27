import { api } from "./apiClient";

// DB (snake) -> UI (camel)
export const mapSettings = (s = {}) => ({
  storeName: s.store_name || "RAINZLIFESTYLE",
  tagline: s.tagline || "",
  currency: s.currency || "BDT",
  supportEmail: s.support_email || "",
  supportPhone: s.support_phone || "",
  logo: s.logo || "",
  address: s.address || "",
  city: s.city || "",
  hours: s.hours || "",
  delivery: {
    inside: Number(s.delivery_inside ?? 80),
    outside: Number(s.delivery_outside ?? 120),
    freeThreshold: Number(s.free_delivery_threshold ?? 0),
  },
  payments: Array.isArray(s.payments) ? s.payments : [],
  social: s.social || {},
  maintenance: !!s.maintenance,
  theme: s.theme || { brand: "#E11D48", men: "#E11D48", women: "#DB2777", kids: "#F59E0B", accessories: "#0D9488", sale: "#7C3AED" },
});

// UI (camel) -> DB (snake)
const toRow = (u) => ({
  store_name: u.storeName,
  tagline: u.tagline,
  currency: u.currency,
  support_email: u.supportEmail,
  support_phone: u.supportPhone,
  address: u.address,
  city: u.city,
  hours: u.hours,
  delivery_inside: Number(u.delivery?.inside || 0),
  delivery_outside: Number(u.delivery?.outside || 0),
  free_delivery_threshold: Number(u.delivery?.freeThreshold || 0),
  payments: u.payments || [],
  social: u.social || {},
  maintenance: !!u.maintenance,
  theme: u.theme || {},
});

export const getSettings = () => api.get("/settings").then(mapSettings);

export function updateSettings(ui, logoFile) {
  const row = toRow(ui);
  if (logoFile) {
    const fd = new FormData();
    Object.entries(row).forEach(([k, v]) => {
      fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
    });
    fd.append("logo", logoFile);
    return api.upload("/settings", fd, "PUT").then(mapSettings);
  }
  return api.put("/settings", row).then(mapSettings);
}

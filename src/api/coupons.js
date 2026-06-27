import { api } from "./apiClient";

// Server-side validated discount. Returns { valid, discount, freeShipping } or throws.
export async function validateCoupon(code, subtotal) {
  return api.post("/coupons/validate", { code, subtotal });
}

// DB (snake_case) -> UI (camelCase)
const mapCoupon = (c) => ({
  id: c.id,
  code: c.code,
  type: c.type,
  value: Number(c.value || 0),
  minOrder: Number(c.min_order || 0),
  maxDiscount: Number(c.max_discount || 0),
  usageLimit: Number(c.usage_limit || 0),
  used: Number(c.used_count || 0),
  start: c.start_date || "",
  expiry: c.expiry_date || "",
  enabled: c.enabled !== false,
  description: c.description || "",
});

// UI (camelCase) -> DB (snake_case)
const toRow = (b) => ({
  code: b.code,
  type: b.type,
  value: Number(b.value || 0),
  min_order: Number(b.minOrder || 0),
  max_discount: Number(b.maxDiscount || 0),
  usage_limit: Number(b.usageLimit || 0),
  start_date: b.start || null,
  expiry_date: b.expiry || null,
  enabled: !!b.enabled,
  description: b.description || null,
});

export const getCoupons = () => api.get("/coupons").then((d) => (d.items || []).map(mapCoupon));
export const createCoupon = (body) => api.post("/coupons", toRow(body));
export const updateCoupon = (id, body) => api.put(`/coupons/${id}`, toRow(body));
export const deleteCoupon = (id) => api.del(`/coupons/${id}`);
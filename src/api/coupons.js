import { api } from "./apiClient";

// Server-side validated discount. Returns { valid, discount, freeShipping } or throws.
export async function validateCoupon(code, subtotal) {
  return api.post("/coupons/validate", { code, subtotal });
}
export const getCoupons = () => api.get("/coupons").then((d) => d.items || []);
export const createCoupon = (body) => api.post("/coupons", body);
export const updateCoupon = (id, body) => api.put(`/coupons/${id}`, body);
export const deleteCoupon = (id) => api.del(`/coupons/${id}`);

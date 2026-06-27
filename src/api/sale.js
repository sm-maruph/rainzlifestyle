import { api } from "./apiClient";
import { mapProduct } from "./mappers";

// ----- Admin -----
const mapCampaign = (c) => ({
  id: c.id,
  name: c.name,
  banner: c.banner || "",
  scope: c.scope,
  categoryId: c.category_id || "",
  subcategoryId: c.subcategory_id || "",
  discountType: c.discount_type,
  value: Number(c.value || 0),
  start: c.start_date || "",
  expiry: c.end_date || "",
  enabled: c.enabled !== false,
  productIds: c.product_ids || [],
});

const toRow = (b) => ({
  name: b.name,
  banner: b.banner || null,
  scope: b.scope,
  category_id: b.scope === "category" ? (b.categoryId || null) : null,
  subcategory_id: b.scope === "subcategory" ? (b.subcategoryId || null) : null,
  discount_type: b.discountType,
  value: Number(b.value || 0),
  start_date: b.start || null,
  end_date: b.expiry || null,
  enabled: !!b.enabled,
  product_ids: b.scope === "products" ? (b.productIds || []) : [],
});

export const getSaleCampaigns = () => api.get("/sale/all").then((d) => (d.items || []).map(mapCampaign));
export const createSaleCampaign = (body) => api.post("/sale", toRow(body));
export const updateSaleCampaign = (id, body) => api.put(`/sale/${id}`, toRow(body));
export const deleteSaleCampaign = (id) => api.del(`/sale/${id}`);

// ----- Public: products on sale (already discounted by the server) -----
export const getSaleProducts = () => api.get("/sale/products").then((d) => (d.items || []).map(mapProduct));

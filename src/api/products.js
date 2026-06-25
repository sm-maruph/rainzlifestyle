import { api } from "./apiClient";
import { mapProduct } from "./mappers";

// Public reads
export async function getProducts({ category, subcategory, search, sort = "newest", page = 1, pageSize = 24 } = {}) {
  const data = await api.get("/products", { params: { category, subcategory, search, sort, page, pageSize } });
  return { items: (data.items || []).map(mapProduct), total: data.total, page: data.page };
}
export async function getProductBySlug(slug) {
  return mapProduct(await api.get(`/products/${slug}`));
}
export async function getNewArrivals(limit = 12) {
  const data = await api.get("/products", { params: { sort: "newest", pageSize: limit } });
  return (data.items || []).map(mapProduct);
}

// Admin writes (multipart for images)
export async function createProduct(fields, files = []) {
  const fd = toFormData(fields, files);
  return api.upload("/products", fd, "POST");
}
export async function updateProduct(id, fields, files = []) {
  const fd = toFormData(fields, files);
  return api.upload(`/products/${id}`, fd, "PUT");
}
export async function deleteProduct(id) {
  return api.del(`/products/${id}`);
}

function toFormData(fields, files) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v == null) return;
    if (k === "colors") fd.append("colors", JSON.stringify(v));       // array of {name,hex}
    else if (Array.isArray(v)) fd.append(k, v.join(","));             // sizes, tags
    else fd.append(k, v);
  });
  files.forEach((f) => fd.append("images", f));                       // File objects
  return fd;
}

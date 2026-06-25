import { api } from "./apiClient";
import { mapBanner, mapCollection, mapStore } from "./mappers";

// ===== Public reads (storefront) =====
export const getBanners = async () => (await api.get("/banners")).items.map(mapBanner);
export const getCollections = async () => (await api.get("/collections")).items.map(mapCollection);
export const getStores = async () => (await api.get("/stores")).items.map(mapStore);

// ===== Admin reads (include inactive) =====
export const getBannersAdmin = async () => (await api.get("/banners/all")).items.map(mapBanner);
export const getCollectionsAdmin = async () => (await api.get("/collections/all")).items.map(mapCollection);

// ===== Admin writes (multipart when a file is provided) =====
function toFormData(body, file) {
  const fd = new FormData();
  Object.entries(body || {}).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
  if (file) fd.append("image", file);
  return fd;
}

export function createBanner(body, file) {
  if (file) return api.upload("/banners", toFormData(body, file), "POST");
  return api.post("/banners", body);
}
export function updateBanner(id, body, file) {
  if (file) return api.upload(`/banners/${id}`, toFormData(body, file), "PUT");
  return api.put(`/banners/${id}`, body);
}
export const deleteBanner = (id) => api.del(`/banners/${id}`);

export function createCollection(body, file) {
  if (file) return api.upload("/collections", toFormData(body, file), "POST");
  return api.post("/collections", body);
}
export function updateCollection(id, body, file) {
  if (file) return api.upload(`/collections/${id}`, toFormData(body, file), "PUT");
  return api.put(`/collections/${id}`, body);
}
export const deleteCollection = (id) => api.del(`/collections/${id}`);

export const createStore = (s) => api.post("/stores", s);

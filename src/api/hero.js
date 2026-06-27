import { api } from "./apiClient";

const mapSlide = (s) => ({
  id: s.id,
  title: s.title || "",
  subtitle: s.subtitle || "",
  buttonText: s.button_text || "",
  link: s.link || "",
  image: s.image,
  position: s.position ?? 0,
  isActive: s.is_active !== false,
});

// Public (storefront)
export const getHeroSlides = async () => (await api.get("/hero")).items.map(mapSlide);
// Admin (includes inactive)
export const getHeroSlidesAdmin = async () => (await api.get("/hero/all")).items.map(mapSlide);

function toFormData(body, file) {
  const fd = new FormData();
  Object.entries(body || {}).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
  if (file) fd.append("image", file);
  return fd;
}

export function createHeroSlide(body, file) {
  if (file) return api.upload("/hero", toFormData(body, file), "POST");
  return api.post("/hero", body);
}
export function updateHeroSlide(id, body, file) {
  if (file) return api.upload(`/hero/${id}`, toFormData(body, file), "PUT");
  return api.put(`/hero/${id}`, body);
}
export const deleteHeroSlide = (id) => api.del(`/hero/${id}`);
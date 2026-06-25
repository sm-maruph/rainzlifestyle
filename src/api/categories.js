import { api } from "./apiClient";

const byPos = (a, b) => (a.position || 0) - (b.position || 0);

// Raw tree WITH ids — used by AdminCategories and the product form.
// Also exposes `category_groups` as an alias of `groups` for AdminProducts.
export async function getCategoriesRaw() {
  const data = await api.get("/categories");
  const arr = Array.isArray(data) ? data : data.items || [];
  return arr.map((c) => {
    const groups = (c.groups || c.category_groups || [])
      .slice()
      .sort(byPos)
      .map((g) => ({
        id: g.id,
        title: g.title,
        subcategories: (g.subcategories || []).slice().sort(byPos).map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
      }));
    return { id: c.id, name: c.name, slug: c.slug, accent: c.accent, image: c.image || null, groups, category_groups: groups };
  });
}

// Navbar / product-tree shape (subcategory names only).
export async function getCategories() {
  const raw = await getCategoriesRaw();
  return raw.map((c) => ({
    name: c.name,
    slug: c.slug,
    accent: c.accent,
    image: c.image || null,
    groups: c.groups.map((g) => ({ title: g.title, items: g.subcategories.map((s) => s.name) })),
  }));
}

// Category CRUD
export function createCategory(body, file) {
  if (file) return api.upload("/categories", toCategoryFormData(body, file), "POST");
  return api.post("/categories", body);
}
export function updateCategory(id, body, file) {
  if (file) return api.upload(`/categories/${id}`, toCategoryFormData(body, file), "PUT");
  return api.put(`/categories/${id}`, body);
}
function toCategoryFormData(body, file) {
  const fd = new FormData();
  Object.entries(body || {}).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
  if (file) fd.append("image", file);
  return fd;
}
export const deleteCategory = (id) => api.del(`/categories/${id}`);

// Group CRUD
export const createCategoryGroup = (body) => api.post("/categories/groups", body);
export const updateCategoryGroup = (id, body) => api.put(`/categories/groups/${id}`, body);
export const deleteCategoryGroup = (id) => api.del(`/categories/groups/${id}`);

// Subcategory CRUD
export const createSubcategory = (body) => api.post("/categories/subcategories", body);
export const deleteSubcategory = (id) => api.del(`/categories/subcategories/${id}`);

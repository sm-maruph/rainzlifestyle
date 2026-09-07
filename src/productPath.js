// Shared by the storefront and the sitemap generator.
function productPath(product) {
  const slug = product?.slug;
  if (!slug) return "/men";
  const category = product.category_slug || product.category;
  const subcategory = product.subcategory_slug || product.subcategory;
  const segment = (value) => encodeURIComponent(String(value));
  // Older saved carts may contain only a slug. The legacy route resolves it
  // from the API and replaces the URL with the current category path.
  if (!category) return `/product/${segment(slug)}`;
  return `/${segment(category)}/${segment(subcategory || "uncategorized")}/${segment(slug)}`;
}
module.exports = { productPath };

// Reshape API rows (snake_case) into the shapes your components use.
const num = (n) => Number(n || 0);

export function mapProduct(p) {
  if (!p) return null;
  return {
    id: p.id, slug: p.slug, name: p.name, brand: p.brand, description: p.description,
    category: p.category_slug || p.category, categoryName: p.category_name,
    subcategory: p.subcategory_slug, subcategoryName: p.subcategory_name,
    price: num(p.price), oldPrice: p.old_price != null ? num(p.old_price) : null,
    currency: p.currency || "BDT", rating: p.rating || 0, reviews: p.reviews_count || 0,
    inStock: p.in_stock ?? (p.stock > 0), stock: p.stock,
    sizes: p.sizes || [], colors: p.colors || [], tags: p.tags || [],
    image: p.image, images: p.images && p.images.length ? p.images : p.image ? [p.image] : [],
    onSale: !!p.on_sale, saleEnds: p.sale_ends || null, saleCampaign: p.sale_campaign || null,
    createdAt: p.created_at,
  };
}

export function mapOrder(o) {
  if (!o) return null;
  return {
    id: o.order_code || o.id, rawId: o.id, customer: o.customer_name, phone: o.customer_phone,
    city: o.city, address: o.address, date: o.created_at ? new Date(o.created_at) : null,
    items: (o.order_items || o.items || []).map((it) => ({
      id: it.product_id, name: it.name, image: it.image,
      price: num(it.price), size: it.size, color: it.color, qty: it.qty,
    })),
    subtotal: num(o.subtotal), delivery: num(o.delivery_charge), total: num(o.total),
    payment: o.payment_method, status: o.status,
  };
}

// cart_items row: { id, size, color, qty, product:{...} }
export function mapCartItem(row) {
  const p = row.product || {};
  return {
    cartId: row.id, id: p.id, slug: p.slug, name: p.name, image: p.image,
    price: num(p.price), oldPrice: p.old_price != null ? num(p.old_price) : null,
    stock: p.stock, size: row.size, color: row.color, qty: row.qty,
  };
}

// wishlist_items row: { id, product:{...} }
export function mapWishlistItem(row) {
  return mapProduct(row.product);
}

export function mapBanner(b) {
  return { id: b.id, image: b.image, image_url: b.image, title: b.title, link: b.link, position: b.position, isActive: b.is_active };
}
export function mapCollection(c) {
  return { id: c.id, title: c.title, caption: c.caption, image: c.image, link: c.link, position: c.position, isActive: c.is_active };
}
export function mapStore(s) {
  return {
    id: s.id, name: s.name, city: s.city, address: s.address, phone: s.phone,
    hours: s.hours, lat: s.lat, lng: s.lng, image: s.image,
  };
}

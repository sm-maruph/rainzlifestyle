import { api } from "./apiClient";

// Normalizes an order row (orders + order_items) into a stable camelCase shape.
function mapOrderRow(o) {
  if (!o) return null;
  return {
    id: o.id,
    code: o.order_code || o.code,
    customerName: o.customer_name,
    phone: o.customer_phone,
    address: o.address,
    city: o.city,
    deliveryZone: o.delivery_zone,
    subtotal: Number(o.subtotal || 0),
    delivery: Number(o.delivery_charge ?? o.delivery ?? 0),
    discount: Number(o.discount || 0),
    total: Number(o.total || 0),
    couponCode: o.coupon_code || null,
    paymentMethod: o.payment_method,
    status: o.status,
    note: o.note || "",
    createdAt: o.created_at,
    items: (o.order_items || o.items || []).map((it) => ({
      id: it.id,
      productId: it.product_id,
      name: it.name,
      image: it.image,
      price: Number(it.price || 0),
      size: it.size || null,
      color: it.color || null,
      qty: Number(it.qty || 1),
    })),
  };
}

// Place an order (guest or logged-in).
export async function placeOrder(payload) {
  return api.post("/orders", payload); // -> { order_code, subtotal, delivery, discount, total }
}

export async function trackOrder(code) {
  return mapOrderRow(await api.get(`/orders/track/${code}`));
}

// Admin
export async function getOrders() {
  const data = await api.get("/orders");
  return (data.items || []).map(mapOrderRow);
}
export async function updateOrderStatus(id, status) {
  return api.patch(`/orders/${id}/status`, { status });
}

// ---- My Orders ----------------------------------------------------------

// Logged-in customer's own orders
export async function getMyOrders() {
  const data = await api.get("/orders/mine");
  return (data.items || []).map(mapOrderRow);
}

// Guests have no account, so we remember the order codes they placed on this
// device and look each one up via the public track endpoint.
const GUEST_KEY = "rainz_guest_orders";

export function rememberGuestOrder(code) {
  if (!code) return;
  try {
    const list = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    if (!list.includes(code)) {
      list.unshift(code);
      localStorage.setItem(GUEST_KEY, JSON.stringify(list.slice(0, 30)));
    }
  } catch { /* ignore */ }
}

export function getGuestOrderCodes() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); }
  catch { return []; }
}

export function clearGuestOrders() {
  try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
}

// Fetch full details for every remembered guest order code
export async function getGuestOrders() {
  const codes = getGuestOrderCodes();
  if (!codes.length) return [];
  const results = await Promise.all(
    codes.map((c) => trackOrder(c).catch(() => null))
  );
  return results.filter(Boolean);
}

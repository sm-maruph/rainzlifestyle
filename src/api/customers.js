import { api } from "./apiClient";

const parse = (c) => ({
  ...c,
  joinedDate: c.joined ? new Date(c.joined) : null,
  lastOrderDate: c.lastOrder ? new Date(c.lastOrder) : null,
  firstOrderDate: c.firstOrder ? new Date(c.firstOrder) : null,
  orders: (c.orders || []).map((o) => ({ ...o, dateObj: o.date ? new Date(o.date) : null })),
});

// Admin: registered customers (profiles) + guest groups (orders without an account)
export async function getCustomers() {
  const data = await api.get("/customers");
  return {
    registered: (data.items || []).map(parse),
    guests: (data.guests || []).map(parse),
  };
}

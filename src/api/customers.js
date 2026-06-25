import { api } from "./apiClient";

// Admin: customers (profiles) with aggregated order stats
export async function getCustomers() {
  const data = await api.get("/customers");
  return (data.items || []).map((c) => ({
    ...c,
    joinedDate: c.joined ? new Date(c.joined) : null,
    lastOrderDate: c.lastOrder ? new Date(c.lastOrder) : null,
    orders: (c.orders || []).map((o) => ({ ...o, dateObj: o.date ? new Date(o.date) : null })),
  }));
}
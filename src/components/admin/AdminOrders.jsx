// src/components/admin/AdminOrders.jsx — wired to the real API
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getOrders, updateOrderStatus } from "../../api";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_STYLE = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-violet-50 text-violet-700",
  Shipped: "bg-blue-50 text-blue-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-600",
};
const PAY_LABEL = { cod: "Cash on Delivery", bkash: "bKash", nagad: "Nagad", sslcommerz: "Card / Online" };
const payLabel = (m) => PAY_LABEL[m] || m || "—";
const zoneLabel = (z) => (z === "inside_dhaka" ? "Inside Dhaka" : z === "outside_dhaka" ? "Outside Dhaka" : "—");
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x48/f3f4f6/9ca3af?text=R"; };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [openId, setOpenId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setLoading(true);
    getOrders()
      .then((list) => setOrders(list))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = { All: orders.length };
    STATUSES.forEach((s) => (c[s] = orders.filter((o) => o.status === s).length));
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "All" && o.status !== tab) return false;
      if (q && !`${o.code} ${o.customerName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, tab, search]);

  const changeStatus = async (order, status) => {
    const prev = order.status;
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
    setSavingId(order.id);
    setError("");
    try {
      await updateOrderStatus(order.id, status);
    } catch (e) {
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: prev } : o))); // revert
      setError(e.message || "Could not update status");
    } finally {
      setSavingId(null);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return "—"; }
  };
  const itemCount = (o) => o.items.reduce((n, it) => n + it.qty, 0);
  const openOrder = orders.find((o) => o.id === openId) || null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${orders.length} orders`}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center rounded-lg border border-gray-200 px-3 bg-white focus-within:border-gray-400 flex-1 sm:w-72">
            <SearchIcon style={{ fontSize: 18, color: "#9ca3af" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order code or customer" className="flex-1 min-w-0 px-2 py-2.5 text-sm outline-none bg-transparent" />
          </div>
          <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh"><RefreshIcon style={{ fontSize: 18 }} /></button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {["All", ...STATUSES].map((s) => {
          const active = tab === s;
          return (
            <button key={s} onClick={() => setTab(s)} className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
              style={active ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
              {s} <span className={active ? "text-white/80" : "text-gray-400"}>({counts[s] ?? 0})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50"><td className="py-3 px-4" colSpan={8}><div className="h-9 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No orders found.</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-800">#{o.code}</td>
                    <td className="py-3 px-4">
                      <p className="text-gray-800">{o.customerName}</p>
                      <p className="text-xs text-gray-400">{o.city || zoneLabel(o.deliveryZone)}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{fmtDate(o.createdAt)}</td>
                    <td className="py-3 px-4 text-gray-600">{itemCount(o)}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{taka(o.total)}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{payLabel(o.paymentMethod)}</td>
                    <td className="py-3 px-4">
                      <select value={o.status} disabled={savingId === o.id} onChange={(e) => changeStatus(o, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 outline-none cursor-pointer border-0 ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setOpenId(o.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="View details"><VisibilityOutlinedIcon style={{ fontSize: 19 }} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Order detail modal ===== */}
      {openOrder && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order #{openOrder.code}</h3>
                <p className="text-xs text-gray-400">{fmtDate(openOrder.createdAt)}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[openOrder.status] || "bg-gray-100 text-gray-600"}`}>{openOrder.status}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Update status:</span>
                  <select value={openOrder.status} disabled={savingId === openOrder.id} onChange={(e) => changeStatus(openOrder, e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-semibold text-gray-800">{openOrder.customerName}</p>
                  <p className="text-gray-500">{openOrder.phone}</p>
                  <p className="mt-2 flex items-start gap-1.5 text-gray-600"><LocationOnOutlinedIcon style={{ fontSize: 16, color: "#9ca3af" }} /> {openOrder.address}{openOrder.city ? `, ${openOrder.city}` : ""}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Payment</p>
                  <p className="font-semibold text-gray-800">{payLabel(openOrder.paymentMethod)}</p>
                  <p className="text-gray-500 mt-2">Delivery: {zoneLabel(openOrder.deliveryZone)}</p>
                  {openOrder.couponCode && <p className="text-gray-500 mt-1">Coupon: {openOrder.couponCode}</p>}
                  {openOrder.note && <p className="text-gray-500 mt-1">Note: {openOrder.note}</p>}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</p>
                <div className="space-y-3">
                  {openOrder.items.map((it, i) => (
                    <div key={it.id || i} className="flex gap-3 items-center">
                      <img src={it.image} alt={it.name} className="h-12 w-10 rounded object-cover bg-gray-100" onError={imgFallback} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{it.name}</p>
                        <p className="text-xs text-gray-400">{[it.size, it.color].filter(Boolean).join(" • ")}{(it.size || it.color) ? " • " : ""}Qty {it.qty}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{taka(it.price * it.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{taka(openOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{taka(openOrder.delivery)}</span></div>
                {openOrder.discount > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span>- {taka(openOrder.discount)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 pt-1 text-base"><span>Total</span><span>{taka(openOrder.total)}</span></div>
              </div>
            </div>

            <div className="flex justify-end px-5 py-4 border-t border-gray-100">
              <button onClick={() => setOpenId(null)} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

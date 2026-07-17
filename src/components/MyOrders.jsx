// src/components/MyOrders.jsx — customer order history (logged-in via API, guests via saved codes)
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { getMyOrders, getGuestOrders } from "../api";
import { useAuth } from "../context/AuthContext";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x150/f3f4f6/9ca3af?text=RAINZ"; };

const STATUS_STYLE = {
  Pending:    { bg: "#FEF3C7", color: "#92400E" },
  Processing: { bg: "#DBEAFE", color: "#1E40AF" },
  Shipped:    { bg: "#E0E7FF", color: "#3730A3" },
  Delivered:  { bg: "#D1FAE5", color: "#065F46" },
  Cancelled:  { bg: "#FEE2E2", color: "#991B1B" },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#F3F4F6", color: "#374151" };
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const itemCount = order.items.reduce((s, it) => s + (it.qty || 1), 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">#{order.code}</span>
            <StatusPill status={order.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {fmtDate(order.createdAt)} · {itemCount} item{itemCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-gray-900">{taka(order.total)}</span>
          <ExpandMoreIcon
            style={{ fontSize: 20, color: "#9ca3af", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
          />
        </div>
      </button>

      {/* Details */}
      {open && (
        <div className="border-t border-gray-100 p-3 sm:p-4 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {order.items.map((it, i) => (
              <div key={it.id ?? i} className="flex gap-3">
                <img src={it.image} alt={it.name} className="h-16 w-14 rounded object-cover bg-gray-100 shrink-0" onError={imgFallback} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{it.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {[it.size, it.color].filter(Boolean).join(" • ")}{(it.size || it.color) ? " • " : ""}Qty {it.qty || 1}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">{taka(it.price * (it.qty || 1))}</p>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-0.5">Delivery to</p>
            <p>{order.customerName} · {order.phone}</p>
            <p className="mt-0.5">{order.address}{order.city ? `, ${order.city}` : ""}</p>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
            <div className="flex justify-between gap-2 text-gray-600"><span>Subtotal</span><span className="shrink-0">{taka(order.subtotal)}</span></div>
            <div className="flex justify-between gap-2 text-gray-600"><span>Delivery</span><span className="shrink-0">{taka(order.delivery)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between gap-2 text-green-600">
                <span className="min-w-0 truncate">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className="shrink-0">− {taka(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between gap-2 text-base font-bold text-gray-900 pt-1.5 border-t border-gray-100">
              <span>Total</span><span className="shrink-0">{taka(order.total)}</span>
            </div>
          </div>

          <Link
            to={`/track-order?code=${order.code}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold no-underline"
            style={{ color: BRAND }}
          >
            <LocalShippingOutlinedIcon style={{ fontSize: 17 }} /> Track this order
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth() || {};
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    let alive = true;
    setLoading(true);
    setError("");

    const load = user ? getMyOrders() : getGuestOrders();
    load
      .then((list) => alive && setOrders(list || []))
      .catch((e) => alive && setError(e.message || "Could not load your orders."))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [user, authLoading]);

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-5 sm:py-8 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Link to="/" className="no-underline px-1.5 py-0.5 rounded" style={{ color: "var(--title)" }}>Home</Link>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>My Orders</span>
      </nav>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">My Orders</h1>
      <p className="text-sm text-gray-500 mb-5">
        {user ? "All orders placed with your account." : "Orders you placed on this device."}
      </p>

      {error && <div className="mb-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {loading || authLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-gray-100 bg-white">
          <ReceiptLongOutlinedIcon style={{ fontSize: 52, color: "#d1d5db" }} />
          <p className="mt-2 font-semibold text-gray-800">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500 px-4">
            {user
              ? "When you place an order it will show up here."
              : "Orders you place while signed out are remembered on this device only."}
          </p>

          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3 px-4">
            <Link to="/new-arrivals" className="rounded-full px-6 py-2.5 text-sm font-semibold text-white text-center no-underline" style={{ backgroundColor: BRAND }}>
              Start Shopping
            </Link>
            {!user && (
              <button onClick={() => navigate("/login")} className="rounded-full border-2 px-6 py-2.5 text-sm font-semibold" style={{ borderColor: BRAND, color: BRAND }}>
                Sign in to see all orders
              </button>
            )}
          </div>

          {!user && (
            <p className="mt-5 text-xs text-gray-400 px-4">
              Have an order code?{" "}
              <Link to="/track-order" className="font-semibold no-underline" style={{ color: BRAND }}>Track it here</Link>
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Guest hint */}
          {!user && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800">
              You're browsing as a guest — only orders placed on this device are shown.{" "}
              <button onClick={() => navigate("/login")} className="font-bold underline">Sign in</button> to see all your orders anywhere.
            </div>
          )}

          <div className="space-y-3">
            {orders.map((o) => <OrderCard key={o.code ?? o.id} order={o} />)}
          </div>
        </>
      )}
    </div>
  );
}

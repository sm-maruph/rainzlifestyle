// src/components/TrackOrder.jsx — wired to real trackOrder(code)
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { trackOrder } from "../api";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x150/f3f4f6/9ca3af?text=RAINZ"; };

const PAY_LABEL = { cod: "Cash on Delivery", bkash: "bKash", nagad: "Nagad", sslcommerz: "Card / Online" };
const payLabel = (m) => PAY_LABEL[m] || m || "—";

// Real order lifecycle (matches your order_status enum)
const FLOW = ["Pending", "Processing", "Shipped", "Delivered"];
const STEPS = [
  { key: "Pending", label: "Order Placed", icon: ReceiptLongOutlinedIcon },
  { key: "Processing", label: "Processing", icon: Inventory2OutlinedIcon },
  { key: "Shipped", label: "Shipped", icon: LocalShippingOutlinedIcon },
  { key: "Delivered", label: "Delivered", icon: HomeOutlinedIcon },
];

const fmtDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return "—"; }
};
const addDays = (iso, n) => { try { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString(); } catch { return null; } };

function Timeline({ currentStep }) {
  return (
    <div>
      {STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        const Icon = step.icon;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex gap-3 sm:gap-4 min-h-[54px] sm:min-h-[58px]">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: done ? BRAND : "#e5e7eb", color: done ? "#fff" : "#9ca3af" }}>
                <Icon style={{ fontSize: 18 }} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: i < currentStep ? BRAND : "#e5e7eb" }} />}
            </div>
            <div className="pb-4">
              <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
              {active && <p className="text-xs font-medium mt-0.5" style={{ color: BRAND }}>Current status</p>}
              {done && !active && <p className="text-xs text-gray-400 mt-0.5">Completed</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackOrder() {
  const location = useLocation();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async (id) => {
    const code = (id || "").trim();
    if (!code) { setError("Please enter an order ID."); return; }
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const data = await trackOrder(code);
      if (!data) { setError("Order not found. Please check the code and try again."); }
      else setOrder(data);
    } catch (e) {
      setError(e.message && /not found|404/i.test(e.message) ? "Order not found. Please check the code and try again." : (e.message || "Could not fetch this order."));
    } finally {
      setLoading(false);
    }
  };

  // Auto-track from ?code=RZ... (Checkout success links here)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code) { setOrderId(code); track(code); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const submit = (e) => { e.preventDefault(); track(orderId); };

  const isCancelled = order?.status === "Cancelled";
  const currentStep = order ? Math.max(0, FLOW.indexOf(order.status)) : 0;
  const eta = order ? addDays(order.createdAt, 3) : null;

  return (
    <div className="w-[92%] sm:w-[94%] max-w-[1000px] mx-auto py-6 sm:py-8">
      <nav className="text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>Orders</span>
      </nav>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">Track Your Order</h1>
      <p className="mt-1 text-sm text-gray-500">Enter your order ID to see its current status.</p>

      <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <div className="flex-1 min-w-0 flex items-center rounded-md border border-gray-200 px-3 focus-within:border-gray-400">
          <ReceiptLongOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. RZ482193" className="flex-1 min-w-0 bg-transparent px-2 py-2.5 text-sm outline-none uppercase" />
        </div>
        <button type="submit" className="shrink-0 w-full sm:w-auto rounded-md px-5 py-2.5 sm:py-0 text-sm font-semibold text-white flex items-center justify-center gap-1" style={{ backgroundColor: BRAND }}>
          <SearchIcon style={{ fontSize: 18 }} /> Track
        </button>
      </form>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="md:col-span-1 h-72 sm:h-80 bg-gray-100 rounded-xl animate-pulse" />
          <div className="md:col-span-2 h-72 sm:h-80 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : order ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Timeline / status */}
          <div className="md:col-span-1">
            <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-base font-bold text-gray-900 break-all">#{order.code}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: isCancelled ? "#dc2626" : BRAND }}>
                  {order.status}
                </span>
              </div>

              {isCancelled ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-4">
                  <CancelOutlinedIcon /> <span className="text-sm font-semibold">This order was cancelled.</span>
                </div>
              ) : (
                <Timeline currentStep={currentStep} />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-5">
            <div className="rounded-xl border border-gray-200 p-4 sm:p-5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Placed on</p>
                <p className="font-semibold text-gray-800">{fmtDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{order.status === "Delivered" ? "Delivered" : "Estimated delivery"}</p>
                <p className="font-semibold text-gray-800">{order.status === "Delivered" ? "Completed" : fmtDate(eta)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="font-semibold text-gray-800">{payLabel(order.paymentMethod)}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-xs text-gray-500">Delivery address</p>
                <p className="font-semibold text-gray-800 break-words">{order.address}{order.city ? `, ${order.city}` : ""} • {order.phone}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Items</h2>
              <div className="space-y-3">
                {order.items.map((it, i) => (
                  <div key={it.id || i} className="flex gap-3">
                    <img src={it.image} alt={it.name} className="h-16 w-14 shrink-0 rounded object-cover bg-gray-100" onError={imgFallback} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{it.name}</p>
                      <p className="text-xs text-gray-500 truncate">{[it.size, it.color].filter(Boolean).join(" • ")}{(it.size || it.color) ? " • " : ""}Qty {it.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">{taka(it.price * it.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{taka(order.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{taka(order.delivery)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span>- {taka(order.discount)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 pt-1"><span>Total</span><span>{taka(order.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
  function Crumb({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`no-underline px-1.5 py-0.5 rounded transition-colors ${className}`}
      style={{ color: "var(--title)" }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--button)"; e.currentTarget.style.color = "var(--button-text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--title)"; }}
    >
      {children}
    </Link>
  );
}
}

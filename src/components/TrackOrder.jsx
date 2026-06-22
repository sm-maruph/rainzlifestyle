// src/components/TrackOrder.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { getNewArrivals } from "../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "https://placehold.co/120x150/f3f4f6/9ca3af?text=RAINZ";
};

const STEPS = [
  { key: "placed", label: "Order Placed", icon: ReceiptLongOutlinedIcon },
  { key: "confirmed", label: "Confirmed", icon: CheckCircleOutlineIcon },
  { key: "packed", label: "Packed", icon: Inventory2OutlinedIcon },
  { key: "shipped", label: "Shipped", icon: LocalShippingOutlinedIcon },
  { key: "out", label: "Out for Delivery", icon: TwoWheelerOutlinedIcon },
  { key: "delivered", label: "Delivered", icon: HomeOutlinedIcon },
];

const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Build a dummy order for any id (until the backend exists)
async function fetchDummyOrder(id) {
  const products = await getNewArrivals(2);
  const items = products.map((p, i) => ({
    ...p,
    size: p.sizes?.[i] || "M",
    color: p.colors?.[0]?.name || "Black",
    qty: i + 1,
  }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const delivery = 80;
  // Pick a "current step" deterministically from the id so it varies but stays stable
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const currentStep = 2 + (hash % 3); // packed → shipped → out for delivery
  const placed = new Date();
  placed.setDate(placed.getDate() - 2);
  const eta = new Date();
  eta.setDate(eta.getDate() + 2);

  return {
    id,
    placedDate: placed,
    eta,
    currentStep,
    items,
    subtotal,
    delivery,
    total: subtotal + delivery,
    payment: "Cash on Delivery",
    address: "House 12, Road 5, Mirpur, Dhaka",
    phone: "01XXXXXXXXX",
  };
}

function Timeline({ currentStep }) {
  return (
    <div>
      {STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        const Icon = step.icon;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex gap-4 min-h-[58px]">
            <div className="flex flex-col items-center">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ backgroundColor: done ? BRAND : "#e5e7eb", color: done ? "#fff" : "#9ca3af" }}
              >
                <Icon style={{ fontSize: 18 }} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: i < currentStep ? BRAND : "#e5e7eb" }} />
              )}
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
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("RZ482193");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const track = async (id) => {
    const code = (id || "").trim();
    if (!code) {
      setError("Please enter an order ID.");
      return;
    }
    setError("");
    setLoading(true);
    const data = await fetchDummyOrder(code);
    setOrder(data);
    setLoading(false);
  };

  // Auto-load the demo order on mount
  useEffect(() => {
    track("RZ482193");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    track(orderId);
  };

  return (
    <div className="w-[94%] max-w-[1000px] mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Track Your Order</h1>
      <p className="mt-1 text-sm text-gray-500">Enter your order ID to see its current status.</p>

      {/* Search */}
      <form onSubmit={submit} className="mt-5 flex gap-2 max-w-md">
        <div className="flex-1 flex items-center rounded-md border border-gray-200 px-3 focus-within:border-gray-400">
          <ReceiptLongOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. RZ482193"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none uppercase"
          />
        </div>
        <button type="submit" className="rounded-md px-5 text-sm font-semibold text-white flex items-center gap-1" style={{ backgroundColor: BRAND }}>
          <SearchIcon style={{ fontSize: 18 }} /> Track
        </button>
      </form>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {loading ? (
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-80 bg-gray-100 rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : order ? (
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-base font-bold text-gray-900">#{order.id}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  {STEPS[order.currentStep].label}
                </span>
              </div>
              <Timeline currentStep={order.currentStep} />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Meta */}
            <div className="rounded-xl border border-gray-200 p-5 grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Placed on</p>
                <p className="font-semibold text-gray-800">{fmtDate(order.placedDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated delivery</p>
                <p className="font-semibold text-gray-800">{fmtDate(order.eta)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="font-semibold text-gray-800">{order.payment}</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-xs text-gray-500">Delivery address</p>
                <p className="font-semibold text-gray-800">{order.address} • {order.phone}</p>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Items</h2>
              <div className="space-y-3">
                {order.items.map((it, i) => (
                  <div key={i} className="flex gap-3">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-16 w-14 rounded object-cover bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/product/${it.slug}`)}
                      onError={imgFallback}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{it.name}</p>
                      <p className="text-xs text-gray-500">{[it.size, it.color].filter(Boolean).join(" • ")} • Qty {it.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{taka(it.price * it.qty)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{taka(order.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{taka(order.delivery)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 pt-1"><span>Total</span><span>{taka(order.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

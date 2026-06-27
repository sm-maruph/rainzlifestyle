// src/components/admin/AdminDashboard.jsx — rich analytics: date filters w/ comparison, curve chart, insights
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import { getProducts, getOrders, getCustomers } from "../../api";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

const STATUS_STYLE = {
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-violet-50 text-violet-700",
  Pending: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-600",
};
const PENDING_STATUSES = ["Pending", "Processing", "Shipped"]; // placed, not delivered, not cancelled

const QUICK = [
  { to: "/admin/products", label: "Add Product", icon: AddOutlinedIcon },
  { to: "/admin/hero", label: "Hero Banners", icon: ViewCarouselOutlinedIcon },
  { to: "/admin/collections", label: "Collections", icon: CollectionsOutlinedIcon },
  { to: "/admin/discounts", label: "Create Discount", icon: LocalOfferOutlinedIcon },
  { to: "/admin/sale", label: "Setup Sale", icon: SellOutlinedIcon },
  { to: "/admin/orders", label: "Manage Orders", icon: ReceiptLongOutlinedIcon },
];

// ---------- date range helpers ----------
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function getRange(key) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  switch (key) {
    case "today": {
      const s = startOfDay(now), e = endOfDay(now);
      return { start: s, end: e, prevStart: startOfDay(addDays(now, -1)), prevEnd: endOfDay(addDays(now, -1)), label: "Today", prevLabel: "yesterday" };
    }
    case "yesterday": {
      const yd = addDays(now, -1);
      return { start: startOfDay(yd), end: endOfDay(yd), prevStart: startOfDay(addDays(now, -2)), prevEnd: endOfDay(addDays(now, -2)), label: "Yesterday", prevLabel: "day before" };
    }
    case "thisWeek": {
      const day = now.getDay(); const monday = addDays(now, day === 0 ? -6 : 1 - day);
      const s = startOfDay(monday);
      return { start: s, end: endOfDay(now), prevStart: startOfDay(addDays(s, -7)), prevEnd: endOfDay(addDays(s, -1)), label: "This week", prevLabel: "last week" };
    }
    case "thisMonth": {
      const s = new Date(y, m, 1); return { start: startOfDay(s), end: endOfDay(now), prevStart: startOfDay(new Date(y, m - 1, 1)), prevEnd: endOfDay(new Date(y, m, 0)), label: "This month", prevLabel: "last month" };
    }
    case "prevMonth": {
      const s = new Date(y, m - 1, 1), e = new Date(y, m, 0); return { start: startOfDay(s), end: endOfDay(e), prevStart: startOfDay(new Date(y, m - 2, 1)), prevEnd: endOfDay(new Date(y, m - 1, 0)), label: "Previous month", prevLabel: "month before" };
    }
    case "thisQuarter": {
      const q = Math.floor(m / 3); const s = new Date(y, q * 3, 1); return { start: startOfDay(s), end: endOfDay(now), prevStart: startOfDay(new Date(y, q * 3 - 3, 1)), prevEnd: endOfDay(new Date(y, q * 3, 0)), label: "This quarter", prevLabel: "last quarter" };
    }
    case "lastQuarter": {
      const q = Math.floor(m / 3); const s = new Date(y, q * 3 - 3, 1), e = new Date(y, q * 3, 0); return { start: startOfDay(s), end: endOfDay(e), prevStart: startOfDay(new Date(y, q * 3 - 6, 1)), prevEnd: endOfDay(new Date(y, q * 3 - 3, 0)), label: "Last quarter", prevLabel: "quarter before" };
    }
    case "thisYear": {
      const s = new Date(y, 0, 1); return { start: startOfDay(s), end: endOfDay(now), prevStart: startOfDay(new Date(y - 1, 0, 1)), prevEnd: endOfDay(new Date(y - 1, 11, 31)), label: "This year", prevLabel: "last year" };
    }
    case "lastYear": {
      const s = new Date(y - 1, 0, 1), e = new Date(y - 1, 11, 31); return { start: startOfDay(s), end: endOfDay(e), prevStart: startOfDay(new Date(y - 2, 0, 1)), prevEnd: endOfDay(new Date(y - 2, 11, 31)), label: "Last year", prevLabel: "year before" };
    }
    default:
      return { start: null, end: null, prevStart: null, prevEnd: null, label: "All time", prevLabel: null };
  }
}

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "thisWeek", label: "This week" },
  { key: "thisMonth", label: "This month" },
  { key: "prevMonth", label: "Prev month" },
  { key: "thisQuarter", label: "This quarter" },
  { key: "lastQuarter", label: "Last quarter" },
  { key: "thisYear", label: "This year" },
  { key: "lastYear", label: "Last year" },
  { key: "all", label: "All time" },
];

const inRange = (date, start, end) => {
  if (!date) return false;
  const t = new Date(date).getTime();
  if (start && t < start.getTime()) return false;
  if (end && t > end.getTime()) return false;
  return true;
};

function Delta({ curr, prev }) {
  if (prev === null || prev === undefined) return null;
  if (prev === 0 && curr === 0) return <span className="text-xs text-gray-400">—</span>;
  const pct = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <TrendingUpIcon style={{ fontSize: 14 }} /> : <TrendingDownIcon style={{ fontSize: 14 }} />}
      {Math.abs(pct)}%
    </span>
  );
}

function StatCard({ icon: Icon, label, value, loading, curr, prev, prevLabel, accent = BRAND }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}14`, color: accent }}>
          <Icon style={{ fontSize: 22 }} />
        </span>
        {!loading && curr !== undefined && <Delta curr={curr} prev={prev} />}
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900">{loading ? "…" : value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {!loading && prevLabel && prev !== null && prev !== undefined && (
        <p className="text-[11px] text-gray-400 mt-0.5">vs {prevLabel}</p>
      )}
    </div>
  );
}

// ---------- smooth SVG line chart ----------
function CurveChart({ points }) {
  const W = 640, H = 200, pad = 28;
  const max = Math.max(1, ...points.map((p) => p.v));
  const stepX = points.length > 1 ? (W - pad * 2) / (points.length - 1) : 0;
  const xy = points.map((p, i) => [pad + i * stepX, H - pad - (p.v / max) * (H - pad * 2)]);

  // Catmull-Rom -> cubic bezier for a smooth curve
  const path = xy.map((pt, i, a) => {
    if (i === 0) return `M ${pt[0]},${pt[1]}`;
    const [x0, y0] = a[i - 1];
    const [x1, y1] = pt;
    const cx = (x0 + x1) / 2;
    return `C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }).join(" ");
  const area = `${path} L ${xy[xy.length - 1][0]},${H - pad} L ${xy[0][0]},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rz-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.25" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={H - pad - g * (H - pad * 2)} y2={H - pad - g * (H - pad * 2)} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#rz-fill)" />
      <path d={path} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" />
      {xy.map((pt, i) => (
        <g key={i}>
          <circle cx={pt[0]} cy={pt[1]} r="3" fill="#fff" stroke={BRAND} strokeWidth="2" />
          <title>{`${points[i].label}: ${taka(points[i].v)}`}</title>
        </g>
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [allProductsCount, setAllProductsCount] = useState(null);
  const [latestProducts, setLatestProducts] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeKey, setRangeKey] = useState("thisMonth");

  useEffect(() => {
    let alive = true;
    Promise.all([
      getOrders().catch(() => []),
      getProducts({ pageSize: 5 }).catch(() => ({ items: [], total: 0 })),
      getCustomers().catch(() => ({ registered: [], guests: [] })),
    ]).then(([ord, prods, custs]) => {
      if (!alive) return;
      setOrders(ord || []);
      setAllProductsCount(prods.total ?? (prods.items || []).length);
      setLatestProducts((prods.items || []).slice(0, 5));
      setRegistered(custs.registered || []);
      setGuests(custs.guests || []);
    }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const range = useMemo(() => getRange(rangeKey), [rangeKey]);

  // orders within current & previous window
  const curOrders = useMemo(() => orders.filter((o) => (range.start ? inRange(o.createdAt, range.start, range.end) : true)), [orders, range]);
  const prevOrders = useMemo(() => (range.prevStart ? orders.filter((o) => inRange(o.createdAt, range.prevStart, range.prevEnd)) : null), [orders, range]);

  const sumPaid = (list) => (list || []).filter((o) => o.status !== "Cancelled").reduce((s, o) => s + Number(o.total || 0), 0);
  const sumPending = (list) => (list || []).filter((o) => PENDING_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total || 0), 0);

  const metrics = useMemo(() => {
    const revenue = sumPaid(curOrders);
    const pending = sumPending(curOrders);
    const delivered = curOrders.filter((o) => o.status === "Delivered").reduce((s, o) => s + Number(o.total || 0), 0);
    const count = curOrders.length;
    const aov = count ? Math.round(revenue / Math.max(1, curOrders.filter((o) => o.status !== "Cancelled").length)) : 0;
    const cancelled = curOrders.filter((o) => o.status === "Cancelled").length;
    return { revenue, pending, delivered, count, aov, cancelled };
  }, [curOrders]);

  const prevMetrics = useMemo(() => {
    if (!prevOrders) return null;
    return {
      revenue: sumPaid(prevOrders),
      pending: sumPending(prevOrders),
      count: prevOrders.length,
    };
  }, [prevOrders]);

  // status breakdown
  const statusBreak = useMemo(() => {
    const b = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    curOrders.forEach((o) => { b[o.status] = (b[o.status] || 0) + 1; });
    return b;
  }, [curOrders]);

  // top products by quantity sold (from order items in range, excl cancelled)
  const topProducts = useMemo(() => {
    const map = new Map();
    curOrders.filter((o) => o.status !== "Cancelled").forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.name || it.id || "Unknown";
        const cur = map.get(key) || { name: key, image: it.image, qty: 0, revenue: 0 };
        cur.qty += Number(it.qty || 0);
        cur.revenue += Number(it.price || 0) * Number(it.qty || 0);
        if (!cur.image && it.image) cur.image = it.image;
        map.set(key, cur);
      });
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [curOrders]);

  // chart series (revenue over time, bucketed by day for short ranges, month for long)
  const series = useMemo(() => {
    if (!curOrders.length && range.start) {
      // build empty buckets so chart isn't blank
    }
    const useMonths = ["thisYear", "lastYear", "all"].includes(rangeKey);
    const buckets = new Map();
    const keyOf = (d) => {
      const dt = new Date(d);
      return useMonths ? `${dt.getFullYear()}-${dt.getMonth()}` : dt.toDateString();
    };
    const labelOf = (d) => {
      const dt = new Date(d);
      return useMonths ? dt.toLocaleDateString("en-US", { month: "short" }) : dt.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    };
    // seed buckets across the window for continuity (short ranges only)
    if (range.start && !useMonths) {
      for (let d = new Date(range.start); d <= range.end; d = addDays(d, 1)) {
        buckets.set(d.toDateString(), { label: labelOf(d), v: 0 });
      }
    }
    curOrders.filter((o) => o.status !== "Cancelled").forEach((o) => {
      const k = keyOf(o.createdAt);
      if (!buckets.has(k)) buckets.set(k, { label: labelOf(o.createdAt), v: 0 });
      buckets.get(k).v += Number(o.total || 0);
    });
    let arr = [...buckets.values()];
    if (arr.length === 0) arr = [{ label: "", v: 0 }, { label: "", v: 0 }];
    if (arr.length === 1) arr = [{ label: "", v: 0 }, ...arr];
    return arr;
  }, [curOrders, range, rangeKey]);

  const recent = useMemo(
    () => [...curOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [curOrders]
  );

  const totalCustomers = registered.length + guests.length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">Insights for <span className="font-semibold text-gray-700">{range.label}</span></p>
        </div>
        <select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-gray-400">
          {RANGE_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {/* Primary metrics with comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={PaymentsOutlinedIcon} label="Revenue" value={taka(metrics.revenue)} loading={loading}
          curr={metrics.revenue} prev={prevMetrics?.revenue ?? null} prevLabel={range.prevLabel} />
        <StatCard icon={HourglassEmptyOutlinedIcon} label="Pending revenue" value={taka(metrics.pending)} loading={loading}
          curr={metrics.pending} prev={prevMetrics?.pending ?? null} prevLabel={range.prevLabel} accent="#D97706" />
        <StatCard icon={ReceiptLongOutlinedIcon} label="Orders" value={metrics.count.toLocaleString("en-BD")} loading={loading}
          curr={metrics.count} prev={prevMetrics?.count ?? null} prevLabel={range.prevLabel} />
        <StatCard icon={LocalShippingOutlinedIcon} label="Delivered revenue" value={taka(metrics.delivered)} loading={loading} accent="#16A34A" />
      </div>

      {/* Secondary insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={SellOutlinedIcon} label="Avg order value" value={taka(metrics.aov)} loading={loading} accent="#7C3AED" />
        <StatCard icon={Inventory2OutlinedIcon} label="Products" value={allProductsCount ?? "…"} loading={loading} accent="#0D9488" />
        <StatCard icon={PersonOutlineOutlinedIcon} label="Registered customers" value={registered.length.toLocaleString("en-BD")} loading={loading} accent="#2563EB" />
        <StatCard icon={StorefrontOutlinedIcon} label="Guest customers" value={guests.length.toLocaleString("en-BD")} loading={loading} accent="#9333EA" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Curve chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">Revenue trend</h3>
            <span className="text-xs text-gray-400">{range.label}</span>
          </div>
          {loading ? <div className="h-48 bg-gray-50 rounded animate-pulse" /> : <CurveChart points={series} />}
        </div>

        {/* Order status breakdown */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-gray-900 mb-3">Order status</h3>
          <div className="space-y-2.5">
            {Object.entries(statusBreak).map(([st, n]) => {
              const pct = metrics.count ? Math.round((n / metrics.count) * 100) : 0;
              return (
                <div key={st}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600">{st}</span>
                    <span className="text-gray-400">{n} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: st === "Cancelled" ? "#ef4444" : st === "Delivered" ? "#16a34a" : BRAND }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
        <h3 className="font-bold text-gray-900 mb-3">Quick actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-100 p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <span className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND}14`, color: BRAND }}>
                <Icon style={{ fontSize: 20 }} />
              </span>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Recent orders</h3>
            <Link to="/admin/orders" className="text-sm font-semibold" style={{ color: BRAND }}>View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 font-medium">Order</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium hidden sm:table-cell">Date</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50"><td colSpan={5} className="py-2.5"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : recent.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders in this period.</td></tr>
                ) : recent.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-semibold text-gray-800">#{o.code}</td>
                    <td className="py-2.5 text-gray-600">{o.customerName}</td>
                    <td className="py-2.5 text-gray-500 hidden sm:table-cell">{fmtDate(o.createdAt)}</td>
                    <td className="py-2.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span></td>
                    <td className="py-2.5 text-right font-semibold text-gray-800">{taka(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products by quantity */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-gray-900 mb-3">Top products <span className="text-xs font-normal text-gray-400">by qty sold</span></h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-gray-400">No sales in this period.</p>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <img src={p.image} alt={p.name} className="h-10 w-9 rounded object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x44/f3f4f6/9ca3af?text=R"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{taka(p.revenue)} revenue</p>
                </div>
                <span className="text-sm font-bold" style={{ color: BRAND }}>{p.qty} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest products */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Latest products</h3>
          <Link to="/admin/products" className="text-sm font-semibold" style={{ color: BRAND }}>Manage</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)
          ) : latestProducts.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full">No products yet.</p>
          ) : latestProducts.map((p) => (
            <Link to="/admin/products" key={p.id} className="rounded-lg border border-gray-100 p-2 hover:border-gray-300 transition-colors">
              <img src={p.image} alt={p.name} className="h-20 w-full rounded object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x96/f3f4f6/9ca3af?text=R"; }} />
              <p className="text-xs text-gray-700 truncate mt-1.5">{p.name}</p>
              <p className="text-xs font-semibold text-gray-900">{taka(p.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

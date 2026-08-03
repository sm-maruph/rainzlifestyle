// src/components/admin/AdminDashboard.jsx — rich analytics: date filters w/ comparison, curve chart, insights
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
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
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { getProducts, getOrders, getCustomers } from "../../api";

const BRAND = "#E11D48";
const REVEAL = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } } };
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
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
    <motion.div variants={REVEAL} whileHover={{ y: -4, boxShadow: "0 16px 35px rgba(15,23,42,.08)" }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 transition-colors hover:border-gray-200">
      <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[.07] transition-transform duration-500 group-hover:scale-125" style={{ backgroundColor: accent }} />
      <div className="flex items-center justify-between">
        <span className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: `${accent}14`, color: accent }}>
          <Icon style={{ fontSize: 22 }} />
        </span>
        {!loading && curr !== undefined && <Delta curr={curr} prev={prev} />}
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900">{loading ? "…" : value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {!loading && prevLabel && prev !== null && prev !== undefined && (
        <p className="text-[11px] text-gray-400 mt-0.5">vs {prevLabel}</p>
      )}
    </motion.div>
  );
}

// ---------- smooth SVG line chart ----------
function CurveChart({ points }) {
  const [hovered, setHovered] = useState(null);
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

  const activePoint = hovered == null ? null : xy[hovered];

  return (
    <div className="relative w-full" onMouseLeave={() => setHovered(null)}>
    <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rz-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.25" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={H - pad - g * (H - pad * 2)} y2={H - pad - g * (H - pad * 2)} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      <motion.path d={area} fill="url(#rz-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={path} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
      {xy.map((pt, i) => (
        <g key={i} onMouseEnter={() => setHovered(i)} onFocus={() => setHovered(i)} tabIndex="0" role="img" aria-label={`${points[i].label}, sales ${taka(points[i].v)}`} className="cursor-pointer outline-none">
          <circle cx={pt[0]} cy={pt[1]} r="10" fill="transparent" />
          <circle cx={pt[0]} cy={pt[1]} r={hovered === i ? "5" : "3"} fill="#fff" stroke={BRAND} strokeWidth={hovered === i ? "3" : "2"} className="transition-all" />
        </g>
      ))}
    </svg>
    {activePoint && (
      <div
        className="pointer-events-none absolute z-20 min-w-max -translate-x-1/2 -translate-y-full rounded-lg bg-gray-950 px-3 py-2 text-center text-white shadow-xl"
        style={{ left: `${(activePoint[0] / W) * 100}%`, top: `${(activePoint[1] / H) * 100}%`, marginTop: "-8px" }}
      >
        <p className="text-[10px] font-medium text-gray-300">{points[hovered].label}</p>
        <p className="text-xs font-bold">Sales: {taka(points[hovered].v)}</p>
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-950" />
      </div>
    )}
    </div>
  );
}

function StatusOverview({ breakdown, total }) {
  const rows = [
    ["Delivered", "#16a34a"], ["Shipped", "#2563eb"], ["Processing", "#7c3aed"],
    ["Pending", "#d97706"], ["Cancelled", "#ef4444"],
  ];
  let cursor = 0;
  const stops = rows.map(([status, color]) => {
    const start = cursor;
    cursor += total ? (breakdown[status] / total) * 100 : 0;
    return `${color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5">
      <motion.div initial={{ opacity: 0, scale: .75, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .7, ease: "easeOut" }} className="relative h-24 w-24 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${stops})` : "#f1f5f9" }}>
        <div className="absolute inset-[15px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <strong className="text-3xl font-black text-gray-900">{total}</strong>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Orders</span>
        </div>
      </motion.div>
      <div className="w-full space-y-2.5">
        {rows.map(([status, color], index) => {
          const count = breakdown[status] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return <div key={status} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="flex-1 font-medium text-gray-600">{status}</span>
            <span className="text-gray-400">{count}</span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100"><motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: .15 + index * .08, duration: .55 }} /></div>
          </div>;
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [allProductsCount, setAllProductsCount] = useState(null);
  const [latestProducts, setLatestProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeKey, setRangeKey] = useState("thisMonth");

  useEffect(() => {
    let alive = true;
    Promise.all([
      getOrders().catch(() => []),
      getProducts({ pageSize: 500 }).catch(() => ({ items: [], total: 0 })),
      getCustomers().catch(() => ({ registered: [], guests: [] })),
    ]).then(([ord, prods, custs]) => {
      if (!alive) return;
      setOrders(ord || []);
      setAllProductsCount(prods.total ?? (prods.items || []).length);
      setLatestProducts((prods.items || []).slice(0, 5));
      setProducts(prods.items || []);
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
  const inventory = useMemo(() => {
    const rows = products.map((product) => {
      const sized = Object.values(product.sizeStock || {});
      const stock = sized.length ? sized.reduce((sum, qty) => sum + Number(qty || 0), 0) : Number(product.stock || 0);
      return { ...product, stock };
    });
    return {
      units: rows.reduce((sum, product) => sum + product.stock, 0),
      out: rows.filter((product) => product.stock === 0),
      low: rows.filter((product) => product.stock > 0 && product.stock <= 5).sort((a, b) => a.stock - b.stock),
    };
  }, [products]);

  const fulfillmentRate = metrics.count ? Math.round((statusBreak.Delivered / metrics.count) * 100) : 0;
  const cancellationRate = metrics.count ? Math.round((statusBreak.Cancelled / metrics.count) * 100) : 0;
  const registeredShare = totalCustomers ? Math.round((registered.length / totalCustomers) * 100) : 0;

  if (process.env.REACT_APP_LEGACY_DASHBOARD === "true") return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="space-y-6 pb-6">
      <motion.div variants={REVEAL} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-rose-950 px-5 py-6 text-white shadow-xl sm:px-7 sm:py-8">
        <motion.span animate={{ x: [0, 18, 0], y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-rose-500/20 blur-2xl" />
        <motion.span animate={{ x: [0, -12, 0], y: [0, 8, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />
        <div className="relative flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[.2em] text-rose-300">Store intelligence</p>
          <h2 className="text-2xl font-black sm:text-3xl">Dashboard overview</h2>
          <p className="mt-1 text-sm text-gray-300">Live performance insights for <span className="font-semibold text-white">{range.label}</span></p>
        </div>
        <select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white outline-none backdrop-blur focus:border-white/40 [&>option]:text-gray-900">
          {RANGE_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:max-w-lg">
          <div><p className="text-xl font-black">{metrics.count}</p><p className="text-[11px] text-gray-400">Total orders</p></div>
          <div><p className="text-xl font-black">{metrics.count ? Math.round((statusBreak.Delivered / metrics.count) * 100) : 0}%</p><p className="text-[11px] text-gray-400">Delivered</p></div>
          <div><p className="text-xl font-black">{totalCustomers}</p><p className="text-[11px] text-gray-400">Customers</p></div>
        </div>
      </motion.div>

      {/* Primary metrics with comparison */}
      <motion.div variants={STAGGER} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={PaymentsOutlinedIcon} label="Revenue" value={taka(metrics.revenue)} loading={loading}
          curr={metrics.revenue} prev={prevMetrics?.revenue ?? null} prevLabel={range.prevLabel} />
        <StatCard icon={HourglassEmptyOutlinedIcon} label="Pending revenue" value={taka(metrics.pending)} loading={loading}
          curr={metrics.pending} prev={prevMetrics?.pending ?? null} prevLabel={range.prevLabel} accent="#D97706" />
        <StatCard icon={ReceiptLongOutlinedIcon} label="Orders" value={metrics.count.toLocaleString("en-BD")} loading={loading}
          curr={metrics.count} prev={prevMetrics?.count ?? null} prevLabel={range.prevLabel} />
        <StatCard icon={LocalShippingOutlinedIcon} label="Delivered revenue" value={taka(metrics.delivered)} loading={loading} accent="#16A34A" />
      </motion.div>

      {/* Secondary insights */}
      <motion.div variants={STAGGER} className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={SellOutlinedIcon} label="Avg order value" value={taka(metrics.aov)} loading={loading} accent="#7C3AED" />
        <StatCard icon={Inventory2OutlinedIcon} label="Products" value={allProductsCount ?? "…"} loading={loading} accent="#0D9488" />
        <StatCard icon={PersonOutlineOutlinedIcon} label="Registered customers" value={registered.length.toLocaleString("en-BD")} loading={loading} accent="#2563EB" />
        <StatCard icon={StorefrontOutlinedIcon} label="Guest customers" value={guests.length.toLocaleString("en-BD")} loading={loading} accent="#9333EA" />
      </motion.div>

      <motion.div variants={REVEAL} className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Curve chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">Revenue trend</h3>
            <span className="text-xs text-gray-400">{range.label}</span>
          </div>
          {loading ? <div className="h-48 bg-gray-50 rounded animate-pulse" /> : <CurveChart points={series} />}
        </div>

        {/* Order status breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="font-bold text-gray-900 mb-3">Order status</h3>
          <StatusOverview breakdown={statusBreak} total={metrics.count} />
        </div>
      </motion.div>

      {/* Business health and operational priorities */}
      <motion.div variants={REVEAL} className="grid gap-4 xl:grid-cols-3 sm:gap-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Performance</p><h3 className="mt-1 font-bold text-gray-900">Commerce health</h3></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><InsightsRoundedIcon /></span>
          </div>
          <div className="space-y-5">
            {[
              ["Fulfillment rate", fulfillmentRate, "#16a34a", `${statusBreak.Delivered} delivered`],
              ["Active pipeline", metrics.count ? Math.round(((statusBreak.Pending + statusBreak.Processing + statusBreak.Shipped) / metrics.count) * 100) : 0, "#7c3aed", `${statusBreak.Pending + statusBreak.Processing + statusBreak.Shipped} orders`],
              ["Cancellation rate", cancellationRate, cancellationRate > 15 ? "#ef4444" : "#f59e0b", `${statusBreak.Cancelled} cancelled`],
            ].map(([label, value, color, hint], index) => (
              <div key={label}>
                <div className="mb-1.5 flex items-end justify-between"><div><p className="text-sm font-semibold text-gray-700">{label}</p><p className="text-[11px] text-gray-400">{hint}</p></div><strong className="text-sm" style={{ color }}>{value}%</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ delay: .2 + index * .12, duration: .7 }} className="h-full rounded-full" style={{ backgroundColor: color }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Inventory</p><h3 className="mt-1 font-bold text-gray-900">Stock health</h3></div>
            <Link to="/admin/inventory" className="text-xs font-bold text-rose-600 hover:text-rose-700">View inventory</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-black text-gray-900">{inventory.units}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Units</p></div>
            <div className="rounded-xl bg-amber-50 p-3"><p className="text-xl font-black text-amber-700">{inventory.low.length}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600/70">Low</p></div>
            <div className="rounded-xl bg-red-50 p-3"><p className="text-xl font-black text-red-700">{inventory.out.length}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-red-600/70">Out</p></div>
          </div>
          <div className="mt-4 space-y-2">
            {[...inventory.out, ...inventory.low].slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
                <img src={product.image} alt="" className="h-9 w-9 rounded-lg bg-gray-100 object-cover" />
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-700">{product.name}</p>
                <span className={`text-[10px] font-bold ${product.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{product.stock === 0 ? "OUT" : `${product.stock} LEFT`}</span>
              </div>
            ))}
            {!loading && inventory.out.length + inventory.low.length === 0 && <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700"><CheckCircleOutlineRoundedIcon style={{ fontSize: 18 }} /> Inventory levels look healthy</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Audience</p><h3 className="mt-1 font-bold text-gray-900">Customer mix</h3></div>
          <div className="flex items-center gap-5">
            <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(#2563eb 0 ${registeredShare}%, #9333ea ${registeredShare}% 100%)` }}>
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl text-gray-900">{totalCustomers}</strong><span className="text-[9px] uppercase tracking-wider text-gray-400">Customers</span></div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div><div className="flex justify-between text-xs"><span className="font-semibold text-gray-600">Registered</span><span className="text-gray-400">{registered.length}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100"><motion.div initial={{ width: 0 }} animate={{ width: `${registeredShare}%` }} className="h-full rounded-full bg-blue-600" /></div></div>
              <div><div className="flex justify-between text-xs"><span className="font-semibold text-gray-600">Guests</span><span className="text-gray-400">{guests.length}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100"><motion.div initial={{ width: 0 }} animate={{ width: `${100 - registeredShare}%` }} className="h-full rounded-full bg-purple-600" /></div></div>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-gray-200 p-3 text-xs leading-5 text-gray-500">
            <WarningAmberRoundedIcon className="mr-1 align-middle text-amber-500" style={{ fontSize: 16 }} /> {registeredShare < 40 ? "Encourage guest shoppers to create accounts for stronger retention." : "Registered customer share is building a healthy retention base."}
          </div>
        </section>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={REVEAL} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="font-bold text-gray-900 mb-3">Quick actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK.map(({ to, label, icon: Icon }) => (
            <motion.div key={to} whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: .97 }}>
            <Link to={to} className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-all hover:border-rose-100 hover:bg-rose-50/40 hover:shadow-md">
              <span className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND}14`, color: BRAND }}>
                <Icon style={{ fontSize: 20 }} />
              </span>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={REVEAL} className="grid lg:grid-cols-3 gap-4 sm:gap-6">
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
      </motion.div>

      {/* Latest products */}
      <motion.div variants={REVEAL} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
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
            <motion.div key={p.id} whileHover={{ y: -5 }}>
            <Link to="/admin/products" className="block rounded-xl border border-gray-100 p-2 transition-all hover:border-gray-200 hover:shadow-lg">
              <img src={p.image} alt={p.name} className="h-20 w-full rounded object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x96/f3f4f6/9ca3af?text=R"; }} />
              <p className="text-xs text-gray-700 truncate mt-1.5">{p.name}</p>
              <p className="text-xs font-semibold text-gray-900">{taka(p.price)}</p>
            </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  return <ReferenceDashboard {...{ loading, rangeKey, setRangeKey, range, metrics, prevMetrics, inventory, allProductsCount, totalCustomers, fulfillmentRate, cancellationRate, registeredShare, registered, guests, series, topProducts, recent, statusBreak }} />;
}

function ReferenceDashboard({ loading, rangeKey, setRangeKey, range, metrics, prevMetrics, inventory, allProductsCount, totalCustomers, fulfillmentRate, cancellationRate, registeredShare, registered, guests, series, topProducts, recent, statusBreak }) {
  const panel = "rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,.04)]";
  const kpis = [
    ["Total Sales", taka(metrics.revenue), PaymentsOutlinedIcon, "#f1e8ff", metrics.revenue, prevMetrics?.revenue],
    ["Orders", metrics.count.toLocaleString("en-BD"), ReceiptLongOutlinedIcon, "#e1f4ff", metrics.count, prevMetrics?.count],
    ["Low Stock Items", inventory.low.length, WarningAmberRoundedIcon, "#fff0e8"],
    ["Total Customers", totalCustomers.toLocaleString("en-BD"), PersonOutlineOutlinedIcon, "#eeeeee"],
  ];
  const maxSeries = Math.max(1, ...series.map((point) => point.v));

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="w-full max-w-full space-y-2.5 overflow-x-hidden pb-2 text-gray-900">
      <motion.div variants={REVEAL} className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold tracking-tight">Dashboard</h2><p className="mt-0.5 text-xs text-gray-400">Store performance and operational overview</p></div>
        <select value={rangeKey} onChange={(event) => setRangeKey(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none">
          {RANGE_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
        </select>
      </motion.div>

      <motion.div variants={STAGGER} className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {kpis.map(([label, value, Icon, background, current, previous]) => (
          <motion.div key={label} variants={REVEAL} whileHover={{ y: -2 }} className="flex min-h-16 items-center justify-between rounded-lg px-2.5 py-1.5" style={{ backgroundColor: background }}>
            <div><p className="text-[10px] font-medium text-gray-500">{label}</p><p className="mt-0.5 text-lg font-extrabold">{loading ? "..." : value}</p>{current !== undefined && <Delta curr={current} prev={previous ?? null} />}</div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-gray-700"><Icon style={{ fontSize: 18 }} /></span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={REVEAL} className="grid gap-2.5 xl:grid-cols-[2fr_1fr]">
        <section className={`${panel} p-2.5 sm:p-3`}>
          <div className="flex items-center justify-between"><h3 className="text-base font-bold">Sales Overview</h3><span className="rounded-full bg-gray-50 px-3 py-1 text-[10px] font-semibold text-gray-500">{range.label}</span></div>
          <div className="mt-2">{loading ? <div className="h-56 animate-pulse rounded-lg bg-gray-50" /> : <CurveChart points={series} />}</div>
          <div className="grid grid-cols-3 border-t border-gray-100 pt-3 text-center"><div><p className="text-sm font-bold">{taka(metrics.revenue)}</p><p className="text-[10px] text-gray-400">Revenue</p></div><div className="border-x border-gray-100"><p className="text-sm font-bold">{taka(metrics.aov)}</p><p className="text-[10px] text-gray-400">Avg. order</p></div><div><p className="text-sm font-bold">{fulfillmentRate}%</p><p className="text-[10px] text-gray-400">Fulfilled</p></div></div>
        </section>
        <section className={`${panel} flex flex-col p-2.5 sm:p-3`}>
          <h3 className="text-base font-bold">Inventory Status</h3>
          <div className="mt-4 flex-1 divide-y divide-gray-100">
            {[["In Stock", Math.max(0, Number(allProductsCount || 0) - inventory.low.length - inventory.out.length), "#22c55e"], ["Low Stock", inventory.low.length, "#f59e0b"], ["Out of Stock", inventory.out.length, "#ef4444"]].map(([label, value, color]) => <div key={label} className="flex items-center gap-2 py-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} /><span className="flex-1 text-xs font-semibold text-gray-600">{label}</span><strong className="text-sm">{value}</strong></div>)}
          </div>
          <Link to="/admin/inventory" className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-500 py-2.5 text-center text-xs font-bold text-white no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-green-600 hover:text-white hover:shadow-md">Manage Inventory</Link>
        </section>
      </motion.div>

      <motion.div variants={REVEAL} className="grid gap-2.5 xl:grid-cols-3">
        <section className={`${panel} p-2.5 sm:p-3`}>
          <h3 className="text-base font-bold">Top Selling Products</h3>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[300px] text-xs"><thead><tr className="border-b text-left text-[10px] text-gray-400"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Sales</th><th className="pb-2 text-right font-medium">Units</th></tr></thead><tbody>
            {topProducts.slice(0, 5).map((product) => <tr key={product.name} className="border-b border-gray-50 last:border-0"><td className="py-2.5"><div className="flex items-center gap-2"><img src={product.image} alt="" className="h-8 w-8 rounded-lg bg-gray-100 object-cover" /><span className="max-w-32 truncate font-semibold">{product.name}</span></div></td><td className="py-2.5 font-bold">{taka(product.revenue)}</td><td className="py-2.5 text-right font-bold text-green-500">↑ {product.qty}</td></tr>)}
            {!loading && topProducts.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No sales in this period</td></tr>}
          </tbody></table></div>
        </section>
        <section className={`${panel} p-2.5 sm:p-3`}>
          <div className="flex items-center justify-between"><h3 className="text-base font-bold">Recent Orders</h3><Link to="/admin/orders" className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-gray-600 no-underline shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700">View All <span className="ml-1">→</span></Link></div>
          <div className="mt-3 space-y-1.5">{recent.slice(0, 5).map((order) => <Link to="/admin/orders" key={order.id} className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-2.5 text-gray-900 no-underline transition hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"><span className="text-xs font-bold">#{order.code}</span><span className="min-w-0 flex-1 truncate text-[11px] text-gray-500">{order.customerName}</span><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${STATUS_STYLE[order.status] || "bg-gray-100"}`}>{order.status}</span></Link>)}{!loading && recent.length === 0 && <p className="py-8 text-center text-xs text-gray-400">No recent orders</p>}</div>
        </section>
        <section className={`${panel} p-2.5 sm:p-3`}>
          <div className="flex items-center justify-between"><h3 className="text-base font-bold">Shipment Status</h3><span className="rounded-full bg-gray-50 px-2 py-1 text-[9px] text-gray-400">{range.label}</span></div><div className="mt-3"><StatusOverview breakdown={statusBreak} total={metrics.count} /></div>
        </section>
      </motion.div>

      <motion.div variants={REVEAL} className="grid gap-2.5 xl:grid-cols-[1fr_2fr]">
        <section className={`${panel} p-2.5 sm:p-3`}>
          <h3 className="text-base font-bold">Customer Activity</h3>
          <div className="mt-4 flex items-center gap-5"><div><p className="text-[10px] text-gray-400">Active customers</p><p className="text-xl font-extrabold">{totalCustomers}</p><p className="mt-3 text-[10px] text-gray-400">Registered accounts</p><p className="text-xl font-extrabold">{registered.length}</p></div><div className="relative ml-auto h-28 w-28 rounded-full" style={{ background: `conic-gradient(#56c271 0 ${registeredShare}%, #59a8f5 ${registeredShare}% 100%)` }}><div className="absolute inset-7 rounded-full bg-white" /></div></div>
          <div className="mt-4 flex gap-4 text-[10px] text-gray-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />Registered {registeredShare}%</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-400" />Guests {100 - registeredShare}%</span></div>
        </section>
        <section className={`${panel} p-2.5 sm:p-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-base font-bold">Business Performance</h3><p className="mt-1 text-[10px] text-gray-400">Revenue activity across {range.label.toLowerCase()}</p></div><div className="flex gap-5 text-right"><div><p className="text-[10px] text-gray-400">Orders</p><strong>{metrics.count}</strong></div><div><p className="text-[10px] text-gray-400">Cancellation</p><strong>{cancellationRate}%</strong></div></div></div>
          <div className="mt-6 flex h-36 items-end gap-2 border-b border-gray-100 px-2">{series.slice(-12).map((point, index) => { const height = Math.max(6, Math.round((point.v / maxSeries) * 100)); return <div key={`${point.label}-${index}`} className="group flex h-full flex-1 items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: index * .04, duration: .55 }} className="relative w-full rounded-t bg-green-500/90"><span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[8px] group-hover:block">{taka(point.v)}</span></motion.div></div>; })}</div>
          <div className="mt-2 flex justify-between text-[9px] text-gray-400"><span>{series[0]?.label}</span><span>{series[series.length - 1]?.label}</span></div>
        </section>
      </motion.div>

      <motion.div variants={REVEAL} className={`${panel} p-3`}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">Quick Actions</h3><div className="flex flex-wrap gap-1.5">{QUICK.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-gray-600 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:text-green-700 hover:shadow-md"><Icon style={{ fontSize: 14 }} />{label}</Link>)}</div></div></motion.div>
    </motion.div>
  );
}

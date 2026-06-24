// src/components/SalePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { getProducts } from "../api"; // adjust path if needed

const BRAND = "#E11D48";   // rose
const SALE = "#7C3AED";    // violet (Sale accent)
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const pctOff = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0);
const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

const THRESHOLDS = [
  { label: "All Deals", min: 0 },
  { label: "10% +", min: 10 },
  { label: "20% +", min: 20 },
  { label: "30% +", min: 30 },
  { label: "50% +", min: 50 },
];

// Countdown target: 3 days from first render
const TARGET = Date.now() + 3 * 24 * 60 * 60 * 1000;
const remaining = () => {
  const diff = Math.max(0, TARGET - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
};
const pad = (n) => String(n).padStart(2, "0");

function SaleCard({ product, onOpen }) {
  const off = pctOff(product);
  return (
    <div className="group relative rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {off > 0 && (
        <span className="absolute top-2 left-2 z-10 text-[11px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: SALE }}>
          -{off}%
        </span>
      )}
      <button
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-rose-600"
        aria-label="Add to wishlist"
      >
        <FavoriteBorderIcon style={{ fontSize: 17 }} />
      </button>

      <div
        className="aspect-[3/4] flex items-center justify-center p-3 bg-gradient-to-b from-gray-50 to-gray-100 cursor-pointer"
        onClick={() => onOpen(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => imgFallback(e, product.name)}
        />
      </div>

      <div className="p-3">
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
          {off > 0 && <span className="text-xs font-semibold" style={{ color: SALE }}>{off}% off</span>}
        </div>
        <button
          onClick={() => onOpen(product)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} />
          Add to Bag
        </button>
      </div>
    </div>
  );
}

export default function SalePage() {
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minOff, setMinOff] = useState(0);
  const [sort, setSort] = useState("discount");
  const [clock, setClock] = useState(remaining());

  // Live countdown
  useEffect(() => {
    const t = setInterval(() => setClock(remaining()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch products, keep only discounted ones
  useEffect(() => {
    let alive = true;
    setLoading(true);
    getProducts({ pageSize: 200 })
      .then((res) => {
        if (!alive) return;
        const items = (res.items || res).filter((p) => pctOff(p) > 0);
        setAll(items);
      })
      .catch(() => alive && setAll([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    let list = all.filter((p) => pctOff(p) >= minOff);
    if (sort === "discount") list = [...list].sort((a, b) => pctOff(b) - pctOff(a));
    else if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [all, minOff, sort]);

  const openProduct = (p) => navigate(`/product/${p.slug}`);

  return (
    <div className="w-[92%] sm:w-[94%] max-w-[1300px] mx-auto py-6 sm:py-8">
      {/* ===== Sale banner ===== */}
      <div
        className="rounded-2xl overflow-hidden text-white px-5 sm:px-10 py-8 sm:py-12 text-center"
        style={{ background: `linear-gradient(120deg, ${SALE}, ${BRAND})` }}
      >
        <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest bg-white/20 rounded-full px-3 py-1">
          <LocalOfferOutlinedIcon style={{ fontSize: 16 }} /> Limited Time
        </p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">MEGA SALE</h1>
        <p className="mt-2 text-sm sm:text-lg text-white/90">Up to 50% off across Men, Women, Kids &amp; Accessories</p>

        {/* Countdown */}
        <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3">
          {[
            { v: clock.d, l: "Days" },
            { v: clock.h, l: "Hrs" },
            { v: clock.m, l: "Min" },
            { v: clock.s, l: "Sec" },
          ].map((u, i) => (
            <div key={i} className="bg-white/15 backdrop-blur rounded-lg px-3 py-2 min-w-[52px] sm:min-w-[64px]">
              <p className="text-xl sm:text-3xl font-bold tabular-nums">{pad(u.v)}</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-white/80">{u.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Controls ===== */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Discount filters */}
        <div className="flex flex-wrap gap-2">
          {THRESHOLDS.map((t) => {
            const active = minOff === t.min;
            return (
              <button
                key={t.min}
                onClick={() => setMinOff(t.min)}
                className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: SALE, borderColor: SALE, color: "#fff" }
                    : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-gray-500">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
          >
            <option value="discount">Biggest discount</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="mt-4 text-sm text-gray-500">
          {visible.length} product{visible.length !== 1 ? "s" : ""} on sale
        </p>
      )}

      {/* ===== Grid ===== */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mt-2 w-3/4 animate-pulse" />
                <div className="h-8 bg-gray-100 rounded mt-2 animate-pulse" />
              </div>
            ))
          : visible.map((p) => <SaleCard key={p.id} product={p} onOpen={openProduct} />)}
      </div>

      {!loading && visible.length === 0 && (
        <p className="text-center text-gray-400 py-16">No deals match this filter right now.</p>
      )}
    </div>
  );
}

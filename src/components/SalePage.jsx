// src/components/SalePage.jsx — shows products from active sale campaigns (computed prices)
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getSaleProducts } from "../api";
import { useWishlist } from "../context/WishlistContext";
import QuickAddModal from "./QuickAddModal";

const BRAND = "var(--brand)";
const SALE = "#7C3AED";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const pctOff = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0);
const imgFallback = (e, label = "RAINZ") => { e.target.onerror = null; e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`; };

function useCountdown(endDate) {
  const target = endDate ? new Date(endDate + "T23:59:59").getTime() : null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, target - now);
  if (diff === 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s: sec };
}
const pad = (n) => String(n).padStart(2, "0");

const THRESHOLDS = [
  { label: "All Deals", min: 0 }, { label: "10% +", min: 10 }, { label: "20% +", min: 20 }, { label: "30% +", min: 30 }, { label: "50% +", min: 50 },
];

function SaleCard({ product, onOpen, onAdd }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const off = pctOff(product);
  const cd = useCountdown(product.saleEnds);
  return (
    <div className="group relative rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      {off > 0 && <span className="absolute top-2 left-2 z-10 text-[11px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: SALE }}>-{off}%</span>}
      <button onClick={(e) => { e.stopPropagation(); toggle(product); }} className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center transition-colors hover:scale-105" style={{ color: wished ? SALE : "#6b7280" }} aria-label="Wishlist">
        {wished ? <FavoriteIcon style={{ fontSize: 17 }} /> : <FavoriteBorderIcon style={{ fontSize: 17 }} />}
      </button>

      <div className="h-56 sm:h-60 flex items-center justify-center p-3 bg-gradient-to-b from-gray-50 to-gray-100 cursor-pointer" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" onError={(e) => imgFallback(e, product.name)} />
      </div>

      <div className="p-3 flex flex-col">
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 h-5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
          {off > 0 && <span className="text-xs font-semibold" style={{ color: SALE }}>{off}% off</span>}
        </div>
        {cd && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: SALE }}>
            <AccessTimeIcon style={{ fontSize: 13 }} />
            {cd.d > 0 ? `${cd.d}d ` : ""}{pad(cd.h)}:{pad(cd.m)}:{pad(cd.s)} left
          </p>
        )}
        <button onClick={() => onAdd(product)} className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: BRAND }}>
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} /> Add to Bag
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
  const [quickSlug, setQuickSlug] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getSaleProducts()
      .then((items) => { if (alive) setAll(items || []); })
      .catch(() => alive && setAll([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const visible = useMemo(() => {
    let list = all.filter((p) => pctOff(p) >= minOff);
    if (sort === "discount") list = [...list].sort((a, b) => pctOff(b) - pctOff(a));
    else if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [all, minOff, sort]);

  const openProduct = (p) => navigate(`/product/${p.slug}`);
  const handleAdd = (p) => setQuickSlug(p.slug);

  return (
    <div className="w-[92%] sm:w-[94%] max-w-[1300px] mx-auto py-6 sm:py-8">
      <div className="rounded-2xl overflow-hidden text-white px-5 sm:px-10 py-8 sm:py-12 text-center" style={{ background: `linear-gradient(120deg, ${SALE}, ${BRAND})` }}>
        <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest bg-white/20 rounded-full px-3 py-1">
          <LocalOfferOutlinedIcon style={{ fontSize: 16 }} /> Limited Time
        </p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">MEGA SALE</h1>
        <p className="mt-2 text-sm sm:text-lg text-white/90">Shop the latest discounts across the store</p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {THRESHOLDS.map((t) => {
            const active = minOff === t.min;
            return (
              <button key={t.min} onClick={() => setMinOff(t.min)} className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={active ? { backgroundColor: SALE, borderColor: SALE, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-gray-500">Sort</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white">
            <option value="discount">Biggest discount</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {!loading && <p className="mt-4 text-sm text-gray-500">{visible.length} product{visible.length !== 1 ? "s" : ""} on sale</p>}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="h-56 sm:h-60 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mt-2 w-3/4 animate-pulse" />
                <div className="h-8 bg-gray-100 rounded mt-2 animate-pulse" />
              </div>
            ))
          : visible.map((p) => <SaleCard key={p.id} product={p} onOpen={openProduct} onAdd={handleAdd} />)}
      </div>

      {!loading && visible.length === 0 && <p className="text-center text-gray-400 py-16">No active sales right now. Check back soon!</p>}

      <QuickAddModal slug={quickSlug} onClose={() => setQuickSlug(null)} />
    </div>
  );
}

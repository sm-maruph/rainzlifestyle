// src/components/FeaturedCategories.jsx — real API, uniform cards, wishlist + Buy Now + Quick-Add
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getProducts, getCategories } from "../api";
import { useWishlist } from "../context/WishlistContext";
import QuickAddModal from "./QuickAddModal";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const imgFallback = (e, label = "RAINZ") => { e.target.onerror = null; e.target.src = `https://placehold.co/600x600/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`; };
const CATEGORY_PLACEHOLDER = (label) => `https://placehold.co/800x1000/f3f4f6/9ca3af?text=${encodeURIComponent(label || "RAINZ")}`;

function ProductMini({ product, isViewMore, accent, onOpen, onViewMore, onAdd, onBuyNow }) {
  const { has, toggle } = useWishlist();
  function Stars({ rating = 0, size = 13 }) {
    const full = Math.round(rating);
    return (
      <span className="inline-flex text-amber-400">
        {Array.from({ length: 5 }).map((_, i) =>
          i < full
            ? <StarRoundedIcon key={i} style={{ fontSize: size }} />
            : <StarBorderRoundedIcon key={i} style={{ fontSize: size }} />
        )}
      </span>
    );
  }

  if (isViewMore) {
    return (
      <div className="flex flex-col rounded-xl bg-white shadow-sm overflow-hidden cursor-pointer group" onClick={onViewMore}>
        <div className="h-44 sm:h-48 bg-gray-50 relative">
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white font-bold tracking-widest text-base md:text-lg text-center leading-tight">VIEW<br />MORE</span>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 space-y-2">
          <div className="h-3" /><div className="h-5" /><div className="h-7" /><div className="h-7" />
        </div>
      </div>
    );
  }

  const wished = has(product.id);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <div className="group flex flex-col rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative cursor-pointer" onClick={() => onOpen(product)}>
        {discount > 0 && <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND }}>-{discount}%</span>}
        <button aria-label="Add to wishlist" onClick={(e) => { e.stopPropagation(); toggle(product); }}
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center transition-colors hover:scale-105"
          style={{ color: wished ? accent : "#6b7280" }}>
          {wished ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </button>
        {/* Fixed-height image keeps all cards uniform */}
        <div className="h-44 sm:h-48 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
          <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" onError={(e) => imgFallback(e, product.name)} />

        </div>

      </div>

      <div className="px-3 pt-2 pb-1 flex flex-col">
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>{product.name}</p>
        {/* Rating + review count */}
        <div className="flex items-center gap-1 mb-0.8 h-4">
          {product.reviews > 0 ? (
            <>
              <Stars rating={product.rating} />
              <span className="text-[11px] text-gray-500">{Number(product.rating).toFixed(1)}</span>
              <span className="text-[11px] text-gray-400">({product.reviews})</span>
            </>
          ) : (
            <span className="text-[11px] text-gray-300">No reviews yet</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 h-5">

          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} className="w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
            <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} /> Add to Bag
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBuyNow(product); }} className="w-full rounded-md py-1.5 text-xs font-semibold border-2 transition-colors"
            style={{ borderColor: accent, color: accent, backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = accent; }}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function Spotlight({ spotlight, products, loading, onOpen, onGo, onAdd, onBuyNow }) {
  const count = spotlight.count || 8;
  const accent = spotlight.accent || BRAND;
  const [activeSub, setActiveSub] = useState(null);

  // Fixed subcategory filtering: match by subcategory slug (product.subcategory is the slug)
  const filtered = useMemo(
    () => (activeSub ? products.filter((p) => p.subcategory === activeSub) : products),
    [products, activeSub]
  );
  const slots = filtered.slice(0, count);
  const chips = [{ name: "All", slug: null }, ...(spotlight.subcategories || [])];
  const chipStyle = (isActive) => isActive ? { backgroundColor: accent, borderColor: accent, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onGo(spotlight.link)}
          className="flex items-center gap-1 text-lg md:text-xl font-bold hover:opacity-80"
          style={{ color: "var(--title)" }}
        >
          {spotlight.label}
          {activeSub && <span className="font-medium  text-gray-400"> / {chips.find((c) => c.slug === activeSub)?.name}</span>}
          <ChevronRightIcon style={{ color: accent, fontSize: 22 }} />
        </button>
        <button onClick={() => onGo(activeSub ? `${spotlight.link}/${activeSub}` : spotlight.link)} className="text-sm font-semibold hover:underline" style={{ color: accent }}>View All &rarr;</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((sub) => {
          const isActive = activeSub === sub.slug;
          return (
            <button key={sub.slug ?? "all"} onClick={() => setActiveSub(sub.slug)} className="rounded-full border px-3 py-1 text-xs font-medium transition-colors" style={chipStyle(isActive)}
              onMouseEnter={(e) => { if (!isActive) Object.assign(e.currentTarget.style, { backgroundColor: accent, borderColor: accent, color: "#fff" }); }}
              onMouseLeave={(e) => { if (!isActive) Object.assign(e.currentTarget.style, chipStyle(false)); }}>
              {sub.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Feature card from real category image */}
        <div className="relative col-span-2 lg:row-span-2 rounded-lg overflow-hidden cursor-pointer group h-56 sm:h-72 lg:h-full" onClick={() => onGo(spotlight.link)}>
          <img src={spotlight.featureImage || CATEGORY_PLACEHOLDER(spotlight.label)} alt={spotlight.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => imgFallback(e, spotlight.label)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: accent }} />
          <h3 className="absolute bottom-4 left-4 text-white text-lg md:text-xl font-bold drop-shadow">{spotlight.label}</h3>
        </div>

        {loading ? (
          Array.from({ length: count }).map((_, i) => <div key={i} className="h-44 sm:h-48 rounded-lg bg-gray-100 animate-pulse" />)
        ) : slots.length === 0 ? (
          <div className="col-span-2 lg:col-span-4 flex items-center justify-center text-gray-400 text-sm py-10">No products in this subcategory yet.</div>
        ) : (
          slots.map((p, i) => (
            <ProductMini
              key={p.id ?? i}
              product={p}
              accent={accent}
              isViewMore={!activeSub && i === slots.length - 1 && products.length > count}
              onOpen={onOpen}
              onViewMore={() => onGo(spotlight.link)}
              onAdd={onAdd}
              onBuyNow={onBuyNow}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function FeaturedCategories({
  brandName = "RAINZLIFESTYLE",
  brandLink = "/new-arrivals",
  tagline = "Because comfort and confidence go hand in hand.",
  description = "We focus on carefully selecting the best clothing that is comfortable, looks great, and makes you confident. Beyond fabric, design, and fit, every piece passes strict quality checks — because the right outfit changes how you see yourself.",
  sideImage = "https://loremflickr.com/700/360/fabric?lock=5001",
  spotlightsProp,
  perCategory = 8,
  onProductClick,
}) {
  const navigate = useNavigate();
  const [spotlights, setSpotlights] = useState(spotlightsProp ?? []);
  const [productsBySpot, setProductsBySpot] = useState({});
  const [loading, setLoading] = useState(true);
  const [quickSlug, setQuickSlug] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const resolveSpots = spotlightsProp
      ? Promise.resolve(spotlightsProp)
      : getCategories().then((cats) =>
        cats
          .filter((c) => c.slug !== "sale")
          .map((c) => ({
            id: c.slug, label: c.name, accent: c.accent,
            featureImage: c.image || null, // real category image from backend
            category: c.slug, link: `/${c.slug}`, count: perCategory,
            subcategories: Array.from(new Map((c.groups || []).flatMap((g) => g.items).map((it) => [slugify(it), { name: it, slug: slugify(it) }])).values()),
          }))
      );

    resolveSpots
      .then((spots) => {
        if (!alive) return;
        setSpotlights(spots);
        return Promise.all(spots.map((s) => getProducts({ category: s.category, pageSize: 24 }).then((res) => [s.id, res.items]))).then((entries) => alive && setProductsBySpot(Object.fromEntries(entries)));
      })
      .catch(() => { })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightsProp, perCategory]);

  const go = (link) => navigate(link || "/");
  const openProduct = (p) => (onProductClick ? onProductClick(p) : navigate(`/product/${p.slug}`));
  const handleAdd = (p) => setQuickSlug(p.slug);
  const handleBuyNow = (p) => navigate(`/product/${p.slug}`);

  return (
    <section className="w-full" style={{ backgroundColor: "var(--primary)" }}>
      <div className="w-[94%] max-w-[1500px] mx-auto py-10">
        <div className="relative">
          <div className="max-w-3xl">
            <button onClick={() => go(brandLink)} className="flex items-center gap-1 text-2xl md:text-3xl font-semibold text-gray-800 hover:opacity-80" style={{ color: BRAND }}>
              {brandName}<ChevronRightIcon style={{ color: BRAND }} />
            </button>
            <p className="mt-2 text-lg md:text-xl font-medium" style={{ color: "var(--subtitle)" }}>{tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 ">{description}</p>
          </div>
          <img src={sideImage} alt="" aria-hidden="true" loading="lazy" className="hidden lg:block absolute top-0 right-0 w-[100%] max-w-[360px] h-[80%] max-h-[260px] object-contain pointer-events-none" onError={(e) => (e.target.style.display = "none")} />
        </div>

        <div className="mt-8 space-y-10">
          {(spotlights.length ? spotlights : Array.from({ length: 2 })).map((s, i) => (
            <Spotlight
              key={s?.id ?? i}
              spotlight={s || { count: perCategory, label: "", link: "/" }}
              products={s ? productsBySpot[s.id] || [] : []}
              loading={loading}
              onOpen={openProduct}
              onGo={go}
              onAdd={handleAdd}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      </div>

      <QuickAddModal slug={quickSlug} onClose={() => setQuickSlug(null)} />
    </section>
  );
}

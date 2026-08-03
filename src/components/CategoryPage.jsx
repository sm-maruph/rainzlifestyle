// src/components/CategoryPage.jsx — uniform cards, always-visible Add to Bag, size/color info, loading
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getProducts, getCategories } from "../api";
import { useWishlist } from "../context/WishlistContext";
import QuickAddModal from "./QuickAddModal";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const BRAND = "var(--brand)"; const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const prettify = (s = "") => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const imgFallback = (e, label = "RAINZ") => { e.target.onerror = null; e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`; };

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function LegacyProductCard({ product, accent, onOpen, onAdd }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const sizes = product.sizes || [];
  const colors = product.colors || [];

  return (
    <div className="group flex flex-col rounded-xl bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative cursor-pointer" onClick={() => onOpen(product)}>
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: accent }}>-{discount}%</span>
        )}
        <button aria-label="Add to wishlist" onClick={(e) => { e.stopPropagation(); toggle(product); }}
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center transition-colors hover:scale-105"
          style={{ color: wished ? accent : "#6b7280" }}>
          {wished ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </button>

        {/* Fixed-height image keeps every card identical */}
        <div className="h-56 sm:h-60 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
          <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" onError={(e) => imgFallback(e, product.name)} />
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pt-2 pb-3 flex flex-col flex-1">
        {product.brand && <p className="text-[11px] uppercase tracking-wide text-gray-400 truncate">{product.brand}</p>}
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>{product.name}</p>

        <div className="flex items-center gap-2 mt-0.5 h-5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 h-4">
            {colors.slice(0, 5).map((c) => (
              <span key={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full border border-gray-200" style={{ backgroundColor: c.hex || "#9ca3af" }} />
            ))}
            {colors.length > 5 && <span className="text-[10px] text-gray-400">+{colors.length - 5}</span>}
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <p className="text-[11px] text-gray-500 mt-1 truncate">Sizes: {sizes.join(", ")}</p>
        )}

        {/* Stock */}
        <p className={`text-[11px] font-medium mt-1 ${product.inStock ? "text-green-600" : "text-red-500"}`}>
          {product.inStock ? "In stock" : "Out of stock"}
        </p>

        {/* Add to Bag — always visible (mobile + desktop) */}
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
          disabled={!product.inStock}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} /> Add to Bag
        </button>
      </div>
    </div>
  );
}

function ReferenceProductCard({ product, accent, onOpen, onAdd }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const saving = product.oldPrice && product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 hover:border-cyan-400 hover:shadow-md">
      <div className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100" onClick={() => onOpen(product)}>
        {discount > 0 && <span className="absolute left-2.5 top-2.5 z-10 rounded-sm bg-[#ff3366] px-2 py-1 text-[10px] font-bold text-white">-{discount}%</span>}
        <span className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"><SearchIcon style={{ fontSize: 17 }} /></span>
        <button aria-label="Add to wishlist" onClick={(event) => { event.stopPropagation(); toggle(product); }} className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition-transform hover:scale-105" style={{ color: wished ? accent : "#6b7280" }}>
          {wished ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </button>
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]" onError={(event) => imgFallback(event, product.name)} />
      </div>
      <div className="relative flex min-h-[112px] flex-1 flex-col px-2.5 pb-3 pt-2.5">
        <p className="min-h-9 cursor-pointer text-xs leading-[1.35] text-gray-900 line-clamp-2" onClick={() => onOpen(product)}>{product.name}</p>
        {saving > 0 && <span className="mt-2 inline-flex w-fit items-center gap-1 rounded bg-emerald-600 px-1.5 py-1 text-[9px] font-bold text-white"><LocalOfferIcon style={{ fontSize: 11 }} /> Save {taka(saving)}</span>}
        <div className="mt-auto flex min-w-0 items-baseline gap-1.5 pr-12 pt-2">
          <span className="text-base font-black text-gray-950">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-[10px] text-gray-400 line-through">{taka(product.oldPrice)}</span>}
          {discount > 0 && <span className="text-[9px] text-[#ff3366]">-{discount}%</span>}
        </div>
        <button onClick={(event) => { event.stopPropagation(); onAdd(product); }} disabled={!product.inStock} className="absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-gray-950 text-white shadow transition-transform hover:scale-105 disabled:opacity-40" aria-label={`Add ${product.name} to bag`}>
          <ShoppingBagOutlinedIcon style={{ fontSize: 19 }} />
          <span className="absolute bottom-[7px] right-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">+</span>
        </button>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();

  const isNewArrivals = category === "new-arrivals";

  const [tree, setTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [quickSlug, setQuickSlug] = useState(null);

  const cat = useMemo(() => tree.find((c) => c.slug === category), [tree, category]);
  const accent = cat?.accent || BRAND;
  const subChips = useMemo(() => {
    if (!cat) return [];
    const seen = new Map();
    (cat.groups || []).flatMap((g) => g.items).forEach((it) => {
      const slug = it.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!seen.has(slug)) seen.set(slug, { name: it, slug });
    });
    return [...seen.values()];
  }, [cat]);

  const title = isNewArrivals ? "New Arrivals" : subcategory ? prettify(subcategory) : cat?.name || prettify(category);

  useEffect(() => {
    let alive = true;
    Promise.all([getCategories(), getProducts({ page: 1, pageSize: 500 }).catch(() => ({ items: [] }))]).then(([categories, result]) => {
      if (!alive) return;
      const allProducts = result.items || [];
      const categoryCounts = new Map();
      const subcategoryCounts = new Map();
      allProducts.forEach((product) => {
        if (product.category) categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
        if (product.category && product.subcategory) {
          const key = `${product.category}:${product.subcategory}`;
          subcategoryCounts.set(key, (subcategoryCounts.get(key) || 0) + 1);
        }
      });
      setTree(categories.map((item) => ({
        ...item,
        count: categoryCounts.get(item.slug) ?? item.count ?? 0,
        groups: (item.groups || []).map((group) => ({
          ...group,
          counts: Object.fromEntries((group.items || []).map((name) => [name, subcategoryCounts.get(`${item.slug}:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`) ?? group.counts?.[name] ?? 0])),
        })),
      })));
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = isNewArrivals ? { sort, page, pageSize } : { category, subcategory, sort, page, pageSize };
    getProducts(query)
      .then((res) => { if (alive) { setProducts(res.items); setTotal(res.total || 0); } })
      .catch(() => { if (alive) { setProducts([]); setTotal(0); } })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [category, subcategory, sort, isNewArrivals, page, pageSize]);

  useEffect(() => { setPage(1); }, [category, subcategory, sort]);
  const openProduct = (p) => navigate(`/product/${p.slug}`);
  const handleAdd = (p) => setQuickSlug(p.slug); // popup enforces size/color/qty

  return (
    <div className="w-full max-w-[1800px] mx-auto min-h-screen" style={{ backgroundColor: "var(--primary)" }}>
      <div className="flex items-start">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white px-4 py-5 lg:block">
          <div className="mb-0 border-b border-gray-200 px-3 pb-3">
            <p className="text-xs font-bold" style={{ color: BRAND }}>Special Offers</p>
          </div>
          <div className="mb-4 border-b border-gray-200 py-1.5">
            {[
              ["Mega Deal", "/sale"],
              ["New Arrival", "/new-arrivals"],
              ["Top Selling", "/search?q=top%20selling"],
              ["Free Delivery", "/search?q=free%20delivery"],
              ["Merchandise", "/search?q=merchandise"],
            ].map(([label, path]) => (
              <button key={label} onClick={() => navigate(path)} className="group flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-gray-800 transition-colors hover:bg-rose-50 hover:text-rose-700">
                <BoltIcon className="text-orange-500 transition-colors group-hover:text-rose-600" style={{ fontSize: 14 }} />
                {label}
              </button>
            ))}
          </div>
          <div className="mb-4 border-y border-gray-200 bg-gray-50 px-3 py-3">
            <p className="text-xs font-semibold text-gray-900">Categories</p>
          </div>
          <div className="space-y-1">
            {tree.map((sideCat) => {
              const active = sideCat.slug === category;
              return (
                <div key={sideCat.slug}>
                  <button onClick={() => navigate(`/${sideCat.slug}`)} className="grid w-full grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-gray-50" style={{ color: active ? sideCat.accent : "#111827", backgroundColor: active ? `${sideCat.accent}0A` : undefined }}>
                    <span className="truncate">{sideCat.name}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium tabular-nums text-gray-500">{Number(sideCat.count || 0).toLocaleString("en-US")}</span>
                    <span className="text-base text-gray-400">›</span>
                  </button>
                  {active && (sideCat.groups || []).flatMap((group) => group.items.map((item) => ({ item, count: group.counts?.[item] || 0 }))).map(({ item, count }) => {
                    const slug = item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    return (
                      <button key={slug} onClick={() => navigate(`/${sideCat.slug}/${slug}`)} className="grid w-full grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-2 px-6 py-2 text-left text-xs transition-colors hover:bg-gray-100" style={{ backgroundColor: subcategory === slug ? "#f3f4f6" : "transparent", color: subcategory === slug ? "#111827" : "#4b5563" }}>
                        <span className="truncate">{item}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] tabular-nums text-gray-500">{Number(count).toLocaleString("en-US")}</span>
                        <span />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-5">
          <SearchBar className="w-full" placeholder="Search a product" />
          {!isNewArrivals && tree.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tree.map((mainCat) => {
                const active = mainCat.slug === category;
                return <button key={mainCat.slug} onClick={() => navigate(`/${mainCat.slug}`)} className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors" style={active ? { borderColor: mainCat.accent, color: "#fff", backgroundColor: mainCat.accent } : { borderColor: `${mainCat.accent}45`, color: mainCat.accent, backgroundColor: `${mainCat.accent}0A` }}>{mainCat.name}</button>;
              })}
            </div>
          )}
      {/* Breadcrumb */}
      <nav className="mt-5 text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        {!isNewArrivals && category && (
          <>
            <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
            <Crumb to={`/${category}`} className="capitalize">{cat?.name || prettify(category)}</Crumb>
          </>
        )}
        {subcategory && (
          <>
            <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
            <span className="px-1.5 py-0.5 capitalize" style={{ color: "var(--subtitle)" }}>{prettify(subcategory)}</span>
          </>
        )}
      </nav>

      {/* Title + count */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          {title}
          <span className="ml-2 h-1.5 w-10 inline-block rounded-full align-middle" style={{ backgroundColor: accent }} />
        </h1>
        <p className="text-sm text-gray-500">{loading ? "Loading…" : `${total} products`}</p>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        {!isNewArrivals && subChips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate(`/${category}`)} className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={!subcategory ? { backgroundColor: accent, borderColor: accent, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
              All {cat?.name || prettify(category)}
            </button>
            {subChips.map((s) => {
              const active = subcategory === s.slug;
              return (
                <button key={s.slug} onClick={() => navigate(`/${category}/${s.slug}`)} className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  style={active ? { backgroundColor: accent, borderColor: accent, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
                  {s.name}
                </button>
              );
            })}
          </div>
        ) : (<span />)}

        <label className="flex items-center gap-2 text-sm text-gray-600">
          Sort:
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-gray-400">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)
          : products.map((p) => <ReferenceProductCard key={p.id} product={p} accent={accent} onOpen={openProduct} onAdd={handleAdd} />)}
      </div>

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">No products found in this collection yet.</p>
          <button onClick={() => navigate("/")} className="mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Back to Home</button>
        </div>
      )}

      {!loading && <Pagination page={page} total={total} pageSize={pageSize} className="mt-10" onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onChange={(next) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}

        </main>
      </div>

      <button onClick={() => navigate("/contact-us")} className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_30px_rgba(0,0,0,.22)] transition-transform hover:scale-105 md:bottom-6 md:right-6" style={{ backgroundColor: accent }} aria-label="Message us">
        <ChatBubbleOutlineIcon />
      </button>

      {/* Quick-add popup */}
      <QuickAddModal slug={quickSlug} onClose={() => setQuickSlug(null)} />
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

// src/components/SearchResults.jsx — /search?q= results page
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getProducts } from "../api";
import { useWishlist } from "../context/WishlistContext";
import QuickAddModal from "./QuickAddModal";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => { e.target.onerror = null; e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`; };

function ProductTile({ product, onOpen, onAdd, onBuyNow }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  return (
    <div className="group relative rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {discount > 0 && <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND }}>-{discount}%</span>}
      <button aria-label="Wishlist" onClick={(e) => { e.stopPropagation(); toggle(product); }} className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center" style={{ color: wished ? BRAND : "#6b7280" }}>
        {wished ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </button>
      <div className="h-52 sm:h-60 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-3 cursor-pointer" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" onError={(e) => imgFallback(e, product.name)} />
      </div>
      <div className="px-3 pt-2 pb-3 flex flex-col">
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 h-5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} className="w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: BRAND }}>
            <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} /> Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";

  const [input, setInput] = useState(q);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [quickSlug, setQuickSlug] = useState(null);

  const runSearch = useCallback((term) => {
    if (!term.trim()) { setItems([]); setTotal(0); return; }
    setLoading(true);
    getProducts({ search: term.trim(), pageSize: 48 })
      .then((res) => { setItems(res.items || []); setTotal(res.total ?? (res.items || []).length); })
      .catch(() => { setItems([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, []);

  // Re-run whenever the URL ?q= changes
  useEffect(() => { setInput(q); runSearch(q); }, [q, runSearch]);

  const submit = (e) => {
    e.preventDefault();
    const term = input.trim();
    if (term) setParams({ q: term });   // updates URL → triggers effect
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:py-8 pb-24 lg:pb-8 overflow-x-hidden">
      <nav className="text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Link to="/" className="no-underline px-1.5 py-0.5 rounded" style={{ color: "var(--title)" }}>Home</Link>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>Search</span>
      </nav>

      {/* Search box */}
      <form onSubmit={submit} className="flex items-center bg-gray-100 rounded-full px-4 py-2.5 mb-5 max-w-2xl">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for products, brands and more"
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        <button type="submit" aria-label="Search" className="text-gray-500"><SearchIcon fontSize="small" /></button>
      </form>

      {/* Heading */}
      {q && (
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          {loading ? "Searching…" : `${total} result${total !== 1 ? "s" : ""} for "${q}"`}
        </h1>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-72 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : !q ? (
        <div className="text-center py-20 text-gray-400">
          <SearchIcon style={{ fontSize: 48 }} />
          <p className="mt-2 text-sm">Type something above to search products.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 font-medium">No products found for "{q}".</p>
          <p className="text-sm text-gray-400 mt-1">Try a different keyword or check the spelling.</p>
          <Link to="/new-arrivals" className="inline-block mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Browse New Arrivals</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {items.map((p) => (
            <ProductTile
              key={p.id ?? p.slug}
              product={p}
              onOpen={(prod) => navigate(`/product/${prod.slug}`)}
              onAdd={(prod) => setQuickSlug(prod.slug)}
              onBuyNow={(prod) => navigate(`/product/${prod.slug}`)}
            />
          ))}
        </div>
      )}

      <QuickAddModal slug={quickSlug} onClose={() => setQuickSlug(null)} />
    </div>
  );
}

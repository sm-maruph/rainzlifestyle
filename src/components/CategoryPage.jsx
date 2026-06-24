// src/components/CategoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getProducts, getCategories } from "../api"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const prettify = (s = "") => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function ProductCard({ product, accent, onOpen }) {
  const [wished, setWished] = useState(false);
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="group">
      <div
        className="relative rounded-xl bg-gray-50 overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
        onClick={() => onOpen(product)}
      >
        {discount > 0 && (
          <span
            className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
            style={{ backgroundColor: accent }}
          >
            -{discount}%
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            setWished((v) => !v); // TODO: wire to WishlistContext
          }}
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center transition-colors"
          style={{ color: wished ? accent : "#6b7280" }}
        >
          {wished ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </button>

        <div className="aspect-[3/4] flex items-center justify-center p-3 bg-gradient-to-b from-gray-50 to-gray-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => imgFallback(e, product.name)}
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(product); // size selection happens on the product page
          }}
          className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} />
          Add to Bag
        </button>
      </div>

      <div className="px-1 pt-2">
        <p
          className="text-sm text-gray-800 truncate cursor-pointer hover:underline"
          onClick={() => onOpen(product)}
        >
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>
          )}
        </div>
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
  const [visible, setVisible] = useState(12);

  // category meta (name, accent, subcategory chips) from the tree
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

  const title = isNewArrivals
    ? "New Arrivals"
    : subcategory
    ? prettify(subcategory)
    : cat?.name || prettify(category);

  // Load the category tree once (for titles + chips)
  useEffect(() => {
    let alive = true;
    getCategories().then((t) => alive && setTree(t));
    return () => {
      alive = false;
    };
  }, []);

  // Fetch products whenever the route or sort changes
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setVisible(12);
    const query = isNewArrivals ? { sort } : { category, subcategory, sort };
    getProducts(query)
      .then((res) => alive && setProducts(res.items))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [category, subcategory, sort, isNewArrivals]);

  const shown = products.slice(0, visible);
  const openProduct = (p) => navigate(`/product/${p.slug}`);

  return (
    <div className="w-[94%] max-w-[1500px] mx-auto py-8 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-3">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        {!isNewArrivals && category && (
          <>
            <span className="mx-1.5">/</span>
            <Link to={`/${category}`} className="hover:text-gray-800 capitalize">
              {cat?.name || prettify(category)}
            </Link>
          </>
        )}
        {subcategory && (
          <>
            <span className="mx-1.5">/</span>
            <span className="text-gray-800">{prettify(subcategory)}</span>
          </>
        )}
      </nav>

      {/* Title + count */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          {title}
          <span className="ml-2 h-1.5 w-10 inline-block rounded-full align-middle" style={{ backgroundColor: accent }} />
        </h1>
        <p className="text-sm text-gray-500">{loading ? "Loading…" : `${products.length} products`}</p>
      </div>

      {/* Toolbar: subcategory chips + sort */}
      <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        {!isNewArrivals && subChips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/${category}`)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={
                !subcategory
                  ? { backgroundColor: accent, borderColor: accent, color: "#fff" }
                  : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }
              }
            >
              All {cat?.name || prettify(category)}
            </button>
            {subChips.map((s) => {
              const active = subcategory === s.slug;
              return (
                <button
                  key={s.slug}
                  onClick={() => navigate(`/${category}/${s.slug}`)}
                  className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  style={
                    active
                      ? { backgroundColor: accent, borderColor: accent, color: "#fff" }
                      : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }
                  }
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        ) : (
          <span />
        )}

        <label className="flex items-center gap-2 text-sm text-gray-600">
          Sort:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-gray-400"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mt-2 w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mt-1 w-1/3 animate-pulse" />
              </div>
            ))
          : shown.map((p) => (
              <ProductCard key={p.id} product={p} accent={accent} onOpen={openProduct} />
            ))}
      </div>

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">No products found in this collection yet.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            Back to Home
          </button>
        </div>
      )}

      {/* Load more */}
      {!loading && visible < products.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + 12)}
            className="rounded-full border-2 px-8 py-2.5 text-sm font-semibold transition-colors hover:text-white"
            style={{ borderColor: accent, color: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accent)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Load More ({shown.length} of {products.length})
          </button>
        </div>
      )}
    </div>
  );
}

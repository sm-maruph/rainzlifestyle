// src/components/NewArrival.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getNewArrivals } from "../api"; // adjust path if your api lives elsewhere

const BRAND = "#E11D48"; // RAINZLIFESTYLE primary (keep in sync with Navbar / tailwind.config)
const BANNER_BG = "#ebebeb"; // cream banner
const BANNER_TEXT = "#000000"; // gold heading

const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;

function ProductTile({ product, onOpen, onAddToCart, onToggleWishlist, isWishlisted }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div
      className="group relative rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
      onClick={() => onOpen(product)}
    >
      {discount > 0 && (
        <span
          className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: BRAND }}
        >
          -{discount}%
        </span>
      )}

      {/* Wishlist button – visible on hover (optional; can be made always visible if you prefer) */}
      <button
        aria-label="Add to wishlist"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600"
        style={isWishlisted ? { color: BRAND } : { color: "#6b7280" }}
      >
        {isWishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </button>

      {/* Image – full width, always shows the whole picture */}
      <div className="aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x800/f3f4f6/9ca3af?text=RAINZ";
          }}
        />
      </div>

      {/* Info panel – always visible below the image, no overlay */}
      <div className="w-full bg-white px-3 pt-2 pb-3">
        <p className="text-sm text-gray-800 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} />
          Add to Bag
        </button>
      </div>
    </div>
  );
}
function SkeletonTile() {
  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
    </div>
  );
}

export default function NewArrival({
  title = "New Arrival",
  products: productsProp, // optional — if omitted, the component fetches its own data
  limit = 12,
  wishlistIds = [],
  onAddToCart,
  onToggleWishlist,
  onProductClick,
  viewAllPath = "/new-arrivals",
  showViewAll = true,
}) {
  const navigate = useNavigate();
  const [fetched, setFetched] = useState([]);
  const [loading, setLoading] = useState(!productsProp);

  // Fetch only when the parent didn't pass products
  useEffect(() => {
    if (productsProp) return;
    let alive = true;
    setLoading(true);
    getNewArrivals(limit)
      .then((data) => alive && setFetched(data))
      .catch(() => alive && setFetched([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productsProp, limit]);

  const products = productsProp ?? fetched;

  const handleOpen = (p) => (onProductClick ? onProductClick(p) : navigate(`/product/${p.slug}`));
  const handleAdd = (p) => (onAddToCart ? onAddToCart(p) : navigate(`/product/${p.slug}`));
  const handleWish = (p) => onToggleWishlist?.(p);

  return (
    <section className="w-full bg-gray-50">
      {/* Cream banner header */}
      <div className="w-full py-1" style={{ backgroundColor: BANNER_BG }}>
        <h2
          className="text-center text-xl md:text-2xl font-extrabold uppercase tracking-[0.15em]"
          style={{ color: BANNER_TEXT }}
        >
          {title}
        </h2>
      </div>

      {/* Product grid */}
      <div className="w-[94%] max-w-[1500px] mx-auto px-1 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {loading
            ? Array.from({ length: limit }).map((_, i) => <SkeletonTile key={i} />)
            : products.map((product) => (
              <ProductTile
                key={product.id ?? product.slug}
                product={product}
                onOpen={handleOpen}
                onAddToCart={handleAdd}
                onToggleWishlist={handleWish}
                isWishlisted={wishlistIds.includes(product.id)}
              />
            ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="text-center text-gray-400 py-10">No new arrivals yet.</p>
        )}

        {showViewAll && !loading && products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate(viewAllPath)}
              className="rounded-full border-2 px-8 py-2.5 text-sm font-semibold transition-colors hover:text-white"
              style={{ borderColor: BRAND, color: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              View All New Arrivals &rarr;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

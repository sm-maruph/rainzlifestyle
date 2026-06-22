// src/components/Wishlist.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getNewArrivals } from "../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

function WishCard({ product, onRemove, onAddToCart, onOpen }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="group relative rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {discount > 0 && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND }}>
          -{discount}%
        </span>
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(product)}
        aria-label="Remove from wishlist"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-rose-600"
      >
        <CloseIcon style={{ fontSize: 18 }} />
      </button>

      {/* Image */}
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

      {/* Info */}
      <div className="p-3">
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
        </div>
        <button
          onClick={() => onAddToCart(product)}
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

export default function Wishlist({ items: itemsProp, onRemove, onAddToCart }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(itemsProp ?? []);
  const [loading, setLoading] = useState(!itemsProp);

  // Seed with dummy data until WishlistContext exists
  useEffect(() => {
    if (itemsProp) return;
    let alive = true;
    setLoading(true);
    getNewArrivals(8)
      .then((data) => alive && setItems(data))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [itemsProp]);

  const handleRemove = (p) => {
    onRemove ? onRemove(p) : setItems((list) => list.filter((x) => x.id !== p.id));
  };
  const handleAdd = (p) => (onAddToCart ? onAddToCart(p) : navigate(`/product/${p.slug}`));
  const openProduct = (p) => navigate(`/product/${p.slug}`);

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="w-[94%] max-w-[600px] mx-auto py-24 text-center">
        <FavoriteBorderIcon style={{ fontSize: 56, color: "#d1d5db" }} />
        <h1 className="mt-3 text-xl font-bold text-gray-900">Your wishlist is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Save items you love and find them here anytime.</p>
        <Link
          to="/new-arrivals"
          className="inline-block mt-5 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-[94%] max-w-[1300px] mx-auto py-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <FavoriteIcon style={{ color: BRAND }} /> My Wishlist
          <span className="ml-2 h-1.5 w-10 inline-block rounded-full align-middle" style={{ backgroundColor: BRAND }} />
        </h1>
        {!loading && (
          <p className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mt-2 w-3/4 animate-pulse" />
                <div className="h-8 bg-gray-100 rounded mt-2 animate-pulse" />
              </div>
            ))
          : items.map((p) => (
              <WishCard
                key={p.id}
                product={p}
                onRemove={handleRemove}
                onAddToCart={handleAdd}
                onOpen={openProduct}
              />
            ))}
      </div>
    </div>
  );
}

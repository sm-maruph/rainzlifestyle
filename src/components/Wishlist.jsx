// src/components/Wishlist.jsx — wired to WishlistContext + CartContext
import { useNavigate, Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => { e.target.onerror = null; e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`; };

function WishCard({ product, onRemove, onAddToCart, onOpen }) {
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  return (
    <div className="group relative rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {discount > 0 && <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND }}>-{discount}%</span>}
      <button onClick={() => onRemove(product.id)} aria-label="Remove" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-rose-600"><CloseIcon style={{ fontSize: 18 }} /></button>
      <div className="aspect-[3/4] flex items-center justify-center p-3 bg-gradient-to-b from-gray-50 to-gray-100 cursor-pointer" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" onError={(e) => imgFallback(e, product.name)} />
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-800 truncate cursor-pointer hover:underline" onClick={() => onOpen(product)}>{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
        </div>
        <button onClick={() => onAddToCart(product)} className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: BRAND }}>
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} /> Add to Bag
        </button>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const navigate = useNavigate();
  const { items, loading, remove } = useWishlist();
  const { add: addToCart } = useCart();

  const openProduct = (p) => navigate(`/product/${p.slug}`);

  const handleAdd = (p) => {
    const needsVariant = (p.sizes && p.sizes.length) || (p.colors && p.colors.length);
    if (needsVariant) {
      // must choose a size/color first — open the product page
      navigate(`/product/${p.slug}`);
    } else {
      // no variants → add straight to the bag
      addToCart(p, { qty: 1 });
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className="w-[94%] max-w-[600px] mx-auto py-24 text-center">
        <nav className="text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>Wishlist</span>
      </nav>
        <FavoriteBorderIcon style={{ fontSize: 56, color: "#d1d5db" }} />
        <h1 className="mt-3 text-xl font-bold text-gray-900">Your wishlist is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Save items you love and find them here anytime.</p>
        <Link to="/new-arrivals" className="inline-block mt-5 rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="w-[94%] max-w-[1300px] mx-auto py-8">
      <nav className="text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>Wishlist</span>
      </nav>
      <div className="flex items-end justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <FavoriteIcon style={{ color: BRAND }} /> My Wishlist
          <span className="ml-2 h-1.5 w-10 inline-block rounded-full align-middle" style={{ backgroundColor: BRAND }} />
        </h1>
        {!loading && <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i}><div className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" /><div className="h-3 bg-gray-100 rounded mt-2 w-3/4 animate-pulse" /><div className="h-8 bg-gray-100 rounded mt-2 animate-pulse" /></div>
          ))
          : items.map((p) => <WishCard key={p.id} product={p} onRemove={remove} onAddToCart={handleAdd} onOpen={openProduct} />)}
      </div>
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

// src/components/ProductDetail.jsx — wired to CartContext + WishlistContext
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getProductBySlug, getProducts } from "../api";
import { useCart } from "../context/CartContext";
import ProductReviews from "./ProductReviews";
import { useWishlist } from "../context/WishlistContext";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { AnimatePresence, motion } from "framer-motion";


const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

function MiniCard({ product, onOpen, onAdd }) {
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  return (
    <div className="group min-w-0 cursor-pointer" onClick={() => onOpen(product)}>
      <div className="relative overflow-hidden border border-gray-200 bg-gray-50 transition-shadow hover:shadow-lg">
        {discount > 0 && <span className="absolute left-1.5 top-1.5 z-10 rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">-{discount}%</span>}
        <div className="aspect-square flex items-center justify-center overflow-hidden bg-gray-50">
          <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" onError={(e) => imgFallback(e, product.name)} />
        </div>
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-t bg-white/95 px-2 py-0.5 text-[10px] shadow-sm">
          <strong className="text-gray-900">{taka(product.price)}</strong>
          {product.oldPrice && <span className="text-gray-400 line-through">{taka(product.oldPrice)}</span>}
        </div>
      </div>
      <button onClick={(event) => { event.stopPropagation(); onAdd(product); }} className="mt-2 flex w-full items-center justify-center gap-1 bg-black px-2 py-2 text-[11px] font-bold text-white transition hover:bg-gray-800"><AddIcon style={{ fontSize: 15 }} /> Add to Bag</button>
    </div>
  );
}

function RelatedRow({ title, items, onOpen, onAdd }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10" >
      <h2 className="mb-3 border-b border-gray-900 pb-2 text-base font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((p) => <MiniCard key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} />)}
      </div>
    </section>
  );
}

function SizeChart({ chart }) {
  const [unit, setUnit] = useState("in");
  const [open, setOpen] = useState(true);
  if (!chart?.columns?.length || !chart?.rows?.length) return null;
  const displayValue = (value, columnIndex) => {
    if (columnIndex === 0 || value === "" || value == null) return value;
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    if (unit === "in") return Number.isInteger(number) ? number : Number(number.toFixed(2));
    const cm = number * 2.54;
    return Number.isInteger(cm) ? cm : Number(cm.toFixed(1));
  };
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50" aria-expanded={open}>
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100" style={{ color: BRAND }}><StraightenOutlinedIcon style={{ fontSize: 17 }} /></span>
          <span className="block text-sm font-bold text-gray-800">Size Chart</span>
        </span>
        <KeyboardArrowDownIcon className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} style={{ fontSize: 20 }} />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-3.5 pb-3.5 pt-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {chart.note && <p className="text-[10px] text-gray-500">{chart.note}</p>}
            </div>
            <div className="inline-flex rounded-md bg-gray-100 p-0.5">
              <button onClick={() => setUnit("in")} className={`rounded px-2.5 py-1 text-[10px] font-bold ${unit === "in" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>INCH</button>
              <button onClick={() => setUnit("cm")} className={`rounded px-2.5 py-1 text-[10px] font-bold ${unit === "cm" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>CM</button>
            </div>
          </div>
          <div className="mt-2.5 max-h-64 overflow-auto rounded-md border border-gray-100">
            <table className="w-full min-w-[460px] border-collapse text-left text-[11px]">
              <thead>
                <tr>{chart.columns.map((column) => <th key={column.key} className="sticky top-0 border-b border-white bg-gray-100 px-2 py-1.5 font-bold text-gray-800">{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {chart.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {chart.columns.map((column, columnIndex) => <td key={column.key} className="border-b border-white bg-gray-50 px-2 py-1.5 text-gray-600">{displayValue(row[column.key], columnIndex)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [sameCategory, setSameCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainImg, setMainImg] = useState(null);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [transitionMode, setTransitionMode] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setRelated([]); setSameCategory([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    getProductBySlug(slug)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        if (p) {
          setMainImg(p.images?.[0] || p.image);
          setColor(null);
          setSize(null);
          setQty(1);
          // Row 1 — same subcategory ("You may also like")
          const relatedIds = new Set();
          if (p.subcategory) {
            getProducts({ subcategory: p.subcategory, pageSize: 12 }).then((res) => {
              if (!alive) return;
              const rel = (res.items || []).filter((x) => x.id !== p.id).slice(0, 6);
              rel.forEach((r) => relatedIds.add(r.id));
              setRelated(rel);
              // Row 2 — same category, excluding current + the related ones above
              getProducts({ category: p.category, pageSize: 16 }).then((res2) => {
                if (!alive) return;
                setSameCategory((res2.items || []).filter((x) => x.id !== p.id && !relatedIds.has(x.id)).slice(0, 6));
              });
            });
          } else {
            setRelated([]);
            getProducts({ category: p.category, pageSize: 16 }).then((res2) => {
              if (!alive) return;
              setSameCategory((res2.items || []).filter((x) => x.id !== p.id).slice(0, 6));
            });
          }
        }
      })
      .catch(() => alive && setProduct(null))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [slug]);

  const openProduct = (p) => navigate(`/product/${p.slug}`);
  const scrollToReviews = () => document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const needsSize = product?.sizes?.length > 0;
  const needsColor = product?.colors?.length > 0;
  const tracksSizeStock = needsSize && Object.keys(product?.sizeStock || {}).length > 0;
  const selectedSizeStock = tracksSizeStock && size ? Number(product.sizeStock[size] || 0) : null;
  const productAvailable = tracksSizeStock
    ? product.sizes.some((item) => Number(product.sizeStock[item] || 0) > 0)
    : product?.inStock;

  const validate = () => {
    if (needsColor && !color) { setError("Please select a color first."); return false; }
    if (needsSize && !size) { setError("Please select a size first."); return false; }
    if (tracksSizeStock && Number(product.sizeStock[size] || 0) <= 0) { setError("The selected size is out of stock."); return false; }
    if (selectedSizeStock != null && qty > selectedSizeStock) { setError(`Only ${selectedSizeStock} item${selectedSizeStock === 1 ? "" : "s"} available in size ${size}.`); return false; }
    if (!qty || qty < 1) { setError("Please select a quantity."); return false; }
    setError("");
    return true;
  };

  const addToCart = () => {
    if (!validate()) return;
    const result = add(product, { size, color, qty });
    setToast(`Added ${qty} × ${product.name}${size ? ` (${size})` : ""} to your bag`);
    setTimeout(() => setToast(""), 2500);
    return result;
  };

  const addToCartAndCheckout = async () => {
    if (!validate()) return;
    setTransitionMode("bag");
    try {
      await addToCart();
      window.setTimeout(() => setTransitionMode(null), 1900);
    } catch (e) {
      setTransitionMode(null);
      setError(e.message || "Could not add this item to your bag.");
    }
  };

  const buyNowWithTransition = () => {
    if (!validate()) return;
    setTransitionMode("checkout");
    window.setTimeout(() => navigate("/checkout", { state: { items: [{
      id: product.id, productId: product.id, slug: product.slug, name: product.name,
      image: product.image, price: product.price, oldPrice: product.oldPrice, size, color, qty,
    }] } }), 1400);
  };

  const addSuggestedToBag = async (suggested) => {
    const sizes = suggested.sizes || [];
    const sizeStock = suggested.sizeStock || {};
    const suggestedSize = sizes.find((item) => !Object.keys(sizeStock).length || Number(sizeStock[item] || 0) > 0) || null;
    const suggestedColor = suggested.colors?.[0]?.name || null;
    if (sizes.length && !suggestedSize) { openProduct(suggested); return; }
    setTransitionMode("bag");
    try {
      await add(suggested, { size: suggestedSize, color: suggestedColor, qty: 1 });
      window.setTimeout(() => setTransitionMode(null), 1900);
    } catch (e) {
      setTransitionMode(null);
      setError(e.message || "Could not add this item to your bag.");
    }
  };

  const wished = product ? has(product.id) : false;

  if (loading) {
    return (
      <div className="w-[94%] max-w-[1300px] mx-auto py-10 grid lg:grid-cols-2 gap-10" style={{ backgroundColor: "var(--primary)" }}>
        <div className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-7 bg-gray-100 rounded w-2/3 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-[94%] max-w-[1300px] mx-auto py-24 text-center" style={{ backgroundColor: "var(--primary)" }}>
        <p className="text-gray-500">Sorry, this product could not be found.</p>
        <button onClick={() => navigate("/")} className="mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Back to Home</button>
      </div>
    );
  }

  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;


  const onZoomMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const img = e.currentTarget.querySelector("img");
    if (img) img.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="w-[94%] max-w-[1400px] mx-auto py-3 sm:py-5 lg:py-6" style={{ backgroundColor: "var(--primary)" }}>
      <nav className="mb-4 flex flex-wrap items-center gap-y-1 text-[11px] sm:mb-5 sm:text-xs" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <Crumb to={`/${product.category}`}>{product.categoryName}</Crumb>
        {product.subcategory && (
          <>
            <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
            <Crumb to={`/${product.category}/${product.subcategory}`}>{product.subcategoryName}</Crumb>
          </>
        )}
      </nav>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr] xl:gap-7">
        {/* Gallery */}
        <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-3">
          <div className="order-2 flex max-w-full gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:gap-3 sm:overflow-visible sm:pb-0">
            {(product.images || [product.image]).map((src, i) => (
              <button
                key={i}
                onClick={() => setMainImg(src)}
                className="h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-16 sm:w-16 sm:rounded-lg"
                style={{ borderColor: mainImg === src ? BRAND : "#e5e7eb" }}
              >
                <img src={src} alt="" className="h-full w-full object-cover" onError={(e) => imgFallback(e)} />
              </button>
            ))}
          </div>

          <div
            className="group order-1 min-w-0 flex-1 cursor-zoom-in overflow-hidden border border-gray-100 bg-gray-50 sm:order-2"
            onMouseMove={onZoomMove}
          >
            <img
              src={mainImg}
              alt={product.name}
              className="aspect-square h-auto w-full object-contain transition-transform duration-300 ease-out sm:group-hover:scale-[1.8]"
              onError={(e) => imgFallback(e, product.name)}
            />
          </div>
        </div>

        {/* Info */}
        <div className="relative min-w-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h1 className="pr-14 text-xl font-bold leading-tight text-gray-900 sm:text-2xl">{product.name}</h1>
          <button onClick={() => toggle(product)} aria-label="Wishlist" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-400" style={{ color: wished ? BRAND : "#6b7280" }}>
            {wished ? <FavoriteIcon style={{ fontSize: 20 }} /> : <FavoriteBorderIcon style={{ fontSize: 20 }} />}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="tracking-[1px] text-amber-400" aria-label={`${product.rating || 0} out of 5 stars`}>{Array.from({ length: 5 }).map((_, index) => <span key={index} className={index < Math.round(product.rating || 0) ? "" : "text-gray-300"}>★</span>)}</span>
            <span className="font-bold text-gray-700">{Number(product.rating || 0).toFixed(1)}</span>
            <span className="text-gray-300">|</span>
            <button onClick={scrollToReviews} className="font-medium text-gray-500 underline decoration-gray-300 underline-offset-2 transition hover:text-gray-900 hover:decoration-gray-600">
              {product.reviews || 0} review{product.reviews === 1 ? "" : "s"}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-2xl font-extrabold text-gray-900">{taka(product.price)}</span>
            {product.oldPrice && <span className="text-sm text-gray-400 line-through sm:text-lg">{taka(product.oldPrice)}</span>}
            {discount > 0 && <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500">{discount}% Off</span>}
          </div>

          {product.colors?.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold text-gray-700 sm:text-sm">Color: <span className="font-normal text-gray-500">{color || "Please select"}</span></p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button key={c.name} onClick={() => { setColor(c.name); setError(""); }} title={c.name} className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 sm:h-8 sm:w-8" style={{ backgroundColor: c.hex, borderColor: color === c.name ? BRAND : "#e5e7eb" }} />
                ))}
              </div>
            </div>
          )}

          {needsSize && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-700">Select Size</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const soldOut = tracksSizeStock && Number(product.sizeStock[s] || 0) <= 0;
                  return (
                    <span key={s} className="group relative inline-flex" tabIndex={soldOut ? 0 : undefined}>
                      <button disabled={soldOut} onClick={() => { setSize(s); setQty(1); setError(""); }} className="min-w-[40px] rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-300 disabled:opacity-50 disabled:line-through sm:min-w-[44px] sm:px-3 sm:py-2 sm:text-sm"
                        style={size === s ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#374151" }}>
                        {s}
                      </button>
                      {soldOut && (
                        <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-lg group-hover:block group-focus:block">
                          Out of stock for this size
                          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 inline-flex align-top">
            <div className="inline-flex items-center rounded-md border border-gray-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 sm:px-3 sm:py-2"><RemoveIcon style={{ fontSize: 15 }} /></button>
              <span className="px-3 text-xs font-semibold sm:px-4 sm:text-sm">{qty}</span>
              <button onClick={() => setQty((q) => selectedSizeStock == null ? q + 1 : Math.min(selectedSizeStock, q + 1))} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 sm:px-3 sm:py-2"><AddIcon style={{ fontSize: 15 }} /></button>
            </div>
          </div>

          {error && <p className="mt-5 -mb-1 text-sm font-medium text-red-500">{error}</p>}

          <div className="ml-3 mt-3 inline-flex gap-2 align-top">
            <button onClick={addToCartAndCheckout} disabled={!productAvailable}
              className="flex items-center justify-center gap-1 rounded px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: "#050505" }}>
              <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} /> <span>Add To Bag</span>
            </button>
            <button onClick={buyNowWithTransition} disabled={!productAvailable} className="rounded border border-gray-900 bg-white px-4 py-2.5 text-xs font-bold text-gray-900 transition hover:bg-gray-100 disabled:opacity-40">Buy Now</button>
          </div>

          <div className="hidden">
            <LocalShippingOutlinedIcon style={{ fontSize: 18 }} />
            Cash on delivery available • Delivery in 2–5 days
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-900"><span className="mr-1.5 text-green-600">✓</span>Easy Returns &amp; Exchange</p>
                <ChevronRightIcon style={{ fontSize: 16, color: "#6b7280" }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                <span><b className="text-green-600">✓</b> Tell us within 7 days</span>
                <span><b className="text-green-600">✓</b> Easy exchange support</span>
                <span><b className="text-green-600">✓</b> Fast resolution</span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <h2 className="text-sm font-bold text-gray-900">Product Description</h2>
            {product.description ? <div className="mt-2 whitespace-pre-line text-xs leading-6 text-gray-600 sm:text-sm">{product.description}</div> : <p className="mt-2 text-xs italic text-gray-400">No product description is available yet.</p>}
          </div>
          <div className="mt-3"><SizeChart chart={product.sizeChart} /></div>
        </div>
      </div>

      {/* Full-width product description */}
      <section className="hidden">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full" style={{ backgroundColor: BRAND }} />
            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">Product Description</h2>
              <p className="text-xs text-gray-400">Details, materials and product information</p>
            </div>
          </div>
        </div>
        <div className="w-full px-5 py-5 sm:px-6 sm:py-6">
          {product.description ? (
            <div className="w-full whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-[15px]">
              {product.description}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">No product description is available yet.</p>
          )}
        </div>
      </section>
      <RelatedRow title="You may also like" items={related} onOpen={openProduct} onAdd={addSuggestedToBag} />
      <RelatedRow title={`More from ${product.categoryName}`} items={sameCategory} onOpen={openProduct} onAdd={addSuggestedToBag} />
      <ProductReviews productId={product.id} onAddToCart={addToCartAndCheckout} onBuyNow={buyNowWithTransition} productAvailable={productAvailable} />



      {toast && !transitionMode && false && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rounded-full bg-gray-900 text-white text-sm px-5 py-2.5 shadow-lg">{toast}</div>
      )}
      <AnimatePresence>
        {transitionMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .35 } }} className="fixed inset-0 z-[250] flex items-center justify-center bg-gray-950/25 p-4 backdrop-blur-[3px]">
            <motion.div initial={{ opacity: 0, y: 28, scale: .88 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: .96 }} transition={{ type: "spring", stiffness: 220, damping: 19 }} className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-white/70 bg-white p-7 text-center shadow-2xl">
              <motion.span animate={{ scale: [1, 1.35, 1], opacity: [.16, .28, .16] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute left-1/2 top-7 h-20 w-20 -translate-x-1/2 rounded-full bg-green-400" />
              <motion.div initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: .12, type: "spring", stiffness: 260 }} className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
                {transitionMode === "bag" ? <ShoppingBagOutlinedIcon style={{ fontSize: 28 }} /> : <span className="text-2xl font-black">✓</span>}
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }} className="mt-5 text-lg font-extrabold text-gray-900">{transitionMode === "bag" ? "Added to your bag" : "Ready for checkout"}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .42 }} className="mt-1.5 text-sm leading-5 text-gray-500">{transitionMode === "bag" ? "Your item is safely in the bag. Keep exploring!" : "Taking you to secure checkout…"}</motion.p>
              <div className="mx-auto mt-5 h-1.5 w-36 overflow-hidden rounded-full bg-gray-100"><motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: transitionMode === "bag" ? 1.9 : 1.4, ease: "linear" }} className="h-full rounded-full" style={{ backgroundColor: BRAND }} /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  function Crumb({ to, children }) {
    return (
      <Link
        to={to}
        className="no-underline px-1.5 py-0.5 rounded transition-colors"
        style={{ color: "var(--title)" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--button)"; e.currentTarget.style.color = "var(--button-text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--title)"; }}
      >
        {children}
      </Link>
    );
  }
}

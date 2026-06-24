// src/components/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { getProductBySlug, getProducts } from "../api"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x800/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

function Stars({ rating = 0 }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex text-amber-400 align-middle">
      {Array.from({ length: 5 }).map((_, i) =>
        i < full ? (
          <StarRoundedIcon key={i} style={{ fontSize: 18 }} />
        ) : (
          <StarBorderRoundedIcon key={i} style={{ fontSize: 18 }} />
        )
      )}
    </span>
  );
}

function MiniCard({ product, onOpen }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  return (
    <div className="group cursor-pointer" onClick={() => onOpen(product)}>
      <div className="relative rounded-xl bg-gray-50 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND }}>
            -{discount}%
          </span>
        )}
        <div className="aspect-[3/4] flex items-center justify-center p-3 bg-gradient-to-b from-gray-50 to-gray-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => imgFallback(e, product.name)}
          />
        </div>
      </div>
      <p className="text-sm text-gray-800 truncate mt-2 px-1">{product.name}</p>
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
        {product.oldPrice && <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>}
      </div>
    </div>
  );
}

function RelatedRow({ title, items, onOpen }) {
  if (!items?.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {title}
        <span className="ml-2 h-1.5 w-10 inline-block rounded-full align-middle" style={{ backgroundColor: BRAND }} />
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => (
          <MiniCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [sameCategory, setSameCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainImg, setMainImg] = useState(null);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
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
          // "More from this category" (exclude current + the same-subcategory related)
          getProducts({ category: p.category, limit: 16 }).then((res) => {
            if (!alive) return;
            const relatedIds = new Set((p.related || []).map((r) => r.id));
            setSameCategory(res.items.filter((x) => x.id !== p.id && !relatedIds.has(x.id)).slice(0, 5));
          });
        }
      })
      .catch(() => alive && setProduct(null))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [slug]);

  const openProduct = (p) => navigate(`/product/${p.slug}`);

  const needsSize = product?.sizes?.length > 0;
  const needsColor = product?.colors?.length > 0;

  const validate = () => {
    if (needsColor && !color) {
      setError("Please select a color first.");
      return false;
    }
    if (needsSize && !size) {
      setError("Please select a size first.");
      return false;
    }
    if (!qty || qty < 1) {
      setError("Please select a quantity.");
      return false;
    }
    setError("");
    return true;
  };

  const addToCart = () => {
    if (!validate()) return;
    // TODO: replace with CartContext.add({ ...product, size, color, qty })
    setToast(`Added ${qty} × ${product.name}${size ? ` (${size})` : ""} to your bag`);
    setTimeout(() => setToast(""), 2500);
  };

  const buyNow = () => {
    if (!validate()) return;
    // Carry the selected item into checkout (until CartContext exists)
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      oldPrice: product.oldPrice,
      size,
      color,
      qty,
    };
    navigate("/checkout", { state: { items: [item] } });
  };

  if (loading) {
    return (
      <div className="w-[94%] max-w-[1300px] mx-auto py-10 grid lg:grid-cols-2 gap-10">
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
      <div className="w-[94%] max-w-[1300px] mx-auto py-24 text-center">
        <p className="text-gray-500">Sorry, this product could not be found.</p>
        <button onClick={() => navigate("/")} className="mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          Back to Home
        </button>
      </div>
    );
  }

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="w-[94%] max-w-[1300px] mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-5">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to={`/${product.category}`} className="hover:text-gray-800">{product.categoryName}</Link>
        <span className="mx-1.5">/</span>
        <Link to={`/${product.category}/${product.subcategory}`} className="hover:text-gray-800">{product.subcategoryName}</Link>
      </nav>

      {/* Main product */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-3 order-1">
            {(product.images || [product.image]).map((src, i) => (
              <button
                key={i}
                onClick={() => setMainImg(src)}
                className="h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors"
                style={{ borderColor: mainImg === src ? BRAND : "#e5e7eb" }}
              >
                <img src={src} alt="" className="h-full w-full object-cover" onError={(e) => imgFallback(e)} />
              </button>
            ))}
          </div>
          <div className="flex-1 order-2 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <img src={mainImg} alt={product.name} className="max-h-[520px] w-full object-contain" onError={(e) => imgFallback(e, product.name)} />
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">{product.brand}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Stars rating={product.rating} />
            <span>{product.rating}</span>
            <span className="text-gray-300">|</span>
            <span>{product.reviews} reviews</span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{taka(product.price)}</span>
            {product.oldPrice && <span className="text-lg text-gray-400 line-through">{taka(product.oldPrice)}</span>}
            {discount > 0 && (
              <span className="text-sm font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: BRAND }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Stock */}
          <p className={`mt-2 text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
            {product.inStock ? "In stock" : "Out of stock"}
          </p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="font-normal text-gray-500">{color || "Please select"}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => { setColor(c.name); setError(""); }}
                    title={c.name}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c.hex, borderColor: color === c.name ? BRAND : "#e5e7eb" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {needsSize && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setError(""); }}
                    className="min-w-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                    style={
                      size === s
                        ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                        : { backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#374151" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
            <div className="inline-flex items-center rounded-md border border-gray-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">
                <RemoveIcon style={{ fontSize: 16 }} />
              </button>
              <span className="px-4 text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50">
                <AddIcon style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

          {/* Validation message */}
          {error && (
            <p className="mt-5 -mb-1 text-sm font-medium text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={addToCart}
              disabled={!product.inStock}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 rounded-md border-2 py-3 text-sm font-bold transition-colors hover:text-white disabled:opacity-40"
              style={{ borderColor: BRAND, color: BRAND }}
              onMouseEnter={(e) => product.inStock && (e.currentTarget.style.backgroundColor = BRAND)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <ShoppingBagOutlinedIcon style={{ fontSize: 18 }} />
              Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={!product.inStock}
              className="flex-1 min-w-[160px] rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: BRAND }}
            >
              Buy Now
            </button>
            <button
              onClick={() => setWished((v) => !v)}
              aria-label="Wishlist"
              className="rounded-md border border-gray-200 px-3 transition-colors hover:border-gray-300"
              style={{ color: wished ? BRAND : "#6b7280" }}
            >
              {wished ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </button>
          </div>

          {/* Shipping note */}
          <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
            <LocalShippingOutlinedIcon style={{ fontSize: 18 }} />
            Cash on delivery available • Delivery in 2–5 days
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Product Details</h3>
            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Related: same subcategory */}
      <RelatedRow title="You may also like" items={product.related} onOpen={openProduct} />

      {/* Related: more from the same category */}
      <RelatedRow title={`More from ${product.categoryName}`} items={sameCategory} onOpen={openProduct} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rounded-full bg-gray-900 text-white text-sm px-5 py-2.5 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

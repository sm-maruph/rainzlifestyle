// src/components/QuickAddModal.jsx — choose size/color/qty before adding to the bag
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getProductBySlug } from "../api";
import { useCart } from "../context/CartContext";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => { e.target.onerror = null; e.target.src = `https://placehold.co/300x400/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`; };

export default function QuickAddModal({ slug, onClose }) {
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true); setError(""); setProduct(null);
    setSize(null); setColor(null); setQty(1); setDone(false);
    getProductBySlug(slug)
      .then((p) => { if (alive) setProduct(p); })
      .catch(() => alive && setError("Could not load this product."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug]);

  if (!slug) return null;

  const needsSize = product?.sizes?.length > 0;
  const needsColor = product?.colors?.length > 0;

  const confirm = () => {
    if (needsColor && !color) { setError("Please select a color."); return; }
    if (needsSize && !size) { setError("Please select a size."); return; }
    add(product, { size, color, qty });
    setDone(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Add to Bag</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
        </div>

        {loading ? (
          <div className="p-5 flex gap-4">
            <div className="h-32 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-3"><div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" /><div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" /><div className="h-8 bg-gray-100 rounded animate-pulse" /></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-500">{error}</div>
        ) : done ? (
          <div className="p-8 text-center">
            <CheckCircleRoundedIcon style={{ fontSize: 48, color: "#16a34a" }} />
            <p className="mt-2 text-sm font-semibold text-gray-800">Added to your bag</p>
          </div>
        ) : product ? (
          <>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-4">
                <img src={product.image} alt={product.name} className="h-32 w-24 rounded-lg object-cover bg-gray-100" onError={(e) => imgFallback(e, product.name)} />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-gray-400">{product.brand}</p>
                  <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{taka(product.price)}</span>
                    {product.oldPrice && <span className="text-sm text-gray-400 line-through">{taka(product.oldPrice)}</span>}
                  </div>
                  <p className={`mt-1 text-xs font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>{product.inStock ? "In stock" : "Out of stock"}</p>
                </div>
              </div>

              {needsColor && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Color: <span className="font-normal text-gray-500">{color || "Please select"}</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((c) => (
                      <button key={c.name} onClick={() => { setColor(c.name); setError(""); }} title={c.name} className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: c.hex, borderColor: color === c.name ? BRAND : "#e5e7eb" }} />
                    ))}
                  </div>
                </div>
              )}

              {needsSize && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button key={s} onClick={() => { setSize(s); setError(""); }} className="min-w-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                        style={size === s ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#374151" }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
                <div className="inline-flex items-center rounded-md border border-gray-200">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50"><RemoveIcon style={{ fontSize: 16 }} /></button>
                  <span className="px-4 text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50"><AddIcon style={{ fontSize: 16 }} /></button>
                </div>
              </div>

              {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            </div>

            <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={confirm} disabled={!product.inStock} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: BRAND }}>
                <ShoppingBagOutlinedIcon style={{ fontSize: 18 }} /> Add to Bag
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

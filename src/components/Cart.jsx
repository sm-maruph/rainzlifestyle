// src/components/Cart.jsx — wired to CartContext (real API when logged in, localStorage for guests)
import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useCart } from "../context/CartContext";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/120x150/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

export default function Cart() {
  const navigate = useNavigate();
  const { items, loading, setQty, remove } = useCart();

  const { subtotal, savings, count } = useMemo(() => {
    let sub = 0, save = 0, c = 0;
    items.forEach((it) => {
      const q = it.qty || 1;
      sub += it.price * q;
      if (it.oldPrice) save += (it.oldPrice - it.price) * q;
      c += q;
    });
    return { subtotal: sub, savings: save, count: c };
  }, [items]);

  // CartContext.setQty takes an absolute quantity
  const dec = (it) => setQty(it, Math.max(1, (it.qty || 1) - 1));
  const inc = (it) => setQty(it, (it.qty || 1) + 1);

  // Go to checkout using the cart (no router state → Checkout reads the cart and clears it on success)
  const checkout = () => navigate("/checkout");

  // Loading
  if (loading) {
    return (
      <div className="w-[94%] max-w-[1200px] mx-auto py-10">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Empty
  if (items.length === 0) {
    return (
      <div className="w-[94%] max-w-[600px] mx-auto py-24 text-center">
        <ShoppingBagOutlinedIcon style={{ fontSize: 56, color: "#d1d5db" }} />
        <h1 className="mt-3 text-xl font-bold text-gray-900">Your bag is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Looks like you haven't added anything yet.</p>
        <Link to="/new-arrivals" className="inline-block mt-5 rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-[94%] max-w-[1200px] mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
        Shopping Bag <span className="text-base font-medium text-gray-400">({count} item{count !== 1 ? "s" : ""})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.cartId} className="flex gap-4 rounded-xl border border-gray-100 p-3 bg-white">
              <img
                src={it.image}
                alt={it.name}
                className="h-28 w-24 rounded-lg object-cover bg-gray-100 cursor-pointer flex-shrink-0"
                onClick={() => it.slug && navigate(`/product/${it.slug}`)}
                onError={(e) => imgFallback(e, it.name)}
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:underline" onClick={() => it.slug && navigate(`/product/${it.slug}`)}>
                    {it.name}
                  </p>
                  <button onClick={() => remove(it)} className="text-gray-400 hover:text-rose-600 flex-shrink-0" aria-label="Remove">
                    <DeleteOutlineIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{[it.size, it.color].filter(Boolean).join(" • ")}</p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-md border border-gray-200">
                    <button onClick={() => dec(it)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50" aria-label="Decrease"><RemoveIcon style={{ fontSize: 15 }} /></button>
                    <span className="px-3 text-sm font-semibold">{it.qty || 1}</span>
                    <button onClick={() => inc(it)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50" aria-label="Increase"><AddIcon style={{ fontSize: 15 }} /></button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{taka(it.price * (it.qty || 1))}</p>
                    {it.oldPrice && <p className="text-xs text-gray-400 line-through">{taka(it.oldPrice * (it.qty || 1))}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link to="/new-arrivals" className="inline-block text-sm font-semibold" style={{ color: BRAND }}>&larr; Continue Shopping</Link>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({count} items)</span><span>{taka(subtotal)}</span></div>
              {savings > 0 && <div className="flex justify-between text-green-600"><span>You save</span><span>- {taka(savings)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-gray-400">Calculated at checkout</span></div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>{taka(subtotal)}</span></div>
            </div>

            <button onClick={checkout} className="mt-5 w-full rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: BRAND }}>
              Proceed to Checkout
            </button>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <LocalShippingOutlinedIcon style={{ fontSize: 16 }} />
              Delivery charge (৳80 inside / ৳120 outside Dhaka) added at checkout.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

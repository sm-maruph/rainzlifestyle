// src/components/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { getNewArrivals } from "../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/120x150/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

export default function Cart({ items: itemsProp, onUpdateQty, onRemove }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(itemsProp ?? []);
  const [loading, setLoading] = useState(!itemsProp);

  // Seed with dummy cart items until CartContext exists
  useEffect(() => {
    if (itemsProp) return;
    let alive = true;
    setLoading(true);
    getNewArrivals(3)
      .then((data) => {
        if (!alive) return;
        const seeded = data.map((p, i) => ({
          ...p,
          size: p.sizes?.[i % (p.sizes.length || 1)] || null,
          color: p.colors?.[0]?.name || null,
          qty: i === 0 ? 2 : 1,
        }));
        setItems(seeded);
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [itemsProp]);

  const setQty = (item, delta) => {
    if (onUpdateQty) return onUpdateQty(item, delta);
    setItems((list) =>
      list.map((it) =>
        it.id === item.id && it.size === item.size && it.color === item.color
          ? { ...it, qty: Math.max(1, (it.qty || 1) + delta) }
          : it
      )
    );
  };

  const remove = (item) => {
    if (onRemove) return onRemove(item);
    setItems((list) => list.filter((it) => !(it.id === item.id && it.size === item.size && it.color === item.color)));
  };

  const { subtotal, savings, count } = useMemo(() => {
    let sub = 0;
    let save = 0;
    let c = 0;
    items.forEach((it) => {
      const q = it.qty || 1;
      sub += it.price * q;
      if (it.oldPrice) save += (it.oldPrice - it.price) * q;
      c += q;
    });
    return { subtotal: sub, savings: save, count: c };
  }, [items]);

  const checkout = () => navigate("/checkout", { state: { items } });

  // Loading
  if (loading) {
    return (
      <div className="w-[94%] max-w-[1200px] mx-auto py-10">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
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
          {items.map((it, i) => (
            <div key={`${it.id}-${it.size}-${it.color}-${i}`} className="flex gap-4 rounded-xl border border-gray-100 p-3 bg-white">
              <img
                src={it.image}
                alt={it.name}
                className="h-28 w-24 rounded-lg object-cover bg-gray-100 cursor-pointer flex-shrink-0"
                onClick={() => navigate(`/product/${it.slug}`)}
                onError={(e) => imgFallback(e, it.name)}
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:underline" onClick={() => navigate(`/product/${it.slug}`)}>
                    {it.name}
                  </p>
                  <button onClick={() => remove(it)} className="text-gray-400 hover:text-rose-600 flex-shrink-0" aria-label="Remove">
                    <DeleteOutlineIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{[it.size, it.color].filter(Boolean).join(" • ")}</p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  {/* Qty */}
                  <div className="inline-flex items-center rounded-md border border-gray-200">
                    <button onClick={() => setQty(it, -1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50" aria-label="Decrease">
                      <RemoveIcon style={{ fontSize: 15 }} />
                    </button>
                    <span className="px-3 text-sm font-semibold">{it.qty || 1}</span>
                    <button onClick={() => setQty(it, 1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50" aria-label="Increase">
                      <AddIcon style={{ fontSize: 15 }} />
                    </button>
                  </div>
                  {/* Line total */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{taka(it.price * (it.qty || 1))}</p>
                    {it.oldPrice && (
                      <p className="text-xs text-gray-400 line-through">{taka(it.oldPrice * (it.qty || 1))}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link to="/new-arrivals" className="inline-block text-sm font-semibold" style={{ color: BRAND }}>
            &larr; Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>{taka(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You save</span>
                  <span>- {taka(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-gray-400">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{taka(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              className="mt-5 w-full rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
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

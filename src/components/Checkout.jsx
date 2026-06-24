// src/components/Checkout.jsx — wired to real placeOrder()
import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { placeOrder } from "../api";
import { useCart } from "../context/CartContext";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const DELIVERY = { inside: 80, outside: 120 };
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x150/f3f4f6/9ca3af?text=RAINZ"; };

export default function Checkout() {
  const location = useLocation();
  const cart = useCart();

  // Items: "Buy Now" (router state) wins; otherwise the cart.
  const buyNow = location.state?.items;
  const fromCart = !(buyNow && buyNow.length);
  const items = fromCart ? cart.items || [] : buyNow;

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", note: "" });
  const [deliveryArea, setDeliveryArea] = useState("inside"); // 'inside' | 'outside'
  const [payment, setPayment] = useState("cod");              // 'cod' | 'online'
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);

  // Totals (display only — server recomputes authoritative totals)
  const { subtotal, delivery, total } = useMemo(() => {
    const sub = items.reduce((s, it) => s + Number(it.price) * (it.qty || 1), 0);
    const del = DELIVERY[deliveryArea];
    return { subtotal: sub, delivery: del, total: sub + del };
  }, [items, deliveryArea]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[0-9+\-\s]{6,}$/.test(form.phone.trim())) e.phone = "Valid phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (items.length === 0) return;
    if (!validate()) return;
    setPlacing(true);
    setApiError("");

    const payload = {
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
      delivery_zone: deliveryArea === "inside" ? "inside_dhaka" : "outside_dhaka",
      payment_method: payment === "cod" ? "cod" : "sslcommerz",
      coupon_code: null,
      note: form.note.trim() || null,
      items: items.map((it) => ({
        product_id: it.productId || it.id || null,
        name: it.name,
        image: it.image || null,
        price: Number(it.price),
        size: it.size || null,
        color: it.color || null,
        qty: it.qty || 1,
      })),
    };

    try {
      const res = await placeOrder(payload); // { order_code, subtotal, delivery, discount, total }
      if (fromCart && cart.clear) cart.clear(); // empty the cart after a cart checkout
      setPlaced({ orderId: res.order_code, total: res.total ?? total, payment, deliveryArea });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setApiError(e.message || "Could not place the order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ---- Empty state ----
  if (items.length === 0 && !placed) {
    return (
      <div className="w-[94%] max-w-[900px] mx-auto py-24 text-center">
        <p className="text-gray-500">You have no items to checkout.</p>
        <Link to="/new-arrivals" className="inline-block mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ---- Success state ----
  if (placed) {
    return (
      <div className="w-[94%] max-w-[640px] mx-auto py-20 text-center">
        <CheckCircleRoundedIcon style={{ fontSize: 64, color: "#16a34a" }} />
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {placed.payment === "online" ? "Payment Successful" : "Order Placed!"}
        </h1>
        <p className="mt-2 text-gray-600">
          Your order <span className="font-semibold">#{placed.orderId}</span> has been confirmed.
        </p>
        <p className="mt-1 text-gray-600">
          {placed.payment === "online" ? `You paid ${taka(placed.total)}.` : `Please keep ${taka(placed.total)} ready for cash on delivery.`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-full border-2 px-6 py-2 text-sm font-semibold" style={{ borderColor: BRAND, color: BRAND }}>Back to Home</Link>
          <Link to={`/track-order?code=${placed.orderId}`} className="rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Track Order</Link>
        </div>
      </div>
    );
  }

  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  return (
    <div className="w-[94%] max-w-[1100px] mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">Checkout</h1>

      {apiError && <div className="mb-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{apiError}</div>}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: forms */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <LocalShippingOutlinedIcon style={{ fontSize: 20, color: BRAND }} /> Delivery Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Full Name *</label>
                <input {...field("name")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="Your name" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone *</label>
                <input {...field("phone")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="01XXXXXXXXX" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Address *</label>
                <textarea {...field("address")} rows={2} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="House, road, area" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-600">City / Thana</label>
                <input {...field("city")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="e.g. Mirpur" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Order Note (optional)</label>
                <input {...field("note")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="Any instructions" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Delivery Option</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "inside", label: "Inside Dhaka", note: "Delivery in 1–2 days" },
                { key: "outside", label: "Outside Dhaka", note: "Delivery in 3–5 days" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center justify-between rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors" style={{ borderColor: deliveryArea === opt.key ? BRAND : "#e5e7eb" }}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="area" checked={deliveryArea === opt.key} onChange={() => setDeliveryArea(opt.key)} style={{ accentColor: BRAND }} />
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
                      <span className="block text-xs text-gray-500">{opt.note}</span>
                    </span>
                  </span>
                  <span className="text-sm font-bold text-gray-900">{taka(DELIVERY[opt.key])}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer" style={{ borderColor: payment === "cod" ? BRAND : "#e5e7eb" }}>
                <input type="radio" name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} style={{ accentColor: BRAND }} />
                <PaymentsOutlinedIcon style={{ color: "#6b7280" }} />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">Cash on Delivery</span>
                  <span className="block text-xs text-gray-500">Pay with cash when your order arrives</span>
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer" style={{ borderColor: payment === "online" ? BRAND : "#e5e7eb" }}>
                <input type="radio" name="pay" checked={payment === "online"} onChange={() => setPayment("online")} style={{ accentColor: BRAND }} />
                <CreditCardOutlinedIcon style={{ color: "#6b7280" }} />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">Pay Now (Online)</span>
                  <span className="block text-xs text-gray-500">bKash / Nagad / Card via SSLCommerz</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT: order summary */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3">
                  <img src={it.image} alt={it.name} className="h-16 w-14 rounded object-cover bg-gray-100" onError={imgFallback} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{it.name}</p>
                    <p className="text-xs text-gray-500">{[it.size, it.color].filter(Boolean).join(" • ")} {it.size || it.color ? "•" : ""} Qty {it.qty || 1}</p>
                    <p className="text-sm font-semibold text-gray-900">{taka(it.price * (it.qty || 1))}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{taka(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                <span>{taka(delivery)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>{taka(total)}</span></div>
            </div>

            <button onClick={submitOrder} disabled={placing} className="mt-5 w-full rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
              {placing ? "Placing order…" : payment === "online" ? `Pay Now · ${taka(total)}` : `Place Order (COD) · ${taka(total)}`}
            </button>
            <p className="mt-2 text-[11px] text-center text-gray-400">
              {payment === "online" ? "Online payment gateway coming soon — order is recorded now." : "Delivery charge is collected with cash on delivery."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

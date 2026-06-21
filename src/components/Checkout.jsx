// src/components/Checkout.jsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;

// Delivery charges
const DELIVERY = { inside: 80, outside: 120 };

// Dummy coupons (move to your API later)
const COUPONS = {
  RAINZ10: { type: "percent", value: 10, label: "10% off" },
  FLAT100: { type: "flat", value: 100, label: "৳100 off" },
  FREESHIP: { type: "shipping", value: 0, label: "Free delivery" },
};

const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "https://placehold.co/120x150/f3f4f6/9ca3af?text=RAINZ";
};

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Items come from "Buy Now" (router state); fallback empty until CartContext exists
  const items = location.state?.items || [];

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", note: "" });
  const [deliveryArea, setDeliveryArea] = useState("inside"); // 'inside' | 'outside'
  const [payment, setPayment] = useState("cod"); // 'cod' | 'online'
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(null); // order result

  // Totals
  const { subtotal, discount, delivery, total, freeShip } = useMemo(() => {
    const sub = items.reduce((s, it) => s + it.price * (it.qty || 1), 0);
    let disc = 0;
    let free = false;
    if (coupon) {
      if (coupon.type === "percent") disc = Math.round((sub * coupon.value) / 100);
      else if (coupon.type === "flat") disc = Math.min(coupon.value, sub);
      else if (coupon.type === "shipping") free = true;
    }
    const base = DELIVERY[deliveryArea];
    const del = free ? 0 : base;
    return { subtotal: sub, discount: disc, delivery: del, freeShip: free, total: Math.max(0, sub - disc) + del };
  }, [items, coupon, deliveryArea]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = COUPONS[code];
    if (found) {
      setCoupon({ code, ...found });
      setCouponMsg(`Applied: ${found.label}`);
    } else {
      setCoupon(null);
      setCouponMsg("Invalid coupon code");
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[0-9+\-\s]{6,}$/.test(form.phone.trim())) e.phone = "Valid phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (items.length === 0) return;
    if (!validate()) return;
    const orderId = "RZ" + Math.floor(100000 + Math.random() * 900000);
    // TODO: POST order to your backend / trigger SSLCommerz-bKash for online payment
    setPlaced({ orderId, total, payment, deliveryArea });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Empty state ----
  if (items.length === 0 && !placed) {
    return (
      <div className="w-[94%] max-w-[900px] mx-auto py-24 text-center">
        <p className="text-gray-500">You have no items to checkout.</p>
        <Link
          to="/new-arrivals"
          className="inline-block mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
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
          {placed.payment === "online"
            ? `You paid ${taka(placed.total)}.`
            : `Please keep ${taka(placed.total)} ready for cash on delivery.`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-full border-2 px-6 py-2 text-sm font-semibold" style={{ borderColor: BRAND, color: BRAND }}>
            Back to Home
          </Link>
          <Link to="/account/orders" className="rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="w-[94%] max-w-[1100px] mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery information */}
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

          {/* Delivery option */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Delivery Option</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "inside", label: "Inside Dhaka", note: "Delivery in 1–2 days" },
                { key: "outside", label: "Outside Dhaka", note: "Delivery in 3–5 days" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors"
                  style={{ borderColor: deliveryArea === opt.key ? BRAND : "#e5e7eb" }}
                >
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

          {/* Payment method */}
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

            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3">
                  <img src={it.image} alt={it.name} className="h-16 w-14 rounded object-cover bg-gray-100" onError={imgFallback} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{it.name}</p>
                    <p className="text-xs text-gray-500">
                      {[it.size, it.color].filter(Boolean).join(" • ")} {it.size || it.color ? "•" : ""} Qty {it.qty || 1}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{taka(it.price * (it.qty || 1))}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Discount coupon"
                  className="flex-1 min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 uppercase"
                />
                <button onClick={applyCoupon} className="rounded-md px-4 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs mt-1 ${coupon ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">Try: RAINZ10, FLAT100, FREESHIP</p>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{taka(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- {taka(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                <span>{freeShip ? <span className="text-green-600">FREE</span> : taka(delivery)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{taka(total)}</span>
              </div>
            </div>

            {/* Place order */}
            <button
              onClick={placeOrder}
              className="mt-5 w-full rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              {payment === "online" ? `Pay Now · ${taka(total)}` : `Place Order (COD) · ${taka(total)}`}
            </button>
            <p className="mt-2 text-[11px] text-center text-gray-400">
              {payment === "online"
                ? "You'll be redirected to a secure payment page."
                : "Delivery charge is collected with cash on delivery."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

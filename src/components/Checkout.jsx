// src/components/Checkout.jsx — real placeOrder() + coupon (admin discounts), mobile-responsive
import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { placeOrder, validateCoupon, rememberGuestOrder } from "../api";
import { useCart } from "../context/CartContext";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const DELIVERY = { inside: 80, outside: 120 };
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x150/f3f4f6/9ca3af?text=RAINZ"; };

export default function Checkout() {
  const location = useLocation();
  const cart = useCart();

  const buyNow = location.state?.items;
  const fromCart = !(buyNow && buyNow.length);
  const items = fromCart ? cart.items || [] : buyNow;

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", note: "" });
  const [deliveryArea, setDeliveryArea] = useState("inside");
  const [payment, setPayment] = useState("cod");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);

  // ----- Coupon state -----
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const subtotal = useMemo(() => items.reduce((s, it) => s + Number(it.price) * (it.qty || 1), 0), [items]);
  const delivery = coupon?.freeShipping ? 0 : DELIVERY[deliveryArea];
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal + delivery - discount);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCheckingCoupon(true); setCouponError("");
    try {
      const res = await validateCoupon(code, subtotal);
      if (res && res.valid) {
        setCoupon({
          code: res.code || code.toUpperCase(),
          discount: Number(res.discount) || 0,
          freeShipping: !!res.freeShipping,
        });
        setCouponError("");
      } else {
        setCoupon(null);
        setCouponError(res?.error || res?.message || "Invalid or expired coupon.");
      }
    } catch (e) {
      setCoupon(null);
      setCouponError(e.message || "Could not validate the coupon.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => { setCoupon(null); setCouponInput(""); setCouponError(""); };

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
      coupon_code: coupon?.code || null,
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
      const res = await placeOrder(payload);
      // Remember this order on the device so guests can find it under "My Orders"
      rememberGuestOrder(res.order_code);
      if (fromCart && cart.clear) cart.clear();
      setPlaced({ orderId: res.order_code, total: res.total ?? total, payment, deliveryArea });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setApiError(e.message || "Could not place the order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !placed) {
    return (
      <div className="w-full max-w-[900px] mx-auto px-4 py-24 text-center">
        <p className="text-gray-500">You have no items to checkout.</p>
        <Link to="/new-arrivals" className="inline-block mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="w-full max-w-[640px] mx-auto px-4 py-20 text-center">
        <CheckCircleRoundedIcon style={{ fontSize: 64, color: "#16a34a" }} />
        <h1 className="mt-3 text-2xl font-bold text-gray-900">{placed.payment === "online" ? "Payment Successful" : "Order Placed!"}</h1>
        <p className="mt-2 text-gray-600">Your order <span className="font-semibold">#{placed.orderId}</span> has been confirmed.</p>
        <p className="mt-1 text-gray-600">{placed.payment === "online" ? `You paid ${taka(placed.total)}.` : `Please keep ${taka(placed.total)} ready for cash on delivery.`}</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/" className="rounded-full border-2 px-6 py-2 text-sm font-semibold text-center" style={{ borderColor: BRAND, color: BRAND }}>Back to Home</Link>
          <Link to={`/track-order?code=${placed.orderId}`} className="rounded-full px-6 py-2 text-sm font-semibold text-white text-center" style={{ backgroundColor: BRAND }}>Track Order</Link>
        </div>
      </div>
    );
  }

  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 lg:pb-8 overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6">Checkout</h1>

      {apiError && <div className="mb-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{apiError}</div>}

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <LocalShippingOutlinedIcon style={{ fontSize: 20, color: BRAND }} /> Delivery Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-sm text-gray-600">Full Name *</label>
                <input {...field("name")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="Your name" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="min-w-0">
                <label className="text-sm text-gray-600">Phone *</label>
                <input {...field("phone")} type="tel" inputMode="tel" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="01XXXXXXXXX" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2 min-w-0">
                <label className="text-sm text-gray-600">Address *</label>
                <textarea {...field("address")} rows={2} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none" placeholder="House, road, area" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div className="min-w-0">
                <label className="text-sm text-gray-600">City / Thana</label>
                <input {...field("city")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="e.g. Mirpur" />
              </div>
              <div className="min-w-0">
                <label className="text-sm text-gray-600">Order Note (optional)</label>
                <input {...field("note")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" placeholder="Any instructions" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Delivery Option</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "inside", label: "Inside Dhaka", note: "Delivery in 1–2 days" },
                { key: "outside", label: "Outside Dhaka", note: "Delivery in 3–5 days" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center justify-between gap-2 rounded-lg border-2 px-3 sm:px-4 py-3 cursor-pointer transition-colors" style={{ borderColor: deliveryArea === opt.key ? BRAND : "#e5e7eb" }}>
                  <span className="flex items-center gap-3 min-w-0">
                    <input type="radio" name="area" checked={deliveryArea === opt.key} onChange={() => setDeliveryArea(opt.key)} style={{ accentColor: BRAND }} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
                      <span className="block text-xs text-gray-500">{opt.note}</span>
                    </span>
                  </span>
                  <span className="text-sm font-bold text-gray-900 shrink-0">{taka(DELIVERY[opt.key])}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border-2 px-3 sm:px-4 py-3 cursor-pointer" style={{ borderColor: payment === "cod" ? BRAND : "#e5e7eb" }}>
                <input type="radio" name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} style={{ accentColor: BRAND }} />
                <PaymentsOutlinedIcon style={{ color: "#6b7280" }} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800">Cash on Delivery</span>
                  <span className="block text-xs text-gray-500">Pay with cash when your order arrives</span>
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border-2 px-3 sm:px-4 py-3 cursor-pointer" style={{ borderColor: payment === "online" ? BRAND : "#e5e7eb" }}>
                <input type="radio" name="pay" checked={payment === "online"} onChange={() => setPayment("online")} style={{ accentColor: BRAND }} />
                <CreditCardOutlinedIcon style={{ color: "#6b7280" }} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800">Pay Now (Online)</span>
                  <span className="block text-xs text-gray-500">bKash / Nagad / Card via SSLCommerz</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1 min-w-0">
          <div className="rounded-xl border border-gray-200 p-4 sm:p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3">
                  <img src={it.image} alt={it.name} className="h-16 w-14 rounded object-cover bg-gray-100 shrink-0" onError={imgFallback} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{it.name}</p>
                    <p className="text-xs text-gray-500 truncate">{[it.size, it.color].filter(Boolean).join(" • ")}{(it.size || it.color) ? " • " : ""}Qty {it.qty || 1}</p>
                    <p className="text-sm font-semibold text-gray-900">{taka(it.price * (it.qty || 1))}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {coupon ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-green-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-700 min-w-0">
                    <LocalOfferOutlinedIcon style={{ fontSize: 16 }} className="shrink-0" /> <span className="truncate">{coupon.code} applied</span>
                  </span>
                  <button onClick={removeCoupon} className="text-green-700 hover:text-green-900 shrink-0"><CloseIcon style={{ fontSize: 16 }} /></button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Coupon code"
                      className="flex-1 min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                    />
                    <button onClick={applyCoupon} disabled={checkingCoupon || !couponInput.trim()} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 shrink-0" style={{ backgroundColor: BRAND }}>
                      {checkingCoupon ? "…" : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between gap-2 text-gray-600"><span>Subtotal</span><span className="shrink-0">{taka(subtotal)}</span></div>
              <div className="flex justify-between gap-2 text-gray-600">
                <span className="min-w-0 truncate">Delivery ({deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                <span className="shrink-0">{taka(delivery)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between gap-2 text-green-600"><span className="min-w-0 truncate">Discount ({coupon.code})</span><span className="shrink-0">− {taka(discount)}</span></div>
              )}
              <div className="flex justify-between gap-2 text-base font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span className="shrink-0">{taka(total)}</span></div>
            </div>

            <button onClick={submitOrder} disabled={placing} className="hidden lg:block mt-5 w-full rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
              {placing ? "Placing order…" : payment === "online" ? `Pay Now · ${taka(total)}` : `Place Order (COD) · ${taka(total)}`}
            </button>
            <p className="mt-2 text-[11px] text-center text-gray-400">
              {payment === "online" ? "Online payment gateway coming soon — order is recorded now." : "Delivery charge is collected with cash on delivery."}
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky place-order bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="shrink-0">
          <p className="text-[11px] text-gray-500 leading-none">Total</p>
          <p className="text-lg font-extrabold text-gray-900 leading-tight">{taka(total)}</p>
        </div>
        <button onClick={submitOrder} disabled={placing} className="flex-1 min-w-0 rounded-md py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
          {placing ? "Placing…" : payment === "online" ? "Pay Now" : "Place Order (COD)"}
        </button>
      </div>
    </div>
  );
}

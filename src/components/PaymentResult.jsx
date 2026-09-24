import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { getPaymentStatus, rememberGuestOrder } from "../api/orders";
import { useCart } from "../context/CartContext";

export default function PaymentResult({ success = false }) {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const reason = params.get("reason");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const cart = useCart();
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const cleaned = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    if (!/^[0-9a-f]{64}$/.test(token)) {
      setError("This payment link is invalid.");
      setLoading(false);
      return;
    }
    getPaymentStatus(token).then((data) => {
      if (!active) return;
      setReceipt(data);
      rememberGuestOrder(data.order_code);
    }).catch(() => { if (active) setError("We could not check your payment. Please check again before placing another order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, refresh]);

  useEffect(() => {
    if (receipt?.payment_status !== "paid" || cart.loading || cleaned.current) return;
    cleaned.current = true;
    // Remove only purchased cart lines that have not changed while the customer was away.
    (async () => {
      try {
        const key = `rainz_payment_${token}`;
        const saved = JSON.parse(sessionStorage.getItem(key) || "null");
        if (saved?.fromCart) {
          for (const item of saved.items) {
            const current = cartRef.current.items.find((entry) => entry.cartId === item.cartId
              && entry.qty === item.qty && entry.size === item.size && entry.color === item.color);
            if (current) await cartRef.current.remove(current);
          }
        }
        sessionStorage.removeItem(key);
      } catch { /* The confirmed payment does not depend on cart cleanup. */ }
    })();
  }, [receipt, token, cart.loading]);

  const paid = receipt?.payment_status === "paid";
  const review = receipt?.payment_status === "review";
  const uncertain = reason === "unverified" || reason === "initiation" || success;
  const title = loading ? "Checking your payment..." : paid ? "Payment Successful" : review ? "Payment under review" : error || uncertain ? "Payment not confirmed" : reason === "cancelled" ? "Payment cancelled" : "Payment failed";
  return (
    <div className="max-w-[640px] mx-auto px-4 py-16 sm:py-24 text-center">
      {!loading && (paid ? <CheckCircleRoundedIcon style={{ fontSize: 64, color: "#16a34a" }} /> : <ErrorOutlineRoundedIcon style={{ fontSize: 64, color: "#dc2626" }} />)}
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900" role="status">{title}</h1>
      {error ? <p className="mt-3 text-gray-600" role="alert">{error}</p> : !loading && (
        <>
          <p className="mt-3 text-gray-600">Order <strong>#{receipt?.order_code}</strong></p>
          <p className="mt-2 text-gray-600">{paid
            ? `Your payment of BDT ${Number(receipt.total).toLocaleString("en-BD")} has been verified. Thank you for shopping with RAINZ.`
            : review ? "Your payment needs a manual review. Please contact us with your order number."
              : "Your order is saved, but payment has not been confirmed. If money was deducted, check the status again. Contact us with your order number before placing another order."}</p>
        </>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {!paid && <button onClick={() => setRefresh((value) => value + 1)} disabled={loading} className="rounded-full border-2 px-6 py-2 text-sm font-semibold disabled:opacity-50">Check payment status</button>}
        {receipt && <Link to={`/track-order?code=${encodeURIComponent(receipt.order_code)}`} className="rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Track order</Link>}
        <Link to="/" className="rounded-full border-2 px-6 py-2 text-sm font-semibold">Continue shopping</Link>
      </div>
    </div>
  );
}

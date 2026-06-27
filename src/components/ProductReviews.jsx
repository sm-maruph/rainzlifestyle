// src/components/ProductReviews.jsx — list + summary + submit form (guest-friendly)
import { useEffect, useState } from "react";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { getReviews, addReview } from "../api";
import { useAuth } from "../context/AuthContext";

const BRAND = "var(--brand)";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

function Stars({ value = 0, size = 18 }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex text-amber-400 align-middle">
      {Array.from({ length: 5 }).map((_, i) =>
        i < full ? <StarRoundedIcon key={i} style={{ fontSize: size }} /> : <StarBorderRoundedIcon key={i} style={{ fontSize: size }} />
      )}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = (hover || value) >= n;
        return (
          <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)} className="text-amber-400">
            {active ? <StarRoundedIcon style={{ fontSize: 28 }} /> : <StarBorderRoundedIcon style={{ fontSize: 28 }} />}
          </button>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ count: 0, avg: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const load = () => {
    if (!productId) return;
    setLoading(true);
    getReviews(productId).then(({ items, summary }) => { setItems(items); setSummary(summary); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  const submit = async () => {
    if (!rating) { setError("Please select a rating."); return; }
    setSubmitting(true); setError("");
    try {
      await addReview(productId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        reviewer_name: user ? undefined : name.trim() || undefined, // logged-in uses profile name; guest optional
      });
      setRating(0); setName(""); setTitle(""); setComment("");
      setDone(true); setTimeout(() => setDone(false), 2500);
      load();
    } catch (e) {
      setError(e.message || "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const pct = (n) => (summary.count ? Math.round((summary.dist[n] / summary.count) * 100) : 0);

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        Ratings & Reviews
        <span className="ml-2 h-1.5 w-10 inline-block rounded-full align-middle" style={{ backgroundColor: BRAND }} />
      </h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-gray-900">{summary.avg || 0}</p>
              <Stars value={summary.avg} />
              <p className="text-xs text-gray-500 mt-1">{summary.count} review{summary.count === 1 ? "" : "s"}</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3">{n}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct(n)}%`, backgroundColor: BRAND }} />
                  </div>
                  <span className="w-8 text-right">{summary.dist[n] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit form */}
          <div className="mt-6 rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-bold text-gray-800 mb-2">Write a review</p>
            <StarPicker value={rating} onChange={(n) => { setRating(n); setError(""); }} />
            {!user && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional — shows as Guest)" className="mt-3 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" />
            )}
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="mt-3 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Share your experience…" className="mt-3 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            {done && <p className="mt-2 text-sm text-green-600">Thanks! Your review was posted.</p>}
            <button onClick={submit} disabled={submitting} className="mt-3 w-full rounded-md py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
              {submitting ? "Posting…" : "Submit Review"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No reviews yet — be the first to review this product.</p>
          ) : (
            <div className="space-y-5">
              {items.map((r) => (
                <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: r.isGuest ? "#9ca3af" : BRAND }}>
                      {(r.name || "?")[0].toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.name}{r.isGuest && <span className="ml-1 text-[10px] font-medium text-gray-400">(guest)</span>}</p>
                      <div className="flex items-center gap-2"><Stars value={r.rating} size={15} /><span className="text-xs text-gray-400">{fmtDate(r.date)}</span></div>
                    </div>
                  </div>
                  {r.title && <p className="mt-2 text-sm font-semibold text-gray-800">{r.title}</p>}
                  {r.comment && <p className="mt-1 text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

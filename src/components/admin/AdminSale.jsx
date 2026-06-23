// src/components/admin/AdminSale.jsx
import { useEffect, useMemo, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { getProducts } from "../../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const SALE = "#7C3AED";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const today = () => new Date().toISOString().slice(0, 10);
const CATEGORIES = ["Men", "Women", "Kids", "Accessories"];

const STATUS_STYLE = {
  Active: "bg-green-50 text-green-700",
  Scheduled: "bg-amber-50 text-amber-700",
  Expired: "bg-gray-100 text-gray-500",
  Disabled: "bg-red-50 text-red-600",
};
const SCOPE_LABEL = { sitewide: "Sitewide", category: "Category", products: "Selected products" };

const computeStatus = (c) => {
  if (!c.enabled) return "Disabled";
  const now = today();
  if (c.start && now < c.start) return "Scheduled";
  if (c.expiry && now > c.expiry) return "Expired";
  return "Active";
};
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const discountText = (c) => (c.discountType === "percent" ? `${c.value}% OFF` : `${taka(c.value)} OFF`);

const SEED = [
  { id: 1, name: "Summer Mega Sale", scope: "sitewide", category: "", productIds: [], discountType: "percent", value: 30, start: "2026-06-01", expiry: "2026-07-31", enabled: true, banner: "Up to 30% off everything" },
  { id: 2, name: "Eid Men's Collection", scope: "category", category: "Men", productIds: [], discountType: "percent", value: 20, start: "2026-08-15", expiry: "2026-09-10", enabled: true, banner: "20% off Men's wear" },
  { id: 3, name: "End of Season Clearance", scope: "products", category: "", productIds: [], discountType: "fixed", value: 200, start: "2026-03-01", expiry: "2026-04-15", enabled: true, banner: "Flat ৳200 off selected items" },
];

const EMPTY = { id: null, name: "", scope: "sitewide", category: "Men", productIds: [], discountType: "percent", value: "", start: today(), expiry: "", enabled: true, banner: "" };

export default function AdminSale() {
  const [sales, setSales] = useState(SEED);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [errors, setErrors] = useState({});
  const [pickSearch, setPickSearch] = useState("");

  useEffect(() => {
    let alive = true;
    getProducts({ pageSize: 200 }).then((res) => alive && setProducts(res.items || res || [])).catch(() => {});
    return () => { alive = false; };
  }, []);

  const withStatus = useMemo(() => sales.map((c) => ({ ...c, status: computeStatus(c) })), [sales]);

  const affectedCount = (c) => {
    if (c.scope === "sitewide") return products.length;
    if (c.scope === "category") return products.filter((p) => (p.categoryName || p.category) === c.category).length;
    return c.productIds.length;
  };

  const openAdd = () => { setModal({ ...EMPTY }); setErrors({}); setPickSearch(""); };
  const openEdit = (c) => { setModal({ ...c, value: c.value || "" }); setErrors({}); setPickSearch(""); };
  const setField = (k, v) => setModal((m) => ({ ...m, [k]: v }));
  const toggleProduct = (id) =>
    setModal((m) => ({ ...m, productIds: m.productIds.includes(id) ? m.productIds.filter((x) => x !== id) : [...m.productIds, id] }));

  const validate = () => {
    const er = {};
    if (!modal.name.trim()) er.name = "Name is required";
    if (modal.value === "" || Number(modal.value) <= 0) er.value = "Enter a value greater than 0";
    if (modal.scope === "products" && modal.productIds.length === 0) er.products = "Select at least one product";
    if (modal.expiry && modal.start && modal.expiry < modal.start) er.expiry = "Expiry must be after start";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const rec = {
      id: modal.id ?? Date.now(),
      name: modal.name.trim(),
      scope: modal.scope,
      category: modal.scope === "category" ? modal.category : "",
      productIds: modal.scope === "products" ? modal.productIds : [],
      discountType: modal.discountType,
      value: Number(modal.value),
      start: modal.start || "",
      expiry: modal.expiry || "",
      enabled: modal.enabled,
      banner: modal.banner.trim(),
    };
    setSales((list) => {
      const idx = list.findIndex((c) => c.id === rec.id);
      if (idx >= 0) { const copy = [...list]; copy[idx] = rec; return copy; }
      return [rec, ...list];
    });
    setModal(null);
  };

  const remove = (c) => { if (window.confirm(`Delete sale "${c.name}"?`)) setSales((list) => list.filter((x) => x.id !== c.id)); };
  const toggle = (c) => setSales((list) => list.map((x) => (x.id === c.id ? { ...x, enabled: !x.enabled } : x)));

  const activeSale = withStatus.find((c) => c.status === "Active");
  const pickList = products.filter((p) => p.name.toLowerCase().includes(pickSearch.trim().toLowerCase()));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Sale Campaigns</h2>
          <p className="text-sm text-gray-500">{sales.length} campaigns</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
          <AddOutlinedIcon style={{ fontSize: 18 }} /> Create Sale
        </button>
      </div>

      {/* Active sale highlight */}
      {activeSale && (
        <div className="rounded-2xl text-white p-5 flex items-center gap-4 flex-wrap" style={{ background: `linear-gradient(120deg, ${SALE}, ${BRAND})` }}>
          <CampaignOutlinedIcon style={{ fontSize: 32 }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-white/80">Live now</p>
            <p className="text-lg font-bold truncate">{activeSale.name} — {discountText(activeSale)}</p>
            <p className="text-sm text-white/90">{activeSale.banner}</p>
          </div>
          <span className="text-sm font-semibold bg-white/20 rounded-full px-3 py-1">{affectedCount(activeSale)} products</span>
        </div>
      )}

      {/* Campaign cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {withStatus.length === 0 ? (
          <p className="text-center text-gray-400 py-12 col-span-full">No sale campaigns yet.</p>
        ) : (
          withStatus.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{c.banner || "—"}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>{c.status}</span>
              </div>

              <p className="mt-3 text-2xl font-black" style={{ color: SALE }}>{discountText(c)}</p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="text-gray-400">Applies to: </span>
                  {c.scope === "category" ? `${SCOPE_LABEL.category} · ${c.category}` : SCOPE_LABEL[c.scope]}
                  <span className="text-gray-400"> ({affectedCount(c)} products)</span>
                </p>
                <p><span className="text-gray-400">Runs: </span>{fmtDate(c.start)} – {c.expiry ? fmtDate(c.expiry) : "No end"}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button onClick={() => toggle(c)} className={`relative h-5 w-9 rounded-full transition-colors ${c.enabled ? "" : "bg-gray-200"}`} style={c.enabled ? { backgroundColor: BRAND } : {}}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${c.enabled ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  <span className="text-xs text-gray-500">{c.enabled ? "Enabled" : "Disabled"}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Edit"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
                  <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== Add / Edit modal ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-gray-900">{modal.id ? "Edit Sale" : "Create Sale"}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Campaign name *" error={errors.name}>
                <input value={modal.name} onChange={(e) => setField("name", e.target.value)} className="inp" placeholder="Summer Mega Sale" />
              </Field>

              <Field label="Banner text">
                <input value={modal.banner} onChange={(e) => setField("banner", e.target.value)} className="inp" placeholder="Up to 30% off everything" />
              </Field>

              {/* Scope */}
              <div>
                <span className="text-xs font-medium text-gray-500">Applies to</span>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {["sitewide", "category", "products"].map((s) => (
                    <button key={s} onClick={() => setField("scope", s)} className="rounded-lg border px-2 py-2 text-xs font-semibold transition-colors"
                      style={modal.scope === s ? { backgroundColor: SALE, borderColor: SALE, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
                      {SCOPE_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              {modal.scope === "category" && (
                <Field label="Category">
                  <select value={modal.category} onChange={(e) => setField("category", e.target.value)} className="inp">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              )}

              {modal.scope === "products" && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Select products</span>
                    <span className="text-xs font-semibold" style={{ color: SALE }}>{modal.productIds.length} selected</span>
                  </div>
                  <div className="mt-1 flex items-center rounded-md border border-gray-200 px-2">
                    <SearchIcon style={{ fontSize: 16, color: "#9ca3af" }} />
                    <input value={pickSearch} onChange={(e) => setPickSearch(e.target.value)} placeholder="Search products" className="flex-1 px-2 py-1.5 text-sm outline-none" />
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                    {pickList.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3 text-center">No products.</p>
                    ) : pickList.slice(0, 60).map((p) => (
                      <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={modal.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="h-4 w-4 rounded" style={{ accentColor: SALE }} />
                        <img src={p.image} alt={p.name} className="h-8 w-7 rounded object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/28x32/f3f4f6/9ca3af?text=R"; }} />
                        <span className="text-sm text-gray-700 truncate flex-1">{p.name}</span>
                        <span className="text-xs text-gray-400">{taka(p.price)}</span>
                      </label>
                    ))}
                  </div>
                  {errors.products && <span className="text-xs text-red-500 mt-1 block">{errors.products}</span>}
                </div>
              )}

              {/* Discount */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Discount type">
                  <select value={modal.discountType} onChange={(e) => setField("discountType", e.target.value)} className="inp">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount (৳)</option>
                  </select>
                </Field>
                <Field label={modal.discountType === "percent" ? "Percentage (%) *" : "Amount (৳) *"} error={errors.value}>
                  <input type="number" value={modal.value} onChange={(e) => setField("value", e.target.value)} className="inp" placeholder={modal.discountType === "percent" ? "30" : "200"} />
                </Field>
                <Field label="Start date">
                  <input type="date" value={modal.start} onChange={(e) => setField("start", e.target.value)} className="inp" />
                </Field>
                <Field label="End date" error={errors.expiry}>
                  <input type="date" value={modal.expiry} onChange={(e) => setField("expiry", e.target.value)} className="inp" />
                </Field>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={modal.enabled} onChange={(e) => setField("enabled", e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: BRAND }} />
                <span className="text-sm text-gray-700">Enabled</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>{modal.id ? "Save Changes" : "Create Sale"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </label>
  );
}

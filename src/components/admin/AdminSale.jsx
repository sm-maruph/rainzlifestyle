// src/components/admin/AdminSale.jsx — wired to sale campaign API (sitewide/category/subcategory/products)
import { useEffect, useMemo, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getProducts, getCategoriesRaw, getSaleCampaigns, createSaleCampaign, updateSaleCampaign, deleteSaleCampaign } from "../../api";

const BRAND = "#E11D48";
const SALE = "#7C3AED";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const today = () => new Date().toISOString().slice(0, 10);

const STATUS_STYLE = { Active: "bg-green-50 text-green-700", Scheduled: "bg-amber-50 text-amber-700", Expired: "bg-gray-100 text-gray-500", Disabled: "bg-red-50 text-red-600" };
const SCOPE_LABEL = { sitewide: "Sitewide", category: "Category", subcategory: "Subcategory", products: "Selected products" };

const computeStatus = (c) => {
  if (!c.enabled) return "Disabled";
  const now = today();
  if (c.start && now < c.start) return "Scheduled";
  if (c.expiry && now > c.expiry) return "Expired";
  return "Active";
};
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const discountText = (c) => (c.discountType === "percent" ? `${c.value}% OFF` : `${taka(c.value)} OFF`);

const EMPTY = { id: null, name: "", scope: "sitewide", categoryId: "", subcategoryId: "", productIds: [], discountType: "percent", value: "", start: today(), expiry: "", enabled: true, banner: "" };


async function fetchAllProducts() {
  const out = [];
  let page = 1;
  const size = 60; // safe page size under any cap
  // pull up to ~600 products (10 pages) — plenty for a picker
  for (let i = 0; i < 10; i++) {
    let res;
    try { res = await getProducts({ pageSize: size, page }); }
    catch { break; }
    const items = res.items || res || [];
    out.push(...items);
    const total = res.total ?? items.length;
    if (out.length >= total || items.length < size) break;
    page += 1;
  }
  return out;
}

export default function AdminSale() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState(null);
  const [errors, setErrors] = useState({});
  const [pickSearch, setPickSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      getSaleCampaigns().catch(() => []),
      fetchAllProducts().catch(() => []),
      getCategoriesRaw().catch(() => []),
    ]).then(([camps, prods, categories]) => {
      setSales(camps); setProducts(prods); setCats(categories);
    }).catch((e) => setApiError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const catById = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c])), [cats]);
  const subcats = useMemo(() => {
    const cat = cats.find((c) => c.id === modal?.categoryId);
    return cat ? (cat.groups || []).flatMap((g) => g.subcategories || []) : [];
  }, [cats, modal?.categoryId]);

  const withStatus = useMemo(() => sales.map((c) => ({ ...c, status: computeStatus(c) })), [sales]);

  const affectedCount = (c) => {
    if (c.scope === "sitewide") return products.length;
    if (c.scope === "category") return products.filter((p) => p.categoryId === c.categoryId || p.category === catById[c.categoryId]?.slug).length;
    if (c.scope === "subcategory") return products.filter((p) => p.subcategory && p.subcategoryId === c.subcategoryId).length;
    return c.productIds.length;
  };

  const openAdd = () => { setModal({ ...EMPTY }); setErrors({}); setPickSearch(""); };
  const openEdit = (c) => { setModal({ ...c, value: c.value || "" }); setErrors({}); setPickSearch(""); };
  const setField = (k, v) => setModal((m) => ({ ...m, [k]: v }));
  const toggleProduct = (id) => setModal((m) => ({ ...m, productIds: m.productIds.includes(id) ? m.productIds.filter((x) => x !== id) : [...m.productIds, id] }));

  const validate = () => {
    const er = {};
    if (!modal.name.trim()) er.name = "Name is required";
    if (modal.value === "" || Number(modal.value) <= 0) er.value = "Enter a value greater than 0";
    if (modal.scope === "category" && !modal.categoryId) er.scope = "Pick a category";
    if (modal.scope === "subcategory" && !modal.subcategoryId) er.scope = "Pick a subcategory";
    if (modal.scope === "products" && modal.productIds.length === 0) er.products = "Select at least one product";
    if (modal.expiry && modal.start && modal.expiry < modal.start) er.expiry = "End date must be after start";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true); setApiError("");
    try {
      if (modal.id) await updateSaleCampaign(modal.id, modal);
      else await createSaleCampaign(modal);
      setModal(null); load();
    } catch (e) { setApiError(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete sale "${c.name}"?`)) return;
    try { await deleteSaleCampaign(c.id); setSales((l) => l.filter((x) => x.id !== c.id)); }
    catch (e) { setApiError(e.message); }
  };
  const toggle = async (c) => {
    setSales((l) => l.map((x) => (x.id === c.id ? { ...x, enabled: !x.enabled } : x)));
    try { await updateSaleCampaign(c.id, { ...c, enabled: !c.enabled }); }
    catch (e) { setApiError(e.message); setSales((l) => l.map((x) => (x.id === c.id ? { ...x, enabled: c.enabled } : x))); }
  };

  const activeSale = withStatus.find((c) => c.status === "Active");
  const pickList = products.filter((p) => p.name.toLowerCase().includes(pickSearch.trim().toLowerCase()));
  const scopeLabel = (c) =>
    c.scope === "category" ? `Category · ${catById[c.categoryId]?.name || "?"}`
    : c.scope === "subcategory" ? `Subcategory`
    : SCOPE_LABEL[c.scope];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Sale Campaigns</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${sales.length} campaigns`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh"><RefreshIcon style={{ fontSize: 18 }} /></button>
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
            <AddOutlinedIcon style={{ fontSize: 18 }} /> Create Sale
          </button>
        </div>
      </div>

      {apiError && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{apiError}</span><button onClick={() => setApiError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

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

      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />)
        ) : withStatus.length === 0 ? (
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
                <p><span className="text-gray-400">Applies to: </span>{scopeLabel(c)}<span className="text-gray-400"> ({affectedCount(c)} products)</span></p>
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-gray-900">{modal.id ? "Edit Sale" : "Create Sale"}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Campaign name *" error={errors.name}><input value={modal.name} onChange={(e) => setField("name", e.target.value)} className="inp" placeholder="Summer Mega Sale" /></Field>
              <Field label="Banner text"><input value={modal.banner} onChange={(e) => setField("banner", e.target.value)} className="inp" placeholder="Up to 30% off everything" /></Field>

              <div>
                <span className="text-xs font-medium text-gray-500">Applies to</span>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {["sitewide", "category", "subcategory", "products"].map((s) => (
                    <button key={s} onClick={() => setField("scope", s)} className="rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors"
                      style={modal.scope === s ? { backgroundColor: SALE, borderColor: SALE, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
                      {SCOPE_LABEL[s]}
                    </button>
                  ))}
                </div>
                {errors.scope && <span className="text-xs text-red-500 mt-1 block">{errors.scope}</span>}
              </div>

              {(modal.scope === "category" || modal.scope === "subcategory") && (
                <Field label="Category">
                  <select value={modal.categoryId} onChange={(e) => setField("categoryId", e.target.value)} className="inp">
                    <option value="">Select category</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              )}
              {modal.scope === "subcategory" && modal.categoryId && (
                <Field label="Subcategory">
                  <select value={modal.subcategoryId} onChange={(e) => setField("subcategoryId", e.target.value)} className="inp">
                    <option value="">Select subcategory</option>
                    {subcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                    {pickList.length === 0 ? <p className="text-xs text-gray-400 p-3 text-center">No products.</p> : pickList.slice(0, 80).map((p) => (
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
                <Field label="Start date"><input type="date" value={modal.start || ""} onChange={(e) => setField("start", e.target.value)} className="inp" /></Field>
                <Field label="End date" error={errors.expiry}><input type="date" value={modal.expiry || ""} onChange={(e) => setField("expiry", e.target.value)} className="inp" /></Field>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={modal.enabled} onChange={(e) => setField("enabled", e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: BRAND }} />
                <span className="text-sm text-gray-700">Enabled</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>{saving ? "Saving…" : modal.id ? "Save Changes" : "Create Sale"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (<label className="block"><span className="text-xs font-medium text-gray-500">{label}</span><div className="mt-1">{children}</div>{error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}</label>);
}

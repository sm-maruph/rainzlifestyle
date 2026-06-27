// src/components/admin/AdminDiscounts.jsx — wired to the real coupon API
import { useEffect, useMemo, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../api";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const today = () => new Date().toISOString().slice(0, 10);

const TYPE_LABEL = { percent: "Percentage", fixed: "Fixed amount", shipping: "Free shipping" };
const TYPE_STYLE = { percent: "bg-violet-50 text-violet-700", fixed: "bg-teal-50 text-teal-700", shipping: "bg-blue-50 text-blue-700" };
const STATUS_STYLE = {
  Active: "bg-green-50 text-green-700",
  Scheduled: "bg-amber-50 text-amber-700",
  Expired: "bg-gray-100 text-gray-500",
  Disabled: "bg-red-50 text-red-600",
};

const computeStatus = (c) => {
  if (!c.enabled) return "Disabled";
  const now = today();
  if (c.start && now < c.start) return "Scheduled";
  if (c.expiry && now > c.expiry) return "Expired";
  return "Active";
};
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const valueText = (c) => (c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? taka(c.value) : "Free shipping");

const EMPTY = { id: null, code: "", type: "percent", value: "", minOrder: "", maxDiscount: "", usageLimit: "", start: today(), expiry: "", enabled: true, description: "" };

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [modal, setModal] = useState(null);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(null);

  const load = () => {
    setLoading(true);
    getCoupons().then(setCoupons).catch((e) => setApiError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const withStatus = useMemo(() => coupons.map((c) => ({ ...c, status: computeStatus(c) })), [coupons]);

  const counts = useMemo(() => {
    const c = { All: withStatus.length };
    ["Active", "Scheduled", "Expired", "Disabled"].forEach((s) => (c[s] = withStatus.filter((x) => x.status === s).length));
    return c;
  }, [withStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withStatus.filter((c) => {
      if (tab !== "All" && c.status !== tab) return false;
      if (q && !c.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [withStatus, tab, search]);

  const openAdd = () => { setModal({ ...EMPTY }); setErrors({}); };
  const openEdit = (c) => { setModal({ ...c, value: c.value || "", minOrder: c.minOrder || "", maxDiscount: c.maxDiscount || "", usageLimit: c.usageLimit || "" }); setErrors({}); };
  const setField = (k, v) => setModal((m) => ({ ...m, [k]: v }));

  const validate = () => {
    const er = {};
    const code = modal.code.trim().toUpperCase();
    if (!code) er.code = "Code is required";
    else if (coupons.some((c) => c.code === code && c.id !== modal.id)) er.code = "Code already exists";
    if (modal.type !== "shipping" && (modal.value === "" || Number(modal.value) <= 0)) er.value = "Enter a value greater than 0";
    if (modal.expiry && modal.start && modal.expiry < modal.start) er.expiry = "Expiry must be after start";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true); setApiError("");
    const body = {
      code: modal.code.trim().toUpperCase(),
      type: modal.type,
      value: modal.type === "shipping" ? 0 : Number(modal.value),
      minOrder: Number(modal.minOrder || 0),
      maxDiscount: modal.type === "percent" ? Number(modal.maxDiscount || 0) : 0,
      usageLimit: Number(modal.usageLimit || 0),
      start: modal.start || null,
      expiry: modal.expiry || null,
      enabled: modal.enabled,
      description: modal.description.trim(),
    };
    try {
      if (modal.id) await updateCoupon(modal.id, body);
      else await createCoupon(body);
      setModal(null);
      load();
    } catch (e) {
      setApiError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    setApiError("");
    try { await deleteCoupon(c.id); setCoupons((list) => list.filter((x) => x.id !== c.id)); }
    catch (e) { setApiError(e.message); }
  };

  const toggle = async (c) => {
    // optimistic
    setCoupons((list) => list.map((x) => (x.id === c.id ? { ...x, enabled: !x.enabled } : x)));
    try {
      await updateCoupon(c.id, { ...c, enabled: !c.enabled });
    } catch (e) {
      setApiError(e.message);
      setCoupons((list) => list.map((x) => (x.id === c.id ? { ...x, enabled: c.enabled } : x))); // revert
    }
  };

  const copy = (code) => { navigator.clipboard?.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 1200); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Discounts</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${coupons.length} coupon codes`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh"><RefreshIcon style={{ fontSize: 18 }} /></button>
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>
            <AddOutlinedIcon style={{ fontSize: 18 }} /> Add Coupon
          </button>
        </div>
      </div>

      {apiError && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{apiError}</span><button onClick={() => setApiError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", "Active", "Scheduled", "Expired", "Disabled"].map((s) => {
            const active = tab === s;
            return (
              <button key={s} onClick={() => setTab(s)} className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={active ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" } : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}>
                {s} <span className={active ? "text-white/80" : "text-gray-400"}>({counts[s] ?? 0})</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center rounded-lg border border-gray-200 px-3 bg-white focus-within:border-gray-400 sm:w-60">
          <SearchIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code" className="flex-1 min-w-0 px-2 py-2.5 text-sm outline-none bg-transparent uppercase" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 font-medium">Code</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Value</th>
                <th className="py-3 px-4 font-medium">Min order</th>
                <th className="py-3 px-4 font-medium">Usage</th>
                <th className="py-3 px-4 font-medium">Validity</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50"><td colSpan={8} className="py-3 px-4"><div className="h-7 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No coupons found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <button onClick={() => copy(c.code)} className="inline-flex items-center gap-1.5 font-mono font-bold text-gray-800 hover:text-gray-900" title="Copy code">
                        {c.code}
                        {copied === c.code ? <CheckIcon style={{ fontSize: 14, color: "#16a34a" }} /> : <ContentCopyOutlinedIcon style={{ fontSize: 14, color: "#9ca3af" }} />}
                      </button>
                      {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[c.type]}`}>{TYPE_LABEL[c.type]}</span></td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{valueText(c)}{c.type === "percent" && c.maxDiscount ? <span className="text-xs font-normal text-gray-400"> (max {taka(c.maxDiscount)})</span> : null}</td>
                    <td className="py-3 px-4 text-gray-600">{c.minOrder ? taka(c.minOrder) : "—"}</td>
                    <td className="py-3 px-4 text-gray-600">{c.used}/{c.usageLimit ? c.usageLimit : "∞"}</td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{fmtDate(c.start)} – {c.expiry ? fmtDate(c.expiry) : "No expiry"}</td>
                    <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>{c.status}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggle(c)} title={c.enabled ? "Disable" : "Enable"}
                          className={`relative h-5 w-9 rounded-full transition-colors ${c.enabled ? "" : "bg-gray-200"}`} style={c.enabled ? { backgroundColor: BRAND } : {}}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${c.enabled ? "left-[18px]" : "left-0.5"}`} />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Edit"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
                        <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete"><DeleteOutlineIcon style={{ fontSize: 18 }} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{modal.id ? "Edit Coupon" : "Add Coupon"}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Coupon code *" error={errors.code}>
                  <input value={modal.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} className="inp font-mono" placeholder="RAINZ10" />
                </Field>
                <Field label="Type">
                  <select value={modal.type} onChange={(e) => setField("type", e.target.value)} className="inp">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount (৳)</option>
                    <option value="shipping">Free shipping</option>
                  </select>
                </Field>

                {modal.type !== "shipping" && (
                  <Field label={modal.type === "percent" ? "Percentage (%) *" : "Amount (৳) *"} error={errors.value}>
                    <input type="number" value={modal.value} onChange={(e) => setField("value", e.target.value)} className="inp" placeholder={modal.type === "percent" ? "10" : "100"} />
                  </Field>
                )}
                {modal.type === "percent" && (
                  <Field label="Max discount cap (৳)">
                    <input type="number" value={modal.maxDiscount} onChange={(e) => setField("maxDiscount", e.target.value)} className="inp" placeholder="optional" />
                  </Field>
                )}

                <Field label="Minimum order (৳)">
                  <input type="number" value={modal.minOrder} onChange={(e) => setField("minOrder", e.target.value)} className="inp" placeholder="0" />
                </Field>
                <Field label="Usage limit">
                  <input type="number" value={modal.usageLimit} onChange={(e) => setField("usageLimit", e.target.value)} className="inp" placeholder="0 = unlimited" />
                </Field>
                <Field label="Start date">
                  <input type="date" value={modal.start || ""} onChange={(e) => setField("start", e.target.value)} className="inp" />
                </Field>
                <Field label="Expiry date" error={errors.expiry}>
                  <input type="date" value={modal.expiry || ""} onChange={(e) => setField("expiry", e.target.value)} className="inp" />
                </Field>
              </div>

              <Field label="Description">
                <input value={modal.description} onChange={(e) => setField("description", e.target.value)} className="inp" placeholder="Short note shown to admins" />
              </Field>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={modal.enabled} onChange={(e) => setField("enabled", e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: BRAND }} />
                <span className="text-sm text-gray-700">Active (customers can use this code)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>{saving ? "Saving…" : modal.id ? "Save Changes" : "Add Coupon"}</button>
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

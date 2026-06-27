// src/components/admin/AdminInventory.jsx — stock levels, order tallies, low-stock + restock
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { getInventory, setInventory, restockProduct } from "../../api";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

const LEVEL_STYLE = {
  ok: "bg-green-50 text-green-700",
  low: "bg-amber-50 text-amber-700",
  out: "bg-red-50 text-red-600",
};
const LEVEL_LABEL = { ok: "In stock", low: "Low stock", out: "Out of stock" };
const STATUS_COLORS = { Pending: "#F59E0B", Processing: "#7C3AED", Shipped: "#2563EB", Delivered: "#16A34A", Cancelled: "#EF4444" };

const TABS = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
  { key: "ok", label: "Healthy" },
];

export default function AdminInventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("stock");
  const [editRow, setEditRow] = useState(null);
  const [restockRow, setRestockRow] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getInventory().then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const summary = useMemo(() => ({
    total: rows.length,
    units: rows.reduce((s, r) => s + r.stock, 0),
    low: rows.filter((r) => r.level === "low").length,
    out: rows.filter((r) => r.level === "out").length,
  }), [rows]);

  const counts = useMemo(() => ({
    all: rows.length,
    low: rows.filter((r) => r.level === "low").length,
    out: rows.filter((r) => r.level === "out").length,
    ok: rows.filter((r) => r.level === "ok").length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (tab !== "all" && r.level !== tab) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const by = {
      stock: (a, b) => a.stock - b.stock,
      sold: (a, b) => b.activeQty - a.activeQty,
      ordered: (a, b) => b.orderedQty - a.orderedQty,
      cancelled: (a, b) => b.cancelledQty - a.cancelledQty,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort] || by.stock);
  }, [rows, tab, search, sort]);

  const saveEdit = async () => {
    setBusy(true); setError("");
    try {
      await setInventory(editRow.id, { stock: Number(editRow.stock), low_stock_threshold: Number(editRow.threshold) });
      setEditRow(null); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const doRestock = async () => {
    setBusy(true); setError("");
    try {
      await restockProduct(restockRow.id, Number(restockRow.amount));
      setRestockRow(null); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${rows.length} products · ${summary.units.toLocaleString("en-BD")} units in stock`}</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh"><RefreshIcon style={{ fontSize: 18 }} /></button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Summary icon={Inventory2OutlinedIcon} label="Products" value={summary.total} accent={BRAND} />
        <Summary icon={Inventory2OutlinedIcon} label="Units in stock" value={summary.units.toLocaleString("en-BD")} accent="#0D9488" />
        <Summary icon={WarningAmberOutlinedIcon} label="Low stock" value={summary.low} accent="#D97706" />
        <Summary icon={WarningAmberOutlinedIcon} label="Out of stock" value={summary.out} accent="#EF4444" />
      </div>

      {/* Low-stock alert banner */}
      {!loading && (summary.low + summary.out) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <WarningAmberOutlinedIcon style={{ color: "#D97706" }} />
          <div className="text-sm text-amber-800">
            <span className="font-semibold">{summary.out} out of stock</span> and <span className="font-semibold">{summary.low} running low</span>. Restock suggestions are shown per product below.
          </div>
        </div>
      )}

      {/* Tabs + search + sort */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors"
              style={tab === t.key ? { backgroundColor: BRAND, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#4b5563" }}>
              {t.label} <span className={tab === t.key ? "text-white/80" : "text-gray-400"}>({counts[t.key] ?? 0})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center rounded-lg border border-gray-200 px-3 bg-white focus-within:border-gray-400">
            <SearchIcon style={{ fontSize: 18, color: "#9ca3af" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product" className="flex-1 min-w-0 px-2 py-2.5 text-sm outline-none bg-transparent" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-gray-400">
            <option value="stock">Lowest stock first</option>
            <option value="sold">Most sold (active)</option>
            <option value="ordered">Most ordered</option>
            <option value="cancelled">Most cancelled</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Ordered</th>
                <th className="py-3 px-4 font-medium">By status</th>
                <th className="py-3 px-4 font-medium">Cancelled</th>
                <th className="py-3 px-4 font-medium">Restock</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50"><td className="py-3 px-4" colSpan={8}><div className="h-9 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No products found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={r.image} alt={r.name} className="h-10 w-9 rounded object-cover bg-gray-100 shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x44/f3f4f6/9ca3af?text=R"; }} />
                      <div className="min-w-0"><p className="font-semibold text-gray-800 truncate">{r.name}</p><p className="text-xs text-gray-400">{taka(r.price)}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-900">{r.stock}</span>
                    <span className="text-xs text-gray-400"> / thr {r.threshold}</span>
                  </td>
                  <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_STYLE[r.level]}`}>{LEVEL_LABEL[r.level]}</span></td>
                  <td className="py-3 px-4 text-gray-700 font-semibold">{r.orderedQty}<span className="text-xs font-normal text-gray-400"> total</span></td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(r.byStatus).length === 0 ? <span className="text-xs text-gray-300">—</span> :
                        Object.entries(r.byStatus).map(([st, q]) => (
                          <span key={st} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[st] || "#9ca3af" }} title={st}>
                            {st[0]}{q}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{r.cancelledQty}</td>
                  <td className="py-3 px-4">
                    {r.suggestedRestock > 0
                      ? <span className="text-xs font-semibold" style={{ color: r.level === "out" ? "#EF4444" : "#D97706" }}>+{r.suggestedRestock} suggested</span>
                      : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setRestockRow({ id: r.id, name: r.name, amount: r.suggestedRestock || 10 })} className="p-1.5 rounded hover:bg-green-50 text-gray-500 hover:text-green-700" title="Restock"><AddBoxOutlinedIcon style={{ fontSize: 18 }} /></button>
                      <button onClick={() => setEditRow({ id: r.id, name: r.name, stock: r.stock, threshold: r.threshold })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Edit stock/threshold"><EditOutlinedIcon style={{ fontSize: 18 }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit stock modal */}
      {editRow && (
        <Modal title={`Edit · ${editRow.name}`} onClose={() => setEditRow(null)}>
          <Field label="Stock quantity"><input type="number" value={editRow.stock} onChange={(e) => setEditRow((m) => ({ ...m, stock: e.target.value }))} className="inp" /></Field>
          <Field label="Low-stock threshold"><input type="number" value={editRow.threshold} onChange={(e) => setEditRow((m) => ({ ...m, threshold: e.target.value }))} className="inp" /></Field>
          <p className="text-xs text-gray-400">Warnings show when stock ≤ threshold.</p>
          <ModalActions busy={busy} onCancel={() => setEditRow(null)} onSave={saveEdit} saveLabel="Save" />
        </Modal>
      )}

      {/* Restock modal */}
      {restockRow && (
        <Modal title={`Restock · ${restockRow.name}`} onClose={() => setRestockRow(null)}>
          <Field label="Add units"><input type="number" value={restockRow.amount} onChange={(e) => setRestockRow((m) => ({ ...m, amount: e.target.value }))} className="inp" /></Field>
          <p className="text-xs text-gray-400">This adds to the current stock.</p>
          <ModalActions busy={busy} onCancel={() => setRestockRow(null)} onSave={doRestock} saveLabel="Add to stock" />
        </Modal>
      )}

      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Summary({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
      <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}14`, color: accent }}><Icon style={{ fontSize: 22 }} /></span>
      <div className="min-w-0"><p className="text-lg font-extrabold text-gray-900 truncate">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md my-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button></div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}
function ModalActions({ busy, onCancel, onSave, saveLabel }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
      <button onClick={onSave} disabled={busy} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>{busy ? "Saving…" : saveLabel}</button>
    </div>
  );
}
function Field({ label, children }) {
  return (<label className="block"><span className="text-xs font-medium text-gray-500">{label}</span><div className="mt-1">{children}</div></label>);
}

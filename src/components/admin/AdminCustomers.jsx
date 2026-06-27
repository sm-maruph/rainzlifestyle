// src/components/admin/AdminCustomers.jsx — full customer analytics (real API)
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import FiberNewOutlinedIcon from "@mui/icons-material/FiberNewOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getCustomers } from "../../api";

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const ORDER_STATUS_STYLE = {
  Delivered: "bg-green-50 text-green-700", Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-violet-50 text-violet-700", Pending: "bg-amber-50 text-amber-700", Cancelled: "bg-red-50 text-red-600",
};
const CUST_STATUS_STYLE = { VIP: "bg-amber-50 text-amber-700", Active: "bg-green-50 text-green-700", New: "bg-blue-50 text-blue-700" };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

const TABS = [
  { key: "all", label: "All" },
  { key: "vip", label: "VIP" },
  { key: "new", label: "New" },
  { key: "active", label: "Active" },
  { key: "noorders", label: "No orders" },
];
const SORTS = [
  { value: "spend", label: "Top spenders" },
  { value: "top", label: "Biggest single order" },
  { value: "orders", label: "Most orders" },
  { value: "recent", label: "Most recent order" },
  { value: "first", label: "First-time (newest)" },
  { value: "joined", label: "Recently joined" },
  { value: "name", label: "Name (A–Z)" },
];

export default function AdminCustomers() {
  const [registered, setRegistered] = useState([]);
  const [guests, setGuests] = useState([]);
  const [source, setSource] = useState("registered"); // "registered" | "guests"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("spend");
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    getCustomers().then(({ registered, guests }) => { setRegistered(registered); setGuests(guests); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const customers = source === "guests" ? guests : registered;

  const summary = useMemo(() => ({
    total: customers.length,
    vip: customers.filter((c) => c.status === "VIP").length,
    neu: customers.filter((c) => c.status === "New").length,
    revenue: customers.reduce((s, c) => s + c.totalSpent, 0),
  }), [customers]);

  const counts = useMemo(() => ({
    all: customers.length,
    vip: customers.filter((c) => c.status === "VIP").length,
    new: customers.filter((c) => c.status === "New").length,
    active: customers.filter((c) => c.status === "Active").length,
    noorders: customers.filter((c) => c.ordersCount === 0).length,
  }), [customers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = customers.filter((c) => {
      if (q && !`${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)) return false;
      if (tab === "vip") return c.status === "VIP";
      if (tab === "new") return c.status === "New";
      if (tab === "active") return c.status === "Active";
      if (tab === "noorders") return c.ordersCount === 0;
      return true;
    });
    const by = {
      spend: (a, b) => b.totalSpent - a.totalSpent,
      top: (a, b) => (b.topOrder || 0) - (a.topOrder || 0),
      orders: (a, b) => b.ordersCount - a.ordersCount,
      recent: (a, b) => (b.lastOrderDate?.getTime() || 0) - (a.lastOrderDate?.getTime() || 0),
      first: (a, b) => (b.firstOrderDate?.getTime() || 0) - (a.firstOrderDate?.getTime() || 0),
      joined: (a, b) => (b.joinedDate?.getTime() || 0) - (a.joinedDate?.getTime() || 0),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort] || by.spend);
  }, [customers, search, tab, sort]);

  const open = customers.find((c) => c.id === openId) || null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${customers.length} unique customers`}</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh"><RefreshIcon style={{ fontSize: 18 }} /></button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2 flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><CloseIcon style={{ fontSize: 16 }} /></button></div>}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Summary icon={PeopleAltOutlinedIcon} label="Total customers" value={summary.total} />
        <Summary icon={WorkspacePremiumOutlinedIcon} label="VIP customers" value={summary.vip} />
        <Summary icon={FiberNewOutlinedIcon} label="New customers" value={summary.neu} />
        <Summary icon={PaymentsOutlinedIcon} label="Total revenue" value={taka(summary.revenue)} />
      </div>

      {/* Source toggle: Registered vs Guests */}
      <div className="flex gap-2">
        <button onClick={() => { setSource("registered"); setTab("all"); }} className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          style={source === "registered" ? { backgroundColor: BRAND, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#4b5563" }}>
          Registered ({registered.length})
        </button>
        <button onClick={() => { setSource("guests"); setTab("all"); }} className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          style={source === "guests" ? { backgroundColor: BRAND, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#4b5563" }}>
          Guests ({guests.length})
        </button>
      </div>

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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" className="flex-1 min-w-0 px-2 py-2.5 text-sm outline-none bg-transparent" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-gray-400">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Orders</th>
                <th className="py-3 px-4 font-medium">Total spent</th>
                <th className="py-3 px-4 font-medium">Top order</th>
                <th className="py-3 px-4 font-medium">Last order</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50"><td className="py-3 px-4" colSpan={8}><div className="h-9 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No customers found.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: BRAND }}>{(c.name || "?")[0].toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email || (c.guest ? "Guest checkout" : "—")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{c.phone || "—"}</td>
                  <td className="py-3 px-4 text-gray-600">{c.ordersCount}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{taka(c.totalSpent)}</td>
                  <td className="py-3 px-4 text-gray-600">{c.topOrder ? taka(c.topOrder) : "—"}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{fmtDate(c.lastOrderDate)}</td>
                  <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CUST_STATUS_STYLE[c.status] || "bg-gray-100 text-gray-600"}`}>{c.status}</span></td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setOpenId(c.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="View"><VisibilityOutlinedIcon style={{ fontSize: 19 }} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: BRAND }}>{(open.name || "?")[0].toUpperCase()}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{open.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CUST_STATUS_STYLE[open.status] || "bg-gray-100 text-gray-600"}`}>{open.status} customer</span>
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <p className="flex items-center gap-2 text-gray-600"><MailOutlineIcon style={{ fontSize: 17, color: "#9ca3af" }} /> {open.email || "—"}</p>
                <p className="flex items-center gap-2 text-gray-600"><CallOutlinedIcon style={{ fontSize: 17, color: "#9ca3af" }} /> {open.phone || "—"}</p>
                <p className="flex items-start gap-2 text-gray-600 sm:col-span-2"><LocationOnOutlinedIcon style={{ fontSize: 17, color: "#9ca3af" }} /> {open.address || "—"}{open.city ? `, ${open.city}` : ""}</p>
                <p className="text-gray-400 text-xs sm:col-span-2">Joined {fmtDate(open.joinedDate)} · First order {fmtDate(open.firstOrderDate)} · Last order {fmtDate(open.lastOrderDate)}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Tile label="Orders" value={open.ordersCount} />
                <Tile label="Total spent" value={taka(open.totalSpent)} />
                <Tile label="Avg order" value={taka(open.avg)} />
                <Tile label="Top order" value={taka(open.topOrder)} />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order history ({open.orders.length})</p>
                {open.orders.length === 0 ? (
                  <p className="text-sm text-gray-400">No orders yet.</p>
                ) : (
                  <div className="rounded-lg border border-gray-100 divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {open.orders.map((o) => (
                      <div key={o.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="font-semibold text-gray-800">#{o.id}</span>
                        <span className="text-gray-400">{fmtDate(o.dateObj)}</span>
                        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLE[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                        <span className="font-semibold text-gray-800 w-20 text-right">{taka(o.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end px-5 py-4 border-t border-gray-100">
              <button onClick={() => setOpenId(null)} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
      <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${BRAND}14`, color: BRAND }}><Icon style={{ fontSize: 22 }} /></span>
      <div className="min-w-0"><p className="text-lg font-extrabold text-gray-900 truncate">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
    </div>
  );
}

function Tile({ label, value }) {
  return (<div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-base font-bold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>);
}

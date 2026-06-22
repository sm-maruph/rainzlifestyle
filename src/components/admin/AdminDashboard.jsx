// src/components/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import { getProducts } from "../../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;

const WEEK = [
  { d: "Mon", v: 38 }, { d: "Tue", v: 52 }, { d: "Wed", v: 47 },
  { d: "Thu", v: 63 }, { d: "Fri", v: 81 }, { d: "Sat", v: 95 }, { d: "Sun", v: 72 },
];

const RECENT = [
  { id: "RZ482193", customer: "Ayesha Rahman", date: "23 Jun 2026", status: "Delivered", total: 2480 },
  { id: "RZ482190", customer: "Tanvir Hasan", date: "23 Jun 2026", status: "Shipped", total: 1750 },
  { id: "RZ482188", customer: "Nusrat Jahan", date: "22 Jun 2026", status: "Processing", total: 3990 },
  { id: "RZ482185", customer: "Rakib Khan", date: "22 Jun 2026", status: "Pending", total: 1290 },
  { id: "RZ482181", customer: "Sadia Islam", date: "21 Jun 2026", status: "Cancelled", total: 860 },
];

const STATUS_STYLE = {
  Delivered: "bg-green-50 text-green-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-violet-50 text-violet-700",
  Pending: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-600",
};

function StatCard({ icon: Icon, label, value, delta, up }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND}14`, color: BRAND }}>
          <Icon style={{ fontSize: 22 }} />
        </span>
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
          {up ? <TrendingUpIcon style={{ fontSize: 15 }} /> : <TrendingDownIcon style={{ fontSize: 15 }} />}
          {delta}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

const QUICK = [
  { to: "/admin/products", label: "Add Product", icon: AddOutlinedIcon },
  { to: "/admin/discounts", label: "Create Discount", icon: LocalOfferOutlinedIcon },
  { to: "/admin/sale", label: "Setup Sale", icon: SellOutlinedIcon },
  { to: "/admin/orders", label: "Manage Orders", icon: ReceiptLongOutlinedIcon },
];

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts({ pageSize: 5 })
      .then((res) => {
        if (!alive) return;
        setProductCount(res.total ?? (res.items || []).length);
        setTopProducts((res.items || []).slice(0, 5));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const max = Math.max(...WEEK.map((w) => w.v));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome back — here's what's happening with your store.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={PaymentsOutlinedIcon} label="Total Sales" value={taka(482300)} delta="+12.5%" up />
        <StatCard icon={ReceiptLongOutlinedIcon} label="Orders" value="1,284" delta="+8.2%" up />
        <StatCard icon={Inventory2OutlinedIcon} label="Products" value={productCount ?? "…"} delta="+3.1%" up />
        <StatCard icon={PeopleAltOutlinedIcon} label="Customers" value="3,540" delta="-1.4%" up={false} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales chart (CSS bars, no library) */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Sales this week</h3>
            <span className="text-xs text-gray-400">in thousands ৳</span>
          </div>
          <div className="flex items-end justify-between gap-2 sm:gap-3 h-44">
            {WEEK.map((w) => (
              <div key={w.d} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-36">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{ height: `${(w.v / max) * 100}%`, backgroundColor: BRAND, opacity: 0.85 }}
                    title={`${w.v}k`}
                  />
                </div>
                <span className="text-[11px] text-gray-500">{w.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-gray-900 mb-3">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-100 p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <span className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND}14`, color: BRAND }}>
                  <Icon style={{ fontSize: 20 }} />
                </span>
                <span className="text-xs font-semibold text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Recent orders</h3>
            <Link to="/admin/orders" className="text-sm font-semibold" style={{ color: BRAND }}>View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 font-medium">Order</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium hidden sm:table-cell">Date</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-semibold text-gray-800">#{o.id}</td>
                    <td className="py-2.5 text-gray-600">{o.customer}</td>
                    <td className="py-2.5 text-gray-500 hidden sm:table-cell">{o.date}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-800">{taka(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-gray-900 mb-3">Top products</h3>
          <div className="space-y-3">
            {topProducts.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)
              : topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <img src={p.image} alt={p.name} className="h-10 w-9 rounded object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x44/f3f4f6/9ca3af?text=R"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.categoryName || p.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{taka(p.price)}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

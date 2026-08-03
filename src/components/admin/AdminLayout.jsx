// src/components/admin/AdminLayout.jsx
import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useSettings } from "../../context/SettingsContext";


const BRAND = "#E11D48";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: DashboardOutlinedIcon, end: true },
  { to: "/admin/products", label: "Products", icon: Inventory2OutlinedIcon },
  { to: "/admin/size-charts", label: "Size Charts", icon: StraightenOutlinedIcon },
  { to: "/admin/inventory", label: "Inventory", icon: WarehouseOutlinedIcon },
  { to: "/admin/categories", label: "Categories", icon: CategoryOutlinedIcon },
  { to: "/admin/orders", label: "Orders", icon: ReceiptLongOutlinedIcon },
  { to: "/admin/hero", label: "Hero Banners", icon: ViewCarouselOutlinedIcon },
  { to: "/admin/collections", label: "Collections", icon: CollectionsOutlinedIcon },
  { to: "/admin/discounts", label: "Discounts", icon: LocalOfferOutlinedIcon },
  { to: "/admin/sale", label: "Sale", icon: SellOutlinedIcon },
  { to: "/admin/customers", label: "Customers", icon: PeopleAltOutlinedIcon },
  { to: "/admin/settings", label: "Settings", icon: SettingsOutlinedIcon },
];

const NAV_GROUPS = [
  { label: "Overview", items: NAV.slice(0, 1) },
  { label: "Store Management", items: NAV.slice(1, 10) },
  { label: "Account", items: NAV.slice(10) },
];

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="admin-sidebar-scroll flex-1 overflow-y-auto px-2.5 py-3">
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={group.label} className={groupIndex ? "mt-3" : ""}>
          <p className="mb-1 px-2.5 text-[9px] font-bold uppercase tracking-[.14em] text-gray-400">{group.label}</p>
          <div className="space-y-1">
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) => `group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold no-underline transition-all duration-200 ${isActive ? "bg-rose-600 text-white shadow-[0_5px_14px_rgba(225,29,72,.22)] hover:text-white" : "text-gray-600 hover:translate-x-0.5 hover:bg-gray-100 hover:text-gray-900"}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all ${isActive ? "bg-white/15 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-gray-700 group-hover:shadow-sm"}`}>
                      <Icon style={{ fontSize: 16 }} />
                    </span>
                    <span className="flex-1">{label}</span>
                    <ChevronRightRoundedIcon className={`transition-all ${isActive ? "translate-x-0 opacity-80" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"}`} style={{ fontSize: 17 }} />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  const { settings } = useSettings();
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-3">
      <Link to="/admin" className="flex min-w-0 items-center gap-3 text-gray-900 no-underline hover:text-gray-900">
        {settings.logo ? (
          <img src={settings.logo} alt={settings.storeName} className="h-9 w-9 shrink-0 rounded-lg border border-gray-100 object-cover shadow-sm" />
        ) : (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-black shadow-sm" style={{ backgroundColor: BRAND }}>
            {(settings.storeName || "R")[0]}
          </span>
        )}
        <span className="min-w-0">
        <span className="block truncate text-base font-extrabold tracking-tight text-gray-900">
          {(() => {
            const name = settings.storeName || "RAINZLIFESTYLE";
            const i = name.toUpperCase().indexOf("LIFESTYLE");
            return i > 0
              ? <>{name.slice(0, i)}<span className="font-light text-gray-500">{name.slice(i)}</span></>
              : name;
          })()}
        </span>
        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.18em] text-gray-400">Commerce Admin</span>
        </span>
      </Link>
    </div>
  );
}

function SidebarFooter({ onLogout }) {
  return (
    <div className="shrink-0 border-t border-gray-100 p-3">
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 p-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-xs font-black text-white">A</span>
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-gray-800">Administrator</p><p className="truncate text-[10px] text-gray-400">Store manager</p></div>
        <span className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100" />
      </div>
      <button onClick={onLogout} className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm font-semibold text-gray-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600">
        <LogoutOutlinedIcon className="text-gray-400 group-hover:text-red-500" style={{ fontSize: 19 }} /> Logout
      </button>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    // TODO: clear admin auth/token here
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Desktop sidebar (fixed) ===== */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-200 flex-col z-30 shadow-[5px_0_24px_rgba(15,23,42,.03)]">
        <Brand />
        <SidebarLinks />
        <SidebarFooter onLogout={logout} />
      </aside>

      {/* ===== Mobile drawer ===== */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col lg:hidden shadow-2xl animate-[slideIn_.22s_ease-out]">
            <div className="flex items-center justify-between border-b border-gray-100 pr-3">
              <Brand />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"><CloseIcon /></button>
            </div>
            <SidebarLinks onNavigate={() => setOpen(false)} />
            <SidebarFooter onLogout={logout} />
          </aside>
        </>
      )}

      {/* ===== Main column ===== */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 h-16 flex items-center gap-3 px-4 sm:px-6">
          <button className="lg:hidden text-gray-700 p-1" onClick={() => setOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-gray-900">Admin Panel</h1>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 no-underline shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <OpenInNewOutlinedIcon style={{ fontSize: 17 }} /> View store
            </a>
            <button className="relative text-gray-600 hover:text-gray-900 p-1" aria-label="Notifications">
              <NotificationsNoneOutlinedIcon />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full" style={{ backgroundColor: BRAND }} />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">A</span>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Routed page content */}
        <main className="flex-1 p-3 sm:p-4 xl:p-5">
          <Outlet />
        </main>
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}.admin-sidebar-scroll{scrollbar-width:thin;scrollbar-color:#e5e7eb transparent}`}</style>
    </div>
  );
}

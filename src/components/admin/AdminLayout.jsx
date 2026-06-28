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
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useSettings } from "../../context/SettingsContext";


const BRAND = "#E11D48";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: DashboardOutlinedIcon, end: true },
  { to: "/admin/products", label: "Products", icon: Inventory2OutlinedIcon },
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

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={({ isActive }) =>
            isActive
              ? { backgroundColor: BRAND, color: "#fff" }
              : { color: "#374151" }
          }
        >
          {({ isActive }) => (
            <>
              <Icon style={{ fontSize: 20, color: isActive ? "#fff" : "#9ca3af" }} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  const { settings } = useSettings();
  return (
    <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-100 shrink-0">
      <Link to="/admin" className="no-underline shrink-0 flex items-center gap-2">
        {settings.logo ? (
          <img src={settings.logo} alt={settings.storeName} className="h-9 w-9 rounded-md object-cover" />
        ) : (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white font-black" style={{ backgroundColor: BRAND }}>
            {(settings.storeName || "R")[0]}
          </span>
        )}
        <span className="text-xl font-extrabold tracking-tight text-gray-900">
          {(() => {
            const name = settings.storeName || "RAINZLIFESTYLE";
            const i = name.toUpperCase().indexOf("LIFESTYLE");
            return i > 0
              ? <>{name.slice(0, i)}<span className="font-light text-gray-500">{name.slice(i)}</span></>
              : name;
          })()}
        </span>
      </Link>
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
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex-col z-30">
        <Brand />
        <SidebarLinks />
        <button onClick={logout} className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <LogoutOutlinedIcon style={{ fontSize: 20, color: "#9ca3af" }} /> Logout
        </button>
      </aside>

      {/* ===== Mobile drawer ===== */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col lg:hidden shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button onClick={() => setOpen(false)} className="text-gray-500 p-2"><CloseIcon /></button>
            </div>
            <SidebarLinks onNavigate={() => setOpen(false)} />
            <button onClick={logout} className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <LogoutOutlinedIcon style={{ fontSize: 20, color: "#9ca3af" }} /> Logout
            </button>
          </aside>
        </>
      )}

      {/* ===== Main column ===== */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
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
              className="hidden sm:inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
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
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

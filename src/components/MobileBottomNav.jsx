// src/components/MobileBottomNav.jsx — compact fixed bottom nav for mobile (Stores, Wishlist, Track, Bag)
import { useNavigate, useLocation } from "react-router-dom";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const BRAND = "var(--brand)";

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems = [] } = useCart() || {};
  const { items: wishItems = [] } = useWishlist() || {};

  // Hide on checkout (and anywhere else you don't want it)
  const HIDE_ON = ["/checkout"];
  if (HIDE_ON.some((p) => location.pathname.startsWith(p))) return null;

  const items = [
    { label: "Stores", icon: LocationOnOutlinedIcon, to: "/stores" },
    { label: "Wishlist", icon: FavoriteBorderOutlinedIcon, to: "/wishlist", badge: wishItems.length },
    { label: "Track", icon: LocalShippingOutlinedIcon, to: "/track-order" },
    { label: "Bag", icon: ShoppingBagOutlinedIcon, to: "/cart", badge: cartItems.length },
  ];

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Bottom navigation"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ label, icon: Icon, to, badge }) => {
          const active = isActive(to);
          return (
            <li key={label} className="flex-1">
              <button
                onClick={() => navigate(to)}
                className="w-full flex flex-col items-center gap-0.5 py-1 transition-colors"
                style={{ color: active ? BRAND : "#374151" }}
                aria-label={label}
              >
                <span className="relative">
                  <Icon style={{ fontSize: 19 }} />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: BRAND }}
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// src/components/SecondaryNav.jsx — horizontal promo strip placed UNDER the hero section
import { Link } from "react-router-dom";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

// Edit this list to control the strip. Each item: label, link, icon, optional accent.
const LINKS = [
  { label: "Sale", to: "/sale", icon: SellOutlinedIcon, accent: "var(--accent-sale, #7C3AED)" },
  { label: "Offers", to: "/offers", icon: LocalFireDepartmentIcon, accent: "var(--brand)" },
  { label: "Best Seller", to: "/best-sellers", icon: StarBorderIcon, accent: "var(--accent-kids, #F59E0B)" },
//   { label: "New Arrivals", to: "/new-arrivals", icon: NewReleasesOutlinedIcon, accent: "var(--accent-women, #DB2777)" },
  { label: "Track Order", to: "/track-order", icon: LocalShippingOutlinedIcon, accent: "var(--accent-accessories, #0D9488)" },
];

export default function SecondaryNav() {
  return (
    <div className="w-full border-y border-gray-100" style={{ backgroundColor: "var(--tertiary)" }}>
      <div className="w-[94%] max-w-[1500px] mx-auto pt-2">
        {/* horizontal, scrollable on small screens */}
        <ul className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {LINKS.map(({ label, to, icon: Icon, accent }) => (
            <li key={label} className="shrink-0">
              <Link
                to={to}
                className="group flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-bold uppercase tracking-wide transition-colors whitespace-nowrap"
                style={{ color: "var(--title)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--title)"; }}
              >
                <Icon style={{ fontSize: 17, color: accent }} className="group-hover:!text-white transition-colors" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

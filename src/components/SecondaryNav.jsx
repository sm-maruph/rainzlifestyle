// src/components/SecondaryNav.jsx — slim horizontal promo strip placed UNDER the hero section
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
  // { label: "New Arrivals", to: "/new-arrivals", icon: NewReleasesOutlinedIcon, accent: "var(--accent-women, #DB2777)" },
  // { label: "Track Order", to: "/track-order", icon: LocalShippingOutlinedIcon, accent: "var(--accent-accessories, #0D9488)" },
];

export default function SecondaryNav() {
  return (
    <div className="w-full border-b border-gray-100">
      <div className="w-[94%] max-w-[1500px] mx-auto" style={{ backgroundColor: "var(--primary)" }}>
        {/* horizontal, scrollable on small screens; slim on mobile */}
        <ul className="flex items-center justify-center gap-4 md:gap-6 sm:gap-8 xl:gap-10 overflow-x-auto no-scrollbar py-1.5 sm:py-2 ">
          {LINKS.map(({ label, to, icon: Icon, accent }) => (
            <li key={label} className="shrink-0">
              <Link
                to={to}
                className="group flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wide transition-colors whitespace-nowrap text-decoration-none border border-black hover:border-current"
                style={{ color: "var(--title)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--title)"; }}
              >
                <Icon style={{ fontSize: 15 }} className="sm:!text-[17px] group-hover:!text-white transition-colors" sx={{ color: accent }} />
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
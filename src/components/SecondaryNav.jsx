// src/components/SecondaryNav.jsx — slim promo strip under hero; evenly spread on mobile
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
    <div className="w-full border-b border-gray-100" style={{ backgroundColor: "var(--primary)" }}>
      <div className="w-[94%] max-w-[1500px] mx-auto">
        <ul className="list-none p-0 m-0 flex items-center justify-center gap-4 sm:gap-8 md:gap-8 xl:gap-10 py-1 sm:py-2">
          {LINKS.map(({ label, to, icon: Icon, accent }) => (
            <li key={label} className="shrink-0">
              <Link
                to={to}
                className="group flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-[13px] font-bold uppercase tracking-tight sm:tracking-wide transition-colors whitespace-nowrap no-underline"
                style={{
                  color: "var(--title)",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--title)"; e.currentTarget.style.borderColor = "var(--title)"; }}
              >
                <Icon className="shrink-0 group-hover:!text-white transition-colors" style={{ fontSize: 13, color: accent }} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
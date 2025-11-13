import { useState, useEffect, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/global/logo.png";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Home" },
  { name: "About Us" },
  {
    name: "Equipment",
    sub: [
      "Biobase",
      "Caimi",
      "Chiuvention",
      "Darong",
      "Devotrans",
      "Erichsen",
      "HiLab",
      "Labnics",
      "MRC Lab",
      "Roaches",
      "Victor",
    ],
  },
  {
    name: "Test Materials",
    sub: ["Consumable", "Chemical", "Reference Material"],
  },
  {
    name: "Mold Prevention",
    sub: ["Anti Mold/ Fungus Product", "Consultancy", "Training"],
  },
  {
    name: "Proficiency Test",
    sub: ["Textile", "Leather", "Food", "Microbiology"],
  },
  {
    name: "Consultancy",
    sub: [
      "Lab Setup",
      "Lab Layout",
      "ISO 17025 Development",
      "Technical Training",
    ],
  },
  {
    name: "Calibration",
    sub: ["Calibration"],
  },
  {
    name: "Others",
    sub: [
      "Supportive Equipment",
      "Safety Products/PPE",
      "Test Standard/Method",
    ],
  },
  { name: "Contact Us" },
];

const Navbar = forwardRef(({ onCategorySelect }, ref) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const normalizePath = (path) => {
    if (path === "/") return "home";
    return path.slice(1).replace(/-/g, " ").toLowerCase();
  };

  const currentPath = normalizePath(location.pathname);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
    setOpenDropdown(null);
  };

  const handleNavLinkClick = (linkName) => {
    setMenuOpen(false);
    setOpenDropdown(null);

    if (linkName.includes("/")) {
      const [category, subcategory] = linkName.split("/");
      if (onCategorySelect) {
        onCategorySelect({ category, subcategory });
        return;
      }
    }

    const path = linkName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\//g, "/");
    navigate(path === "home" ? "/" : `/${path}`);
  };

  const handleSubMenuToggle = (itemName) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth >= 1280) {
        setShowHeader(currentScrollY < lastScrollY || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      ref={ref}
      className="w-full bg-white fixed top-0 left-0 z-50 shadow-md"
    >
      <div
        className={`w-[90%] mx-auto flex items-center justify-between transition-all duration-500 ease-in-out ${
          showHeader
            ? "xl:h-auto xl:opacity-100 xl:scale-100"
            : "xl:h-0 xl:opacity-0 xl:scale-y-0"
        } overflow-hidden`}
      >
        <Link to="/" className="no-underline text-inherit">
          <div className="flex items-center cursor-pointer">
            <img
              src={logo}
              alt="Logo"
              className="h-12 md:h-16 xl:h-24 w-auto mr-2 md:mr-4 rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/64x64/000000/FFFFFF?text=Logo";
              }}
            />
            <span className="text-lg md:text-xl xl:text-2xl font-semibold text-mm-primary">
              Materials & More Enterprise (M&M)
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3">
            <a href="#" className="text-mm-secondery hover:text-blue-600">
              <FacebookIcon fontSize="medium" />
            </a>
            <a href="#" className="text-mm-secondery hover:text-pink-600">
              <InstagramIcon fontSize="medium" />
            </a>
            <a href="#" className="text-mm-secondery hover:text-blue-700">
              <LinkedInIcon fontSize="medium" />
            </a>
            <a href="#" className="text-mm-secondery hover:text-red-600">
              <YouTubeIcon fontSize="medium" />
            </a>
          </div>
          <button
            className="xl:hidden bg-mm-secondery text-white p-2 rounded-md"
            onClick={handleMenuToggle}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Desktop Navbar */}
      <div className="w-full bg-mm-secondery hidden xl:flex">
        <div className="w-[90%] mx-auto flex items-center">
          {/* Nav items go here */}
          {navLinks.map((item) => (
            <div key={item.name} className="relative group flex-1">
              <button
                className={`w-full text-center py-3 text-white text-xs font-bold hover:bg-mm-primary transition duration-150 ${
                  currentPath === item.name.toLowerCase() ? "bg-mm-primary" : ""
                }`}
                onClick={() => handleNavLinkClick(item.name)}
              >
                {item.name}
              </button>
              {item.sub && (
                <div
                  className={`absolute top-full bg-[#000000] bg-opacity-70 text-white shadow-xl z-50 hidden group-hover:grid grid-cols-3 gap-2 px-4 py-6 w-[600px] ${
                    ["Others", "Calibration", "Consultancy"].includes(item.name)
                      ? "right-0"
                      : "left-0"
                  }`}
                >
                  {item.sub.map((subItem, idx) => (
                    <button
                      key={idx}
                      className="text-center px-3 py-2 hover:bg-mm-primary text-sm"
                      onClick={() =>
                        handleNavLinkClick(
                          `${item.name.replace(/\//g, "-")}/${subItem.replace(
                            /\//g,
                            "-"
                          )}`
                        )
                      }
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-start px-4 pt-16 xl:hidden z-[100] overflow-y-auto max-h-screen">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={handleMenuToggle}
          >
            <CloseIcon />
          </button>
          {navLinks.map((item) => (
            <div key={item.name} className="w-full">
              <button
                className={`text-white text-lg py-4 pl-2 w-full text-align-center border-b border-gray-700 flex justify-between items-center ${
                  currentPath === item.name.toLowerCase() ? "bg-mm-primary" : ""
                }`}
                onClick={() =>
                  item.sub
                    ? handleSubMenuToggle(item.name)
                    : handleNavLinkClick(item.name)
                }
              >
                {item.name}
                {item.sub && (
                  <span className="ml-4">
                    {openDropdown === item.name ? "-" : "+"}
                  </span>
                )}
              </button>
              {item.sub && openDropdown === item.name && (
                <div className="pl-4">
                  {item.sub.map((subItem, idx) => (
                    <button
                      key={idx}
                      className="text-white text-sm py-2 block w-full text-left hover:text-mm-primary"
                      onClick={() =>
                        handleNavLinkClick(
                          `${item.name.replace(/\//g, "-")}/${subItem.replace(
                            /\//g,
                            "-"
                          )}`
                        )
                      }
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
});

export default Navbar;

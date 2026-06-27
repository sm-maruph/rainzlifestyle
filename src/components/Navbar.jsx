import { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { getCategories } from "../api";
import { useSettings } from "../context/SettingsContext";


const BRAND = "var(--brand)";const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Fallback shown only until the API responds (prevents an empty flash)
const fallbackCategories = [
  { name: "Men", slug: "men", accent: "#E11D48", groups: [] },
  { name: "Women", slug: "women", accent: "#DB2777", groups: [] },
  { name: "Kids", slug: "kids", accent: "#F59E0B", groups: [] },
  { name: "Accessories", slug: "accessories", accent: "#0D9488", groups: [] },
  { name: "Sale", slug: "sale", accent: "#7C3AED", groups: [] },
];

const Navbar = forwardRef(
  (
    {
      categories: categoriesProp = null, // parent can still supply; otherwise we fetch
      user = null,
      cartCount = 0,
      wishlistCount = 0,
      onLogout = () => { },
    },
    ref
  ) => {
    const { settings } = useSettings();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [search, setSearch] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);
    const [fetchedCats, setFetchedCats] = useState(null);
    const closeTimer = useRef(null);

    // Load real categories (with groups + subcategories) from the API
    useEffect(() => {
      if (categoriesProp) return; // parent supplied them
      let alive = true;
      getCategories()
        .then((tree) => {
          if (!alive || !tree || !tree.length) return;
          // append the Sale link (not a DB category)
          setFetchedCats([...tree, { name: "Sale", slug: "sale", accent: "#7C3AED", groups: [] }]);
        })
        .catch(() => { });
      return () => { alive = false; };
    }, [categoriesProp]);

    const categories = categoriesProp || fetchedCats || fallbackCategories;

    const openMenu = (name) => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setActiveMenu(name);
    };
    const scheduleClose = () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
    };

    const navigate = useNavigate();
    const location = useLocation();
    const currentSlug = location.pathname.split("/")[1] || "home";

    const go = (path) => {
      setMenuOpen(false);
      setOpenDropdown(null);
      navigate(path);
    };

    const catSlug = (cat) => cat.slug || slugify(cat.name);
    const goCategory = (cat) => go(`/${catSlug(cat)}`);
    const goSub = (cat, item) => go(`/${catSlug(cat)}/${slugify(item)}`);

    const handleSearch = (e) => {
      e.preventDefault();
      const q = search.trim();
      if (!q) return;
      go(`/search?q=${encodeURIComponent(q)}`);
    };

    useEffect(() => {
      const onScroll = () => {
        const y = window.scrollY;
        if (window.innerWidth >= 1280) {
          setShowHeader(y < lastScrollY || y < 100);
          setLastScrollY(y);
        }
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, [lastScrollY]);

    useEffect(() => {
      document.body.style.overflow = menuOpen ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    useEffect(() => () => closeTimer.current && clearTimeout(closeTimer.current), []);

    const Badge = ({ count }) =>
      count > 0 ? (
        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: BRAND }}>
          {count > 99 ? "99+" : count}
        </span>
      ) : null;

    return (
      <>
        <nav ref={ref} className="w-full fixed top-0 left-0 z-50 shadow-sm border-b border-gray-100 transition-transform duration-500 ease-in-out" style={{ backgroundColor: "var(--secondary)" }}>  {/*transform: showHeader ? "translateY(0)" : "translateY(-100%)",*/} 
          <div className="w-[94%] max-w-[1500px] mx-auto relative flex items-center gap-2 lg:gap-3 py-3">

            <Link to="/" className="no-underline shrink-0 flex items-center gap-2">
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
            {/* <Link to="/" className="no-underline shrink-0 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white font-black" style={{ backgroundColor: BRAND }}>R</span>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">RAINZ<span className="font-light text-gray-500">LIFESTYLE</span></span>
            </Link> */}

            {/* Desktop categories with mega-menus */}
            <ul className="hidden xl:flex items-stretch shrink-0">
              {categories.map((cat) => {
                const isActive = currentSlug === catSlug(cat);
                const hasMenu = cat.groups && cat.groups.length > 0;
                const isOpen = activeMenu === cat.name;
                return (
                  <li key={cat.name} className="flex" onMouseEnter={() => (hasMenu ? openMenu(cat.name) : scheduleClose())} onMouseLeave={scheduleClose}>
                    <button className="relative flex items-center gap-0.5 px-2 py-1.5 text-[12px] font-bold uppercase tracking-tight text-gray-800 hover:text-gray-900" onClick={() => goCategory(cat)} style={isActive || isOpen ? { color: cat.accent } : undefined}>
                      {cat.name}
                      {hasMenu && <KeyboardArrowDownIcon style={{ fontSize: 14 }} />}
                      <span className={`absolute left-1 right-1 -bottom-1.5 h-[3px] origin-left rounded-full transition-transform duration-200 ${isActive || isOpen ? "scale-x-100" : "scale-x-0"}`} style={{ backgroundColor: cat.accent }} />
                    </button>

                    {hasMenu && isOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 pt-3 -mt-3" onMouseEnter={() => openMenu(cat.name)} onMouseLeave={scheduleClose}>
                        <div className="bg-white shadow-xl border-t-[3px] rounded-b-lg overflow-hidden" style={{ borderTopColor: cat.accent }}>
                          <div className="flex px-8 py-6 gap-10">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1">
                              {cat.groups.map((group) => (
                                <div key={group.title}>
                                  <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: cat.accent }}>{group.title}</h4>
                                  <ul className="space-y-1.5">
                                    {group.items.map((item) => (
                                      <li key={item}>
                                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-all hover:translate-x-1" onClick={() => goSub(cat, item)}>{item}</button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {cat.featured?.length > 0 && (
                              <div className="w-[320px] border-l border-gray-100 pl-8">
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">New Arrivals</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {cat.featured.slice(0, 4).map((p) => (
                                    <button key={p.slug} onClick={() => go(`/product/${p.slug}`)} className="text-left group/card">
                                      <div className="aspect-square bg-gray-100 rounded overflow-hidden"><img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover/card:scale-105 transition" /></div>
                                      <p className="mt-1 text-xs text-gray-700 truncate">{p.name}</p>
                                      {p.price && <p className="text-xs font-semibold">৳{p.price}</p>}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-100 bg-gray-50 px-8 py-3">
                            <button className="text-sm font-semibold" style={{ color: cat.accent }} onClick={() => goCategory(cat)}>View All {cat.name} &rarr;</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 min-w-[220px] items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2" style={{ "--tw-ring-color": BRAND }}>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for products, brands and more" className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
              <button type="submit" aria-label="Search" className="text-gray-400"><SearchIcon fontSize="small" /></button>
            </form>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3.5 lg:gap-4 shrink-0">
              <button onClick={() => go("/stores")} className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-rose-600 transition-colors">
                <LocationOnOutlinedIcon fontSize="medium" />
                <span className="text-[11px] font-medium">Stores</span>
              </button>

              <div className="relative group">
                <button className="flex flex-col items-center gap-0.5 text-gray-700 group-hover:text-rose-600 transition-colors">
                  <PersonOutlineOutlinedIcon fontSize="medium" />
                  <span className="text-[11px] font-medium">Profile</span>
                </button>
                <div className="absolute right-0 top-full z-50 hidden group-hover:block w-60 pt-2">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-md overflow-hidden">
                    <div className="px-4 py-3">
                      {user ? (
                        <p className="text-sm">Hi, <span className="font-bold">{user.name}</span></p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Welcome</p>
                          <div className="mt-1 flex items-center gap-2 text-sm font-bold">
                            <button onClick={() => go("/login")} style={{ color: BRAND }}>Sign in</button>
                            <span className="text-gray-300">/</span>
                            <button onClick={() => go("/register")} style={{ color: BRAND }}>Sign up</button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <ProfileItem icon={Inventory2OutlinedIcon} label="My Orders" onClick={() => go("/account/orders")} />
                      <ProfileItem icon={LocalShippingOutlinedIcon} label="Track Order" onClick={() => go("/track-order")} />
                      <ProfileItem icon={PersonOutlineOutlinedIcon} label="My Account" onClick={() => go("/account")} />
                      {user && <ProfileItem icon={LogoutOutlinedIcon} label="Logout" onClick={() => { onLogout(); }} />}
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => go("/wishlist")} className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-rose-600 transition-colors">
                <span className="relative"><FavoriteBorderOutlinedIcon fontSize="medium" /><Badge count={wishlistCount} /></span>
                <span className="text-[11px] font-medium">Wishlist</span>
              </button>

              <button onClick={() => go("/cart")} className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-rose-600 transition-colors">
                <span className="relative"><ShoppingBagOutlinedIcon fontSize="medium" /><Badge count={cartCount} /></span>
                <span className="text-[11px] font-medium">Bag</span>
              </button>
            </div>

            {/* Mobile: bag + hamburger */}
            <div className="flex items-center gap-2 ml-auto xl:hidden">
              <button onClick={() => go("/cart")} className="relative p-2 text-gray-700"><ShoppingBagOutlinedIcon /><Badge count={cartCount} /></button>
              <button className="text-white p-2 rounded-md" style={{ backgroundColor: BRAND }} onClick={() => { setMenuOpen(!menuOpen); setOpenDropdown(null); }}>
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 bg-white flex flex-col px-4 pt-16 pb-10 xl:hidden z-[100] overflow-y-auto">
            <button className="absolute top-4 right-4 text-gray-700" onClick={() => setMenuOpen(false)}><CloseIcon /></button>

            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-3 mb-4">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
              <button type="submit" aria-label="Search" className="text-gray-400"><SearchIcon fontSize="small" /></button>
            </form>

            <div className="flex justify-around mb-4 border-b border-gray-200 pb-4">
              <MobileAction icon={LocationOnOutlinedIcon} label="Stores" onClick={() => go("/stores")} />
              <MobileAction icon={PersonOutlineOutlinedIcon} label="Profile" onClick={() => go(user ? "/account" : "/login")} />
              <MobileAction icon={FavoriteBorderOutlinedIcon} label="Wishlist" badge={wishlistCount} onClick={() => go("/wishlist")} BadgeCmp={Badge} />
              <MobileAction icon={ShoppingBagOutlinedIcon} label="Bag" badge={cartCount} onClick={() => go("/cart")} BadgeCmp={Badge} />
            </div>

            {categories.map((cat) => {
              const hasMenu = cat.groups && cat.groups.length > 0;
              return (
                <div key={cat.name} className="w-full">
                  <button className="text-gray-800 text-base font-semibold py-3 w-full text-left border-b border-gray-100 flex justify-between items-center" onClick={() => (hasMenu ? setOpenDropdown(openDropdown === cat.name ? null : cat.name) : goCategory(cat))} style={openDropdown === cat.name ? { color: cat.accent } : undefined}>
                    {cat.name}
                    {hasMenu && <span className="ml-4 text-gray-400">{openDropdown === cat.name ? "-" : "+"}</span>}
                  </button>
                  {hasMenu && openDropdown === cat.name && (
                    <div className="bg-gray-50 py-2">
                      {cat.groups.map((group) => (
                        <div key={group.title} className="px-4 py-1">
                          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: cat.accent }}>{group.title}</p>
                          {group.items.map((item) => (
                            <button key={item} className="text-gray-600 text-sm py-1.5 block w-full text-left" onClick={() => goSub(cat, item)}>{item}</button>
                          ))}
                        </div>
                      ))}
                      <button className="text-sm font-semibold px-4 py-2 block w-full text-left" style={{ color: cat.accent }} onClick={() => goCategory(cat)}>View All {cat.name} &rarr;</button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-6 border-t border-gray-200 pt-4 space-y-1">
              {!user && (
                <div className="flex items-center gap-3 text-sm font-bold mb-2">
                  <button onClick={() => go("/login")} style={{ color: BRAND }}>Sign in</button>
                  <span className="text-gray-300">/</span>
                  <button onClick={() => go("/register")} style={{ color: BRAND }}>Sign up</button>
                </div>
              )}
              <button onClick={() => go("/account/orders")} className="block py-2 text-sm text-gray-700">My Orders</button>
              <button onClick={() => go("/track-order")} className="block py-2 text-sm text-gray-700">Track Order</button>
              {user && <button onClick={onLogout} className="block py-2 text-sm text-gray-700">Logout</button>}
            </div>
          </div>
        )}
      </>
    );
  }
);

function ProfileItem({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors">
      <Icon fontSize="small" className="text-gray-400" />
      {label}
    </button>
  );
}

function MobileAction({ icon: Icon, label, onClick, badge = 0, BadgeCmp }) {
  return (
    <button onClick={onClick} className="relative flex flex-col items-center gap-0.5 text-gray-700">
      <span className="relative"><Icon fontSize="medium" />{BadgeCmp && <BadgeCmp count={badge} />}</span>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

export default Navbar;

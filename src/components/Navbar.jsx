import { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MapPin, Package, UserRound, Heart, ShoppingBag } from "lucide-react";
import { getCategories, getProducts } from "../api";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";

const BRAND = "var(--brand)";
const taka = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const imgFallback = (e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x380/f3f4f6/9ca3af?text=RAINZ"; };

const fallbackCategories = [
  { name: "Men", slug: "men", accent: "#E11D48", groups: [] },
  { name: "Women", slug: "women", accent: "#DB2777", groups: [] },
  { name: "Teens", slug: "teens", accent: "#2563EB", groups: [] },
  { name: "Kids", slug: "kids", accent: "#F59E0B", groups: [] },
  { name: "Sports", slug: "sports", accent: "#0D9488", groups: [] },
];

const Navbar = forwardRef(
  (
    { categories: categoriesProp = null, user = null, cartCount = 0, wishlistCount = 0, onLogout = () => { } },
    ref
  ) => {
    const { settings } = useSettings();
    const { add: addToBag } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [fetchedCats, setFetchedCats] = useState(null);
    const [featuredByCat, setFeaturedByCat] = useState({});
    const closeTimer = useRef(null);

    useEffect(() => {
      if (categoriesProp) return;
      let alive = true;
      Promise.all([getCategories(), getProducts({ page: 1, pageSize: 500 }).catch(() => ({ items: [] }))])
        .then(([tree, productResult]) => {
          if (!alive || !tree || !tree.length) return;
          const EXCLUDE = ["sale", "offers", "offer", "best-seller", "best-sellers", "bestseller", "best seller", "new-arrivals", "new arrivals"];
          const filtered = tree.filter((c) => {
            const slug = (c.slug || "").toLowerCase();
            const name = (c.name || "").toLowerCase();
            return !EXCLUDE.includes(slug) && !EXCLUDE.includes(name);
          });
          const products = productResult?.items || [];
          const categoryCounts = new Map();
          const subcategoryCounts = new Map();
          products.forEach((product) => {
            if (product.category) categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
            if (product.category && product.subcategory) {
              const key = `${product.category}:${product.subcategory}`;
              subcategoryCounts.set(key, (subcategoryCounts.get(key) || 0) + 1);
            }
          });
          setFetchedCats(filtered.map((cat) => ({
            ...cat,
            count: categoryCounts.get(cat.slug) ?? cat.count ?? 0,
            groups: (cat.groups || []).map((group) => ({
              ...group,
              counts: Object.fromEntries((group.items || []).map((item) => [
                item,
                subcategoryCounts.get(`${cat.slug}:${slugify(item)}`) ?? group.counts?.[item] ?? 0,
              ])),
            })),
          })));
        })
        .catch(() => { });
      return () => { alive = false; };
    }, [categoriesProp]);

    const categories = categoriesProp || fetchedCats || fallbackCategories;

    const catSlug = (cat) => cat.slug || slugify(cat.name);

    const ensureFeatured = (cat) => {
      const slug = catSlug(cat);
      if (featuredByCat[slug]) return;
      getProducts({ category: slug, pageSize: 10, sort: "newest" })
        .then((res) => setFeaturedByCat((m) => ({ ...m, [slug]: res.items || [] })))
        .catch(() => setFeaturedByCat((m) => ({ ...m, [slug]: [] })));
    };

    const openMenu = (cat) => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setActiveMenu(cat.name);
      ensureFeatured(cat);
    };
    const scheduleClose = () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setActiveMenu(null);
        closeTimer.current = null;
      }, 250);
    };

    const navigate = useNavigate();
    const location = useLocation();
    const currentSlug = location.pathname.split("/")[1] || "home";

    const go = (path) => { setMenuOpen(false); setOpenDropdown(null); navigate(path); };
    const goCategory = (cat) => go(`/${catSlug(cat)}`);
    const goSub = (cat, item) => go(`/${catSlug(cat)}/${slugify(item)}`);

    const addFeaturedToBag = async (product) => {
      const sizes = product.sizes || [];
      const sizeStock = product.sizeStock || {};
      const size = sizes.find((item) => !Object.keys(sizeStock).length || Number(sizeStock[item] || 0) > 0) || null;
      const color = product.colors?.[0]?.name || product.colors?.[0] || null;
      if (sizes.length && !size) return go(`/product/${product.slug}`);
      await addToBag(product, { size, color, qty: 1 });
    };


    useEffect(() => {
      document.body.style.overflow = menuOpen || mobileSearchOpen ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
    }, [menuOpen, mobileSearchOpen]);

    useEffect(() => {
      const closeOnDesktop = () => {
        if (window.innerWidth >= 1280) {
          setMenuOpen(false);
          setOpenDropdown(null);
        }
      };
      const closeOnEscape = (event) => {
        if (event.key === "Escape") {
          setMenuOpen(false);
          setMobileSearchOpen(false);
        }
      };
      window.addEventListener("resize", closeOnDesktop);
      window.addEventListener("keydown", closeOnEscape);
      return () => {
        window.removeEventListener("resize", closeOnDesktop);
        window.removeEventListener("keydown", closeOnEscape);
      };
    }, []);

    useEffect(() => () => closeTimer.current && clearTimeout(closeTimer.current), []);

    const Badge = ({ count }) =>
      count > 0 ? (
        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: BRAND }}>
          {count > 99 ? "99+" : count}
        </span>
      ) : null;

    return (
      <>
        <nav ref={ref} className="w-full fixed top-0 left-0 z-50 shadow-sm border-b border-gray-100" style={{ backgroundColor: "var(--secondary)" }}>
          <div className="w-full mx-auto relative flex min-h-[52px] items-center px-4 py-1.5 sm:px-5 lg:px-6 xl:grid xl:h-16 xl:w-[96%] xl:min-h-0 xl:grid-cols-[auto_minmax(0,1fr)_auto_auto] xl:gap-x-5 xl:px-0 xl:py-0 2xl:w-[92%] 2xl:gap-x-8 min-[1800px]:w-[80%]">

            <Link to="/" className="no-underline shrink-0 flex items-center gap-1.5 sm:gap-2.5 absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0 xl:-translate-y-1.5">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={`${settings.storeName || "Store"} logo`}
                  className="h-9 w-auto max-w-[150px] object-contain sm:h-11 sm:max-w-[190px] xl:h-12 xl:max-w-[190px]"
                />
              ) : (
                <span className="whitespace-nowrap text-xl font-semibold tracking-[0.3em] sm:text-2xl" style={{ color: "var(--title)" }}>
                  {settings.storeName || "RAINZ"}
                </span>
              )}
            </Link>

            {/* Desktop categories with mega-menus */}
            <ul className="hidden min-w-0 xl:flex h-16 items-stretch justify-evenly gap-1" onMouseLeave={scheduleClose}>
              {categories.map((cat) => {
                const isActive = currentSlug === catSlug(cat);
                const hasMenu = (cat.groups && cat.groups.length > 0);
                const isOpen = activeMenu === cat.name;
                return (
                  <li key={cat.name} className="flex h-full items-center" onMouseEnter={() => (hasMenu ? openMenu(cat) : scheduleClose())}>
                    <button className="relative flex h-full items-center gap-0.5 whitespace-nowrap px-2 text-xs leading-none 2xl:px-2.5 2xl:text-[13px] font-bold uppercase tracking-[0.035em] transition-colors" onClick={() => goCategory(cat)} style={{ color: isActive || isOpen ? cat.accent : "var(--title)" }}>
                      <span className="flex items-center gap-0.5">
                        {cat.name}
                        {hasMenu && <KeyboardArrowDownIcon style={{ fontSize: 15 }} />}
                      </span>
                      <span className={`absolute bottom-[11px] left-2 right-2 h-0.5 origin-center transition-transform duration-200 ${isActive || isOpen ? "scale-x-100" : "scale-x-0"}`} style={{ backgroundColor: cat.accent }} />
                    </button>

                    {hasMenu && isOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 pt-3 -mt-3" onMouseEnter={() => openMenu(cat)}>
                        <div className="bg-white shadow-2xl border-t-[3px] rounded-b-lg overflow-hidden" style={{ borderTopColor: cat.accent }}>
                          {/* 50 / 50 split: left = subcategory lists, right = product grid */}
                          <div className="grid grid-cols-2 px-8 py-7 gap-8">
                            {/* LEFT 50% — subcategory lists */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 content-start">
                              {cat.groups.map((group) => (
                                <div key={group.title}>
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: cat.accent }}>{group.title}</h4>
                                  <ul className="space-y-1.5">
                                    {group.items.map((item) => (
                                      <li key={item}>
                                        <button className="flex w-full items-center justify-between gap-3 text-xs font-normal text-gray-600 hover:text-gray-900 transition-all hover:translate-x-1" onClick={() => goSub(cat, item)}>
                                          <span>{item}</span><CountBadge count={group.counts?.[item]} accent={cat.accent} />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {/* RIGHT 50% — product cards (more + smaller, 3-col grid) */}
                            <div className="border-l border-gray-100 pl-8">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 text-gray-500">New Arrivals</h4>
                              <div className="grid grid-cols-5 gap-2.5">
                                {(featuredByCat[catSlug(cat)] && featuredByCat[catSlug(cat)].length > 0)
                                  ? featuredByCat[catSlug(cat)].slice(0, 10).map((p) => (
                                    <div key={p.id ?? p.slug} className="group/card min-w-0">
                                      <button onClick={() => go(`/product/${p.slug}`)} className="relative block w-full overflow-hidden border border-gray-200 bg-gray-50 text-left">
                                        {Number(p.oldPrice) > Number(p.price) && (
                                          <span className="absolute left-1.5 top-1.5 z-10 rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">
                                            -{Math.round((1 - Number(p.price) / Number(p.oldPrice)) * 100)}%
                                          </span>
                                        )}
                                        <span className="block aspect-square overflow-hidden">
                                          <img src={p.image} alt={p.name} className="h-full w-full object-contain group-hover/card:scale-105 transition-transform duration-500" onError={imgFallback} />
                                        </span>
                                        <span className="absolute bottom-1 left-1/2 flex max-w-[94%] -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-sm bg-white/95 px-1.5 py-0.5 text-[9px] shadow-sm">
                                          <strong className="text-black">{taka(p.price)}</strong>
                                          {Number(p.oldPrice) > Number(p.price) && <del className="text-gray-400">{taka(p.oldPrice)}</del>}
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => addFeaturedToBag(p)}
                                        className="mt-1 flex h-7 w-full items-center justify-center gap-1 bg-black px-1 text-[10px] font-bold text-white transition-colors hover:bg-gray-800"
                                        aria-label={`Add ${p.name} to bag`}
                                      >
                                        <span className="text-sm leading-none">+</span> Add to Bag
                                      </button>
                                    </div>
                                  ))
                                  : Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                      <div className="aspect-[3/4] bg-gray-100 rounded" />
                                      <div className="mt-1 h-2 bg-gray-100 rounded w-3/4" />
                                      <div className="mt-1 h-2 bg-gray-100 rounded w-1/2" />
                                    </div>
                                  ))}
                              </div>
                            </div>
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

            {/* Search with live suggestions */}
            <SearchBar compact className="hidden xl:block min-w-0 w-36 -translate-y-2 2xl:w-44" />

            {/* Actions */}
            <div className="hidden xl:flex -translate-y-1.5 items-center justify-between gap-3 2xl:gap-5 shrink-0">
              <button onClick={() => go("/stores")} className="navbar-action flex flex-col items-center gap-0.5" style={{ color: "var(--title)" }}>
                <MapPin size={21} strokeWidth={1.65} />
                <span className="text-[10px] font-normal tracking-[0.01em]">Stores</span>
              </button>
              <button onClick={() => go("/account/orders")} className="navbar-action flex flex-col items-center gap-0.5" style={{ color: "var(--title)" }}>
                <Package size={21} strokeWidth={1.65} />
                <span className="text-[10px] font-normal tracking-[0.01em]">Orders</span>
              </button>
              <div className="relative group">
                <button className="navbar-action flex flex-col items-center gap-0.5" style={{ color: "var(--title)" }}>
                  <UserRound size={21} strokeWidth={1.65} />
                  <span className="text-[10px] font-normal tracking-[0.01em]">Profile</span>
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
                      <ProfileItem icon={LocalShippingOutlinedIcon} label="Track Order" onClick={() => go("/track-order")} />
                      <ProfileItem icon={PersonOutlineOutlinedIcon} label="My Account" onClick={() => go("/account")} />
                      {user && <ProfileItem icon={LogoutOutlinedIcon} label="Logout" onClick={() => { onLogout(); }} />}
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => go("/wishlist")} className="navbar-action relative flex flex-col items-center gap-0.5" style={{ color: "var(--title)" }}>
                <span className="relative"><Heart size={21} strokeWidth={1.65} /><Badge count={wishlistCount} /></span>
                <span className="text-[10px] font-normal tracking-[0.01em]">Wishlist</span>
              </button>

              <button onClick={() => go("/cart")} className="navbar-action relative flex flex-col items-center gap-0.5" style={{ color: "var(--title)" }}>
                <span className="relative"><ShoppingBag size={21} strokeWidth={1.65} /><Badge count={cartCount} /></span>
                <span className="text-[10px] font-normal tracking-[0.01em]">Bag</span>
              </button>
            </div>

            <style>{`
              .navbar-action { transition: color .2s ease, transform .2s ease; }
              .navbar-action svg { transition: transform .2s cubic-bezier(.22,1,.36,1); }
              .navbar-action:hover { color: var(--brand) !important; transform: translateY(-2px); }
              .navbar-action:hover svg { transform: scale(1.1); }
            `}</style>

            {/* Mobile/tablet controls */}
            <div className="flex w-full items-center justify-between xl:hidden">
              <button className="-ml-1 p-1 text-gray-900" aria-label="Open menu" onClick={() => { setMenuOpen(!menuOpen); setOpenDropdown(null); }}>
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
              <div className="flex items-center gap-3 sm:gap-4">
                <button className="p-1 text-gray-900" aria-label="Search" onClick={() => setMobileSearchOpen((open) => !open)}><SearchIcon /></button>
                <button onClick={() => go("/wishlist")} className="relative p-1 text-gray-900" aria-label="Wishlist">
                  <FavoriteBorderOutlinedIcon /><Badge count={wishlistCount} />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[110] bg-white xl:hidden animate-[searchSlideIn_.38s_cubic-bezier(.22,1,.36,1)]">
            <div className="flex items-center gap-2 border-b border-gray-100 p-2 shadow-sm sm:px-4 sm:py-3">
              <button className="flex h-10 w-8 shrink-0 items-center justify-center text-gray-700" aria-label="Close search" onClick={() => setMobileSearchOpen(false)}>
                <ArrowBackIcon />
              </button>
              <SearchBar mobilePanel autoFocus className="min-w-0 flex-1" placeholder="Search products..." onNavigate={() => setMobileSearchOpen(false)} />
            </div>
            <div className="border-b border-gray-100 px-3 py-4 sm:px-6">
              <p className="mb-3 text-xs font-semibold text-gray-600">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["T-Shirt", "Polo", "Hoodie", "Joggers", "Kurti", "Kids"].map((term) => (
                  <button key={term} onClick={() => { setMobileSearchOpen(false); navigate(`/search?q=${encodeURIComponent(term)}`); }} className="rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-200">
                    {term}
                  </button>
                ))}
              </div>
            </div>
            <style>{`@keyframes searchSlideIn{from{transform:translateX(100%);opacity:.65}to{transform:translateX(0);opacity:1}}`}</style>
          </div>
        )}

        {/* Mobile drawer — slides from right, ~2/3 width, with dimmed overlay */}
        {menuOpen && (
          <>
            {/* dark overlay (tap to close) */}
            <div className="fixed inset-0 bg-black/40 xl:hidden z-[99]" onClick={() => setMenuOpen(false)} />
            {/* drawer panel */}
            <div className="fixed top-0 left-0 h-full w-[78vw] max-w-[340px] bg-white flex flex-col px-4 sm:px-5 pt-16 pb-10 xl:hidden z-[100] overflow-y-auto shadow-2xl animate-[slideInLeft_.3s_ease-out]">
              <button className="absolute top-4 left-4 text-gray-700" onClick={() => setMenuOpen(false)}><CloseIcon /></button>

              <div className="grid grid-cols-5 gap-1 mb-4 border-b border-gray-200 pb-4">
                <MobileAction icon={LocationOnOutlinedIcon} label="Stores" onClick={() => go("/stores")} />
                <MobileAction icon={Inventory2OutlinedIcon} label="Orders" onClick={() => go("/account/orders")} />
                <MobileAction icon={PersonOutlineOutlinedIcon} label="Profile" onClick={() => go(user ? "/account" : "/login")} />
                <MobileAction icon={FavoriteBorderOutlinedIcon} label="Wishlist" badge={wishlistCount} onClick={() => go("/wishlist")} BadgeCmp={Badge} />
                <MobileAction icon={ShoppingBagOutlinedIcon} label="Bag" badge={cartCount} onClick={() => go("/cart")} BadgeCmp={Badge} />
              </div>

              {categories.map((cat) => {
                const hasMenu = cat.groups && cat.groups.length > 0;
                return (
                  <div key={cat.name} className="w-full">
                    <button className="grid w-full grid-cols-[minmax(0,1fr)_auto_18px] items-center gap-2 border-b border-gray-100 px-2 py-3 text-left text-sm font-semibold text-gray-800 transition-colors" onClick={() => (hasMenu ? setOpenDropdown(openDropdown === cat.name ? null : cat.name) : goCategory(cat))} style={openDropdown === cat.name ? { color: cat.accent, backgroundColor: `${cat.accent}0A` } : undefined}>
                      <span className="min-w-0 truncate">{cat.name}</span>
                      <CountBadge count={cat.count} accent={cat.accent} active={openDropdown === cat.name} />
                      {hasMenu && <span className={`text-center text-lg leading-none text-gray-400 transition-transform ${openDropdown === cat.name ? "rotate-90" : ""}`}>›</span>}
                    </button>
                    {hasMenu && openDropdown === cat.name && (
                      <div className="bg-white py-1.5">
                        {cat.groups.map((group) => (
                          <div key={group.title}>
                            {group.items.map((item) => (
                              <button key={item} className="grid w-full grid-cols-[minmax(0,1fr)_auto_18px] items-center gap-2 px-6 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-100" onClick={() => goSub(cat, item)}>
                                <span>{item}</span><CountBadge count={group.counts?.[item]} accent={cat.accent} />
                                <span />
                              </button>
                            ))}
                          </div>
                        ))}
                        <button className="block w-full px-6 py-2.5 text-left text-xs font-semibold" style={{ color: cat.accent }} onClick={() => goCategory(cat)}>View All {cat.name} →</button>
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
            <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
          </>
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
    <button onClick={onClick} className="relative min-w-0 flex flex-col items-center gap-0.5 text-gray-700">
      <span className="relative"><Icon fontSize="medium" />{BadgeCmp && <BadgeCmp count={badge} />}</span>
      <span className="w-full truncate text-[10px] sm:text-[11px] font-medium">{label}</span>
    </button>
  );
}

function CountBadge({ count, accent = BRAND, active = false }) {
  if (count === undefined || count === null) return null;
  return (
    <span className="inline-flex min-w-7 shrink-0 items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold tabular-nums" style={active ? { backgroundColor: accent, color: "#fff" } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
      {Number(count).toLocaleString("en-US")}
    </span>
  );
}

export default Navbar;

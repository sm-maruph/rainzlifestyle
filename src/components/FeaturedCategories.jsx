// src/components/FeaturedCategories.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import { getProducts, getCategories } from "../api/mockApi"; // adjust path if needed

const BRAND = "#E11D48";
const taka = (n) => `\u09F3${Number(n).toLocaleString("en-BD")}`;
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const imgFallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x600/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

// Editorial feature image per category slug (swap for your real campaign shots).
const FEATURE_IMAGES = {
  men: "https://loremflickr.com/800/1000/man?lock=5101",
  women: "https://loremflickr.com/800/1000/woman?lock=5102",
  kids: "https://loremflickr.com/800/1000/child?lock=5103",
  accessories: "https://loremflickr.com/800/1000/handbag?lock=5104",
  sale: "https://loremflickr.com/800/1000/fashion?lock=5105",
};

function ProductMini({
  product,
  isViewMore,
  onOpen,
  onViewMore,
  onAddToCart,   // new: optional callback
}) {
  // If it's the "View More" placeholder, render a card with the same height
  if (isViewMore) {
    return (
      <div
        className="flex flex-col rounded-xl bg-white shadow-sm overflow-hidden cursor-pointer group"
        onClick={onViewMore}
      >
        {/* Image area – square */}
        <div className="aspect-square bg-gray-50 relative">
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white font-bold tracking-widest text-base md:text-lg text-center leading-tight">
              VIEW
              <br />
              MORE
            </span>
          </div>
        </div>
        {/* Invisible spacer to match the info panel height of product cards */}
        <div className="h-[4.5rem] md:h-[5rem]" />
      </div>
    );
  }

  // Regular product card
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleAddToBag = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // fallback: navigate to product detail (same as clicking the card)
      onOpen(product);
    }
  };

  return (
    <div
      className="group flex flex-col rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
      onClick={() => onOpen(product)}
    >
      {/* Discount badge */}
      {discount > 0 && (
        <span
          className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: BRAND }}
        >
          -{discount}%
        </span>
      )}

      {/* Image container – square, object-contain to show full product */}
      <div className="aspect-square bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/600x600/f3f4f6/9ca3af?text=${encodeURIComponent(product.name)}`;
          }}
        />
      </div>

      {/* Info panel – always visible below the image */}
      <div className="w-full bg-white px-3 pt-2 pb-3">
        <p className="text-sm text-gray-800 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-gray-900">{taka(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">{taka(product.oldPrice)}</span>
          )}
        </div>
        <button
          onClick={handleAddToBag}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <ShoppingBagOutlinedIcon style={{ fontSize: 15 }} />
          Add to Bag
        </button>
      </div>
    </div>
  );
}

function Spotlight({ spotlight, products, loading, onOpen, onGo, onAddToCart }) {
  const count = spotlight.count || 8;
  const accent = spotlight.accent || BRAND;
  const [activeSub, setActiveSub] = useState(null); // null = "All"

  // Filter products by the selected subcategory (client-side, no refetch)
  const filtered = useMemo(
    () => (activeSub ? products.filter((p) => p.subcategory === activeSub) : products),
    [products, activeSub]
  );
  const slots = filtered.slice(0, count);

  const chips = [{ name: "All", slug: null }, ...(spotlight.subcategories || [])];

  const chipStyle = (isActive) =>
    isActive
      ? { backgroundColor: accent, borderColor: accent, color: "#fff" }
      : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" };

  return (
    <div>
      {/* Category title row */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onGo(spotlight.link)}
          className="flex items-center gap-1 text-lg md:text-xl font-bold text-gray-800 hover:opacity-80"
        >
          {spotlight.label}
          {activeSub && (
            <span className="font-medium text-gray-400">
              {" "}
              /{" "}
              {chips.find((c) => c.slug === activeSub)?.name}
            </span>
          )}
          <ChevronRightIcon style={{ color: accent, fontSize: 22 }} />
        </button>
        <button
          onClick={() => onGo(activeSub ? `${spotlight.link}/${activeSub}` : spotlight.link)}
          className="text-sm font-semibold hover:underline"
          style={{ color: accent }}
        >
          View All &rarr;
        </button>
      </div>

      {/* Subcategory filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((sub) => {
          const isActive = activeSub === sub.slug;
          return (
            <button
              key={sub.slug ?? "all"}
              onClick={() => setActiveSub(sub.slug)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={chipStyle(isActive)}
              onMouseEnter={(e) => {
                if (!isActive) Object.assign(e.currentTarget.style, { backgroundColor: accent, borderColor: accent, color: "#fff" });
              }}
              onMouseLeave={(e) => {
                if (!isActive) Object.assign(e.currentTarget.style, chipStyle(false));
              }}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* Feature card + product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Feature card (left, 2x2 on desktop) */}
        <div
          className="relative col-span-2 lg:row-span-2 rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] lg:aspect-auto lg:h-full"
          onClick={() => onGo(spotlight.link)}
        >
          <img
            src={spotlight.featureImage}
            alt={spotlight.label}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => imgFallback(e, spotlight.label)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: accent }} />
          <h3 className="absolute bottom-4 left-4 text-white text-lg md:text-xl font-bold drop-shadow">
            {spotlight.label}
          </h3>
        </div>

        {/* Product grid (right) */}
        {loading ? (
          Array.from({ length: count }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))
        ) : slots.length === 0 ? (
          <div className="col-span-2 lg:col-span-4 flex items-center justify-center text-gray-400 text-sm py-10">
            No products in this subcategory yet.
          </div>
        ) : (
          slots.map((p, i) => (
            <ProductMini
              key={p.id ?? i}
              product={p}
              isViewMore={!activeSub && i === slots.length - 1 && products.length > count}
              onOpen={onOpen}
              onViewMore={() => onGo(spotlight.link)}
              onAddToCart={onAddToCart}   // pass down
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function FeaturedCategories({
  brandName = "RAINZLIFESTYLE",
  brandLink = "/new-arrivals",
  tagline = "Because comfort and confidence go hand in hand.",
  description = "We focus on carefully selecting the best clothing that is comfortable, looks great, and makes you confident. Beyond fabric, design, and fit, every piece passes strict quality checks — because the right outfit changes how you see yourself.",
  sideImage = "https://loremflickr.com/700/360/fabric?lock=5001",
  spotlights: spotlightsProp, // optional override; otherwise built from getCategories()
  perCategory = 8,
  onProductClick,
}) {
  const navigate = useNavigate();
  const [spotlights, setSpotlights] = useState(spotlightsProp ?? []);
  const [productsBySpot, setProductsBySpot] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const resolveSpots = spotlightsProp
      ? Promise.resolve(spotlightsProp)
      : getCategories().then((cats) =>
        cats.map((c) => ({
          id: c.slug,
          label: c.name,
          accent: c.accent,
          featureImage: FEATURE_IMAGES[c.slug] || FEATURE_IMAGES.sale,
          category: c.slug,
          link: `/${c.slug}`,
          count: perCategory,
          subcategories: Array.from(
            new Map(
              (c.groups || [])
                .flatMap((g) => g.items)
                .map((it) => [slugify(it), { name: it, slug: slugify(it) }])
            ).values()
          ),
        }))
      );

    resolveSpots
      .then((spots) => {
        if (!alive) return;
        setSpotlights(spots);
        // Fetch the FULL category list (no limit) so chips can filter client-side
        return Promise.all(
          spots.map((s) =>
            getProducts({ category: s.category }).then((res) => [s.id, res.items])
          )
        ).then((entries) => alive && setProductsBySpot(Object.fromEntries(entries)));
      })
      .catch(() => { })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightsProp, perCategory]);

  const go = (link) => navigate(link || "/");
  const openProduct = (p) => (onProductClick ? onProductClick(p) : navigate(`/product/${p.slug}`));

  return (
    <section className="w-full bg-white">
      <div className="w-[94%] max-w-[1500px] mx-auto py-10">
        {/* Brand header */}
        <div className="relative">
          <div className="max-w-3xl">
            <button
              onClick={() => go(brandLink)}
              className="flex items-center gap-1 text-2xl md:text-3xl font-semibold text-gray-800 hover:opacity-80"
            >
              {brandName}
              <ChevronRightIcon style={{ color: BRAND }} />
            </button>
            <p className="mt-2 text-lg md:text-xl font-medium" style={{ color: "#9a6a3a" }}>
              {tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">{description}</p>
          </div>

          <img
            src={sideImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="hidden lg:block absolute top-0 right-0 w-[38%] max-w-[560px] h-auto object-contain pointer-events-none"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        {/* One spotlight per navbar category */}
        <div className="mt-8 space-y-10">
          {(spotlights.length ? spotlights : Array.from({ length: 2 })).map((s, i) => (
            <Spotlight
              key={s?.id ?? i}
              spotlight={s || { count: perCategory, label: "", link: "/" }}
              products={s ? productsBySpot[s.id] || [] : []}
              loading={loading}
              onOpen={openProduct}
              onGo={go}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

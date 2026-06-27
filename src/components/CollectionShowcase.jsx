// src/components/CollectionShowcase.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBanners, getCollections } from "../api"; // adjust path if needed

const fallback = (e, label = "RAINZ") => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/700x700/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;
};

function BannerCard({ banner, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl shadow-sm text-left"
    >
      <div className="aspect-[12/5] bg-gray-100">
        <img
          src={banner.image}
          alt={banner.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => fallback(e, banner.title)}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-5 text-white">
        {(banner.caption || banner.subtitle) && (
          <p className="text-[11px] uppercase tracking-widest opacity-80">{banner.caption || banner.subtitle}</p>
        )}
        <h3 className="text-xl md:text-2xl font-extrabold leading-tight">{banner.title}</h3>
        <span className="mt-1 inline-block text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Shop Now &rarr;
        </span>
      </div>
    </button>
  );
}

function CollectionCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl shadow-sm"
    >
      <div className="aspect-square bg-gray-100">
        <img
          src={item.image}
          alt={item.title || item.label}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => fallback(e, item.title || item.label)}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
      <h3 className="absolute inset-x-0 bottom-4 text-center text-white text-base md:text-lg font-bold tracking-wide drop-shadow">
        {item.title || item.label}
      </h3>
    </button>
  );
}

function Skeleton({ className }) {
  return <div className={`rounded-xl bg-gray-100 animate-pulse ${className}`} />;
}

export default function CollectionShowcase({
  banners: bannersProp,
  collections: collectionsProp,
  onSelect, // optional (link) => void; defaults to navigate(link)
}) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState(bannersProp ?? []);
  const [collections, setCollections] = useState(collectionsProp ?? []);
  const [loading, setLoading] = useState(!(bannersProp && collectionsProp));

  useEffect(() => {
    if (bannersProp && collectionsProp) return;
    let alive = true;
    setLoading(true);
    Promise.all([
      bannersProp ? Promise.resolve(bannersProp) : getBanners(),
      collectionsProp ? Promise.resolve(collectionsProp) : getCollections(),
    ])
      .then(([b, c]) => {
        if (!alive) return;
        setBanners(b);
        setCollections(c);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [bannersProp, collectionsProp]);

  const go = (link) => (onSelect ? onSelect(link) : navigate(link || "/"));

  return (
    <section className="w-full" style={{ backgroundColor: "var(--primary)" }}>
      <div className="w-[94%] max-w-[1500px] mx-auto py-8">
        {/* Promo banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="aspect-[12/5]" />)
            : banners.map((b) => <BannerCard key={b.id} banner={b} onClick={() => go(b.link)} />)}
        </div>

        {/* Collection tiles */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)
            : collections.map((c) => <CollectionCard key={c.id} item={c} onClick={() => go(c.link)} />)}
        </div>
      </div>
    </section>
  );
}

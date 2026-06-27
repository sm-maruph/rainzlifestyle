// src/components/Stores.jsx
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const BRAND = "var(--brand)";
const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=RAINZ+Store";
};

// Dummy store data — replace with your real outlets / API later.
const STORES = [
  {
    id: 1, name: "RAINZLIFESTYLE Gulshan", city: "Dhaka",
    address: "Plot 15, Gulshan Avenue, Gulshan-1, Dhaka 1212",
    phone: "+8801700000001", hours: "10:00 AM – 9:00 PM",
    lat: 23.7806, lng: 90.4193,
    image: "https://loremflickr.com/600/400/boutique?lock=7001",
  },
  {
    id: 2, name: "RAINZLIFESTYLE Dhanmondi", city: "Dhaka",
    address: "House 32, Road 27, Dhanmondi, Dhaka 1209",
    phone: "+8801700000002", hours: "10:00 AM – 9:00 PM",
    lat: 23.7461, lng: 90.3742,
    image: "https://loremflickr.com/600/400/clothing,store?lock=7002",
  },
  {
    id: 3, name: "RAINZLIFESTYLE Bashundhara City", city: "Dhaka",
    address: "Level 4, Bashundhara City Mall, Panthapath, Dhaka",
    phone: "+8801700000003", hours: "10:00 AM – 8:30 PM",
    lat: 23.7509, lng: 90.3905,
    image: "https://loremflickr.com/600/400/shop?lock=7003",
  },
  {
    id: 4, name: "RAINZLIFESTYLE Agrabad", city: "Chittagong",
    address: "Agrabad Commercial Area, Chittagong 4100",
    phone: "+8801700000004", hours: "10:00 AM – 9:00 PM",
    lat: 22.3265, lng: 91.8123,
    image: "https://loremflickr.com/600/400/storefront?lock=7004",
  },
  {
    id: 5, name: "RAINZLIFESTYLE Zindabazar", city: "Sylhet",
    address: "Zindabazar Main Road, Sylhet 3100",
    phone: "+8801700000005", hours: "10:30 AM – 8:30 PM",
    lat: 24.8949, lng: 91.8687,
    image: "https://loremflickr.com/600/400/fashion,store?lock=7005",
  },
  {
    id: 6, name: "RAINZLIFESTYLE Khulna", city: "Khulna",
    address: "KDA Avenue, Khulna 9100",
    phone: "+8801700000006", hours: "10:00 AM – 8:00 PM",
    lat: 22.8456, lng: 89.5403,
    image: "https://loremflickr.com/600/400/boutique,shop?lock=7006",
  },
];

const directionsUrl = (s) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;

function StoreCard({ store }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
      <div className="aspect-[16/10] bg-gray-100 relative">
        <img src={store.image} alt={store.name} loading="lazy" className="h-full w-full object-cover" onError={imgFallback} />
        <span className="absolute top-2 left-2 text-[11px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: BRAND }}>
          {store.city}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900">{store.name}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
          <LocationOnOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          {store.address}
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-sm text-gray-600">
          <AccessTimeOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          {store.hours}
        </p>
        <a href={`tel:${store.phone}`} className="mt-1.5 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <CallOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          {store.phone}
        </a>

        <a
          href={directionsUrl(store)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <DirectionsOutlinedIcon style={{ fontSize: 18 }} />
          Get Directions
        </a>
      </div>
    </div>
  );
}

export default function Stores() {
  const [city, setCity] = useState("All");

  const cities = useMemo(() => ["All", ...Array.from(new Set(STORES.map((s) => s.city)))], []);
  const filtered = city === "All" ? STORES : STORES.filter((s) => s.city === city);

  return (
    <div className="w-[94%] max-w-[1300px] mx-auto py-8">
      <nav className="text-xs mb-3 flex items-center flex-wrap gap-y-1" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        <ChevronRightIcon style={{ fontSize: 14, color: "var(--subtitle)" }} className="mx-0.5" />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>Wishlist</span>
      </nav>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Our Stores</h1>
        <p className="mt-1 text-sm text-gray-500">Visit a RAINZLIFESTYLE outlet near you.</p>
      </div>

      {/* City filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {cities.map((c) => {
          const active = city === c;
          return (
            <button
              key={c}
              onClick={() => setCity(c)}
              className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
              style={
                active
                  ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                  : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Store grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-16">No stores found in {city}.</p>
      )}

      {/* Help note */}
      <div className="mt-10 text-center text-sm text-gray-500">
        Can&apos;t find a store near you? Shop online with delivery across Bangladesh, or call{" "}
        <a href="tel:+8809600000000" className="font-semibold" style={{ color: BRAND }}>+880 9600 000000</a>.
      </div>
    </div>
  );
  function Crumb({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`no-underline px-1.5 py-0.5 rounded transition-colors ${className}`}
      style={{ color: "var(--title)" }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--button)"; e.currentTarget.style.color = "var(--button-text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--title)"; }}
    >
      {children}
    </Link>
  );
}
}

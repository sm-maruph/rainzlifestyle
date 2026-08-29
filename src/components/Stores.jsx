import { Link } from "react-router-dom";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import storeImage from "../assets/global/store_image.jpeg";

const BRAND = "var(--brand)";

const STORE = {
  name: "RAINZ LIFESTYLE",
  city: "Dhaka",
  address: "Road - 3, House - 256, Baridhara DOHS, Dhaka, Bangladesh",
  phone: "+880 1780-264400",
  mapUrl: "https://maps.app.goo.gl/zjjNU4CffzVu3CnJ6",
  image: storeImage,
};

function StoreCard({ store }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/10] bg-gray-100">
        <img src={store.image} alt={`${store.name} store in Baridhara DOHS`} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: BRAND }}>
          {store.city}
        </span>
      </div>
      <div className="p-4">
        <h2 className="font-bold text-gray-900">{store.name}</h2>
        <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
          <LocationOnOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          <span>{store.address}</span>
        </p>
        <a href="tel:+8801780264400" className="mt-1.5 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <CallOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
          {store.phone}
        </a>
        <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: BRAND }}>
          <DirectionsOutlinedIcon style={{ fontSize: 18 }} />
          Get Directions
        </a>
      </div>
    </div>
  );
}

function Crumb({ to, children }) {
  return (
    <Link to={to} className="rounded px-1.5 py-0.5 no-underline transition-colors" style={{ color: "var(--title)" }}>
      {children}
    </Link>
  );
}

export default function Stores() {
  return (
    <div className="mx-auto w-[94%] max-w-[1300px] py-8">
      <nav className="mb-3 flex flex-wrap items-center text-xs" style={{ color: "var(--title)" }}>
        <Crumb to="/">Home</Crumb>
        <ChevronRightIcon className="mx-0.5" style={{ fontSize: 14, color: "var(--subtitle)" }} />
        <span className="px-1.5 py-0.5" style={{ color: "var(--subtitle)" }}>Stores</span>
      </nav>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Our Store</h1>
        <p className="mt-1 text-sm text-gray-500">Visit RAINZ LIFESTYLE in Baridhara DOHS.</p>
      </div>
      <div className="mx-auto max-w-md">
        <StoreCard store={STORE} />
      </div>
      <div className="mt-10 text-center text-sm text-gray-500">
        Shop online with delivery across Bangladesh, or call{" "}
        <a href="tel:+8801780264400" className="font-semibold" style={{ color: BRAND }}>{STORE.phone}</a>.
      </div>
    </div>
  );
}

// src/components/admin/AdminSettings.jsx
import { useState } from "react";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const BRAND = "#E11D48";

const DEFAULTS = {
  storeName: "RAINZLIFESTYLE",
  tagline: "Fashion for everyone",
  currency: "BDT (৳)",
  supportEmail: "support@rainzlifestyle.com",
  supportPhone: "+880 9600 000000",
  logo: "",
  address: "Plot 15, Gulshan Avenue, Gulshan-1, Dhaka 1212",
  city: "Dhaka",
  hours: "10:00 AM – 9:00 PM",
  delivery: { inside: 80, outside: 120, freeThreshold: 1500 },
  payments: [
    { key: "cod", label: "Cash on Delivery", enabled: true },
    { key: "bkash", label: "bKash", enabled: true },
    { key: "nagad", label: "Nagad", enabled: true },
    { key: "sslcommerz", label: "Card / SSLCommerz", enabled: false },
  ],
  social: { facebook: "", instagram: "", youtube: "", tiktok: "", whatsapp: "" },
  maintenance: false,
};

const SOCIALS = [
  { key: "facebook", label: "Facebook", icon: FacebookIcon, ph: "https://facebook.com/rainzlifestyle" },
  { key: "instagram", label: "Instagram", icon: InstagramIcon, ph: "https://instagram.com/rainzlifestyle" },
  { key: "youtube", label: "YouTube", icon: YouTubeIcon, ph: "https://youtube.com/@rainzlifestyle" },
  { key: "tiktok", label: "TikTok", icon: MusicNoteIcon, ph: "https://tiktok.com/@rainzlifestyle" },
  { key: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon, ph: "+8801XXXXXXXXX" },
];

export default function AdminSettings() {
  const [s, setS] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const setDelivery = (k, v) => setS((p) => ({ ...p, delivery: { ...p.delivery, [k]: v } }));
  const setSocial = (k, v) => setS((p) => ({ ...p, social: { ...p.social, [k]: v } }));
  const togglePay = (key) => setS((p) => ({ ...p, payments: p.payments.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m)) }));

  const onLogo = (e) => {
    const f = e.target.files?.[0];
    if (f) set("logo", URL.createObjectURL(f)); // local preview only
  };

  const save = () => {
    // TODO: POST settings to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">Store configuration used across your storefront.</p>
        </div>
        <button onClick={save} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Save Changes</button>
      </div>

      {/* Store profile */}
      <Section icon={StorefrontOutlinedIcon} title="Store Profile">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-20 w-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            {s.logo ? <img src={s.logo} alt="logo" className="h-full w-full object-cover" /> : <ImageOutlinedIcon style={{ color: "#9ca3af" }} />}
          </div>
          <div>
            <label className="inline-block rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              Upload logo
              <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">PNG or SVG, square works best.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Store name"><input value={s.storeName} onChange={(e) => set("storeName", e.target.value)} className="inp" /></Field>
          <Field label="Tagline"><input value={s.tagline} onChange={(e) => set("tagline", e.target.value)} className="inp" /></Field>
          <Field label="Currency">
            <select value={s.currency} onChange={(e) => set("currency", e.target.value)} className="inp">
              <option>BDT (৳)</option><option>USD ($)</option><option>INR (₹)</option><option>EUR (€)</option>
            </select>
          </Field>
          <Field label="Support email"><input value={s.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} className="inp" /></Field>
          <Field label="Support phone"><input value={s.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} className="inp" /></Field>
        </div>
      </Section>

      {/* Contact */}
      <Section icon={ContactPhoneOutlinedIcon} title="Contact & Address">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Address" full><input value={s.address} onChange={(e) => set("address", e.target.value)} className="inp" /></Field>
          <Field label="City"><input value={s.city} onChange={(e) => set("city", e.target.value)} className="inp" /></Field>
          <Field label="Business hours"><input value={s.hours} onChange={(e) => set("hours", e.target.value)} className="inp" /></Field>
        </div>
      </Section>

      {/* Delivery */}
      <Section icon={LocalShippingOutlinedIcon} title="Delivery Charges" desc="Applied at checkout based on the customer's location.">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Inside Dhaka (৳)"><input type="number" value={s.delivery.inside} onChange={(e) => setDelivery("inside", e.target.value)} className="inp" /></Field>
          <Field label="Outside Dhaka (৳)"><input type="number" value={s.delivery.outside} onChange={(e) => setDelivery("outside", e.target.value)} className="inp" /></Field>
          <Field label="Free delivery over (৳)"><input type="number" value={s.delivery.freeThreshold} onChange={(e) => setDelivery("freeThreshold", e.target.value)} className="inp" /></Field>
        </div>
      </Section>

      {/* Payments */}
      <Section icon={PaymentsOutlinedIcon} title="Payment Methods" desc="Turn on the methods you accept.">
        <div className="divide-y divide-gray-50">
          {s.payments.map((m) => (
            <div key={m.key} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-800">{m.label}</span>
              <Toggle on={m.enabled} onChange={() => togglePay(m.key)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Social */}
      <Section icon={ShareOutlinedIcon} title="Social Links">
        <div className="space-y-3">
          {SOCIALS.map(({ key, label, icon: Icon, ph }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"><Icon style={{ fontSize: 20 }} /></span>
              <input value={s.social[key]} onChange={(e) => setSocial(key, e.target.value)} placeholder={ph} className="inp" />
            </div>
          ))}
        </div>
      </Section>

      {/* Maintenance */}
      <Section icon={StorefrontOutlinedIcon} title="Maintenance Mode" desc="When on, customers see a 'be right back' page instead of the store.">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">{s.maintenance ? "Store is currently OFFLINE" : "Store is live"}</span>
          <Toggle on={s.maintenance} onChange={() => set("maintenance", !s.maintenance)} />
        </div>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button onClick={save} className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND }}>Save Changes</button>
      </div>

      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2.5 text-sm shadow-lg">
          <CheckCircleIcon style={{ fontSize: 18, color: "#34d399" }} /> Settings saved
        </div>
      )}

      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#9ca3af}`}</style>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND}14`, color: BRAND }}><Icon style={{ fontSize: 18 }} /></span>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      {desc && <p className="text-sm text-gray-500 mb-4 ml-10">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "" : "bg-gray-200"}`} style={on ? { backgroundColor: BRAND } : {}}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

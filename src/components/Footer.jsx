// src/components/Footer.jsx — contact + socials driven by store settings
import React, { useState } from "react";
import { Mail, Phone, Check, MapPin } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const BRAND = "var(--brand)";

const COLORS = {
  bg: "#1a1a1a",
  accent: BRAND,
  text: "#D6D6D6",
  textMuted: "#f8f7f7",
  divider: "#ffffff",
  cartisy: "#ff4d4d",
};

const NAV_LINKS = [
  { label: "About RainzLifestyle", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cancellation & Return Policy", href: "#" },
  { label: "FAQs", href: "#" },
  { label: "Contact Us", href: "#" },
];

/* ---- Social icons ---- */
const SocialIcon = ({ path, href = "#", viewBox = "0 0 24 24", label }) => (
  <a
    href={href}
    target={href !== "#" ? "_blank" : undefined}
    rel={href !== "#" ? "noopener noreferrer" : undefined}
    aria-label={label}
    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
    style={{ color: COLORS.text }}
  >
    <svg viewBox={viewBox} className="h-5 w-5" fill="currentColor">
      {path}
    </svg>
  </a>
);

const ICONS = {
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.17-1 .37-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.17-.4-.37-1-.42-2.2C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.21 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.07-1.1.05-1.7.24-2.1.4-.5.2-.9.43-1.3.83-.4.4-.63.8-.83 1.3-.16.4-.35 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 13.4v-2.8c0-3.1 0-3.5.07-4.7zM12 7.1a4.9 4.9 0 100 9.8 4.9 4.9 0 000-9.8zm0 8.1a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5-8.3a1.15 1.15 0 11-2.3 0 1.15 1.15 0 012.3 0z" />
  ),
  tiktok: (
    <path d="M16.6 5.8a4.9 4.9 0 01-1.1-2.8h-3v12.2a2.5 2.5 0 11-2.5-2.5c.26 0 .5.04.74.11V9.7a5.6 5.6 0 00-.74-.05 5.55 5.55 0 105.55 5.55V9.06a8 8 0 004.55 1.42V7.4a4.9 4.9 0 01-3.5-1.6z" />
  ),
  facebook: (
    <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.76-1.6 1.5V12h2.8l-.45 2.9h-2.35v7A10 10 0 0022 12z" />
  ),
  whatsapp: (
    <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 1.8a8.2 8.2 0 11-4.2 15.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 0112 3.8zm4.7 10.3c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.5-.4-.5-.7-1-.8-1.4-.1-.2 0-.4.1-.5l.4-.4c.1-.2.2-.3.2-.5s0-.4-.1-.5c-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3z" />
  ),
  x: (
    <path d="M18.2 2.5h3.3l-7.2 8.2L23 21.5h-6.6l-5.2-6.8-6 6.8H1.9l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.2-6.2zm-1.2 17h1.8L7.1 4.4H5.2L17 19.5z" />
  ),
  youtube: (
    <path d="M23.5 7.2a3 3 0 00-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 00.5 7.2 31 31 0 000 12a31 31 0 00.5 4.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-4.8zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z" />
  ),
};

// order to render social icons; only those with a saved URL appear
const SOCIAL_ORDER = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "youtube", label: "YouTube" },
];

const StoreButton = ({ top, bottom, icon }) => (
  <a href="#" className="flex items-center gap-2 rounded-md bg-black px-3 py-2 transition-opacity hover:opacity-85">
    <span className="text-white">{icon}</span>
    <span className="flex flex-col leading-none text-white">
      <span className="text-[9px] uppercase tracking-wide opacity-80">{top}</span>
      <span className="text-sm font-semibold">{bottom}</span>
    </span>
  </a>
);

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) return;
    console.log("Subscribe:", email);
    setEmail("");
  };

  const storeName = settings.storeName || "RainzLifestyle";
  const social = settings.social || {};
  // whatsapp may be a phone number; turn it into a wa.me link
  const socialHref = (key, val) => {
    if (!val) return null;
    if (key === "whatsapp") {
      const digits = String(val).replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    }
    return val;
  };
  const activeSocials = SOCIAL_ORDER.map((s) => ({ ...s, href: socialHref(s.key, social[s.key]) })).filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      {/* ---- Office info bar ---- */}
      <div className="border-b border-white/10 py-2 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3 sm:text-sm leading-relaxed">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
              <div>
                <span className="font-semibold text-white/80">Address:</span>
                <span className="ml-0.5 text-white/70">
                  {settings.address || "Setu Homes, 55-Box Nagar, Zoo Road, Mirpur-1, Dhaka-1216"}
                  {settings.city ? `, ${settings.city}` : ""}
                </span>
              </div>
            </div>
            {settings.hours && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
                <div>
                  <span className="font-semibold text-white/80">Hours:</span>
                  <span className="ml-0.5 text-white/70">{settings.hours}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND }} />
              <div>
                <span className="font-semibold text-white/80">Email:</span>
                <span className="ml-0.5 text-white/70">
                  {settings.supportEmail || "support@rainzlifestyle.com"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Main grid ---- */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 md:px-8 lg:grid-cols-12 lg:px-10">
        {/* Column 1 — Brand + links */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center gap-2">
            {settings.logo ? (
              <img src={settings.logo} alt={storeName} className="h-11 w-auto object-contain sm:h-12" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-md text-xl font-black text-white sm:h-12 sm:w-12 sm:text-2xl" style={{ backgroundColor: COLORS.accent }}>
                {storeName[0]}
              </div>
            )}
            <span className="text-base font-bold text-white sm:text-lg">{storeName}</span>
          </div>

          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-gray-300 transition-colors hover:text-white">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2 — Newsletter + contact */}
        <div className="lg:col-span-5">
          <div className="mb-7">
            <div className="mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: COLORS.accent }} />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
                Get special discounts in your inbox
              </h3>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Enter email to get offers, discounts and more."
                className="min-w-0 flex-1 border-0 border-b bg-transparent px-1 py-2 text-sm text-white placeholder-gray-400 outline-none"
                style={{ borderBottomColor: COLORS.divider }}
              />
              <button onClick={handleSubscribe} className="rounded-sm px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:ml-2" style={{ backgroundColor: COLORS.accent }}>
                Subscribe
              </button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" style={{ color: COLORS.accent }} />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
                For any help you may call us at
              </h3>
            </div>
            <div className="space-y-1 text-sm" style={{ color: COLORS.textMuted }}>
              <p className="text-white">{settings.supportPhone || "+880 9677 666888"}</p>
              <p>Customer Service</p>
              <p>Track your order or get help returning an order</p>
            </div>
          </div>
        </div>

        {/* Column 3 — Follow + apps */}
        <div className="lg:col-span-4">
          <div className="mb-3 flex items-center gap-2">
            <Check className="h-4 w-4" style={{ color: COLORS.accent }} />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">Follow us</h3>
          </div>

          <p className="mb-4 text-sm" style={{ color: COLORS.textMuted }}>
            Stay updated on our latest arrivals, exclusive promotions and events.
          </p>

          {activeSocials.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-1">
              {activeSocials.map((s) => (
                <SocialIcon key={s.key} path={ICONS[s.key]} href={s.href} label={s.label} />
              ))}
            </div>
          ) : (
            <p className="mb-5 text-xs text-gray-500">Social links can be added in admin settings.</p>
          )}

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <StoreButton top="Get it on" bottom="Google Play" icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M3.6 2.3c-.2.2-.3.5-.3.9v17.6c0 .4.1.7.3.9l.1.1L13.5 12 3.7 2.2l-.1.1z" />
                <path d="M17 15.3l-3.5-3.3 3.5-3.3 4 2.3c1.1.6 1.1 1.7 0 2.3l-4 2z" />
                <path d="M3.7 21.7l9.8-9.7 3.5 3.3-11 6.3c-.9.5-1.7.4-2.3.1z" />
                <path d="M3.7 2.3l13.3 7.6-3.5 3.3L3.7 2.3z" opacity=".85" />
              </svg>
            } />
            <StoreButton top="Download on the" bottom="App Store" icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1s1.5-.7 2.8-.7 1.6.7 2.7.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2.3-.9-2.3-3.5zM14.3 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
              </svg>
            } />
          </div>
        </div>
      </div>

      {/* ---- Bottom bar ---- */}
      <div style={{ borderTop: `1px solid ${COLORS.divider}` }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row sm:px-6 md:px-8 lg:px-10">
          <p style={{ color: COLORS.textMuted }}>
            Copyright &copy; {year} <span className="font-semibold text-white">{storeName}</span> All rights reserved.
          </p>
          <p style={{ color: COLORS.textMuted }}>
            Developed by{" "}
            <a href="https://theatives.com/" target="_blank" rel="noopener noreferrer" className="font-semibold no-underline transition-colors hover:underline" style={{ color: COLORS.cartisy }}>
              Theatives
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

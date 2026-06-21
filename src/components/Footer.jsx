// src/components/Footer.jsx
import React, { useState } from "react";
import { Mail, Phone, Check } from "lucide-react";

/**
 * Brand colors — swap these for your own tokens (e.g. your `mm-primary`)
 * if you want them wired into your Tailwind config instead of inline styles.
 */
const COLORS = {
  bg: "#595959",
  accent: "#0b807a",
  text: "#D6D6D6",
  textMuted: "#f8f7f7",
  divider: "#ffffff",
};

const NAV_LINKS = [
  { label: "About M&M", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cancellation & Return Policy", href: "#" },
  { label: "FAQs", href: "#" },
  { label: "Contact Us", href: "#" },
];

/* ---- Inline brand icons (so all six render consistently) ---- */
const SocialIcon = ({ path, viewBox = "0 0 24 24", label }) => (
  <a
    href="#"
    aria-label={label}
    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
  >
    <svg
      viewBox={viewBox}
      className="h-5 w-5"
      fill="currentColor"
      style={{ color: COLORS.text }}
    >
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
  x: (
    <path d="M18.2 2.5h3.3l-7.2 8.2L23 21.5h-6.6l-5.2-6.8-6 6.8H1.9l7.7-8.8L1.5 2.5h6.8l4.7 6.2 5.2-6.2zm-1.2 17h1.8L7.1 4.4H5.2L17 19.5z" />
  ),
  pinterest: (
    <path d="M12 2.2a9.8 9.8 0 00-3.6 18.9c-.08-.8-.15-2 .03-2.9.17-.78 1.1-4.7 1.1-4.7s-.28-.56-.28-1.4c0-1.3.76-2.3 1.7-2.3.8 0 1.2.6 1.2 1.32 0 .8-.5 2-.78 3.1-.22.95.47 1.72 1.4 1.72 1.7 0 2.9-2.2 2.9-4.8 0-2-1.35-3.5-3.8-3.5a4.3 4.3 0 00-4.5 4.3c0 .85.33 1.77.74 2.27.08.1.1.18.07.28-.08.33-.26 1-.3 1.16-.05.18-.16.22-.36.13-1.35-.63-2.2-2.6-2.2-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.8-2.4 6.8-5.7 6.8-1.1 0-2.16-.58-2.5-1.27l-.7 2.6c-.25.95-.92 2.16-1.37 2.9A9.8 9.8 0 1012 2.2z" />
  ),
  youtube: (
    <path d="M23.5 7.2a3 3 0 00-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 00.5 7.2 31 31 0 000 12a31 31 0 00.5 4.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-4.8zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z" />
  ),
};

const SOCIALS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X (Twitter)" },
  { key: "pinterest", label: "Pinterest" },
  { key: "youtube", label: "YouTube" },
];

/* ---- App store buttons ---- */
const StoreButton = ({ top, bottom, icon }) => (
  <a
    href="#"
    className="flex items-center gap-2 rounded-md bg-black px-3 py-2 transition-opacity hover:opacity-85"
  >
    <span className="text-white">{icon}</span>
    <span className="flex flex-col leading-none text-white">
      <span className="text-[9px] uppercase tracking-wide opacity-80">{top}</span>
      <span className="text-sm font-semibold">{bottom}</span>
    </span>
  </a>
);

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) return;
    // TODO: wire up to your newsletter endpoint
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:px-10 lg:grid-cols-12">
        {/* Column 1 — Brand + links */}
        <div className="lg:col-span-3">
          {/* Logo */}
          <div className="mb-7 flex items-center gap-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-md text-2xl font-black text-white"
              style={{ backgroundColor: COLORS.accent }}
            >
              M
            </div>
            <span className="text-lg font-bold text-white">M&amp;M</span>
          </div>

          <ul className="space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-gray-300 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2 — Newsletter + contact */}
        <div className="lg:col-span-5">
          {/* Newsletter */}
          <div className="mb-9">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: COLORS.accent }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                Get special discounts in your inbox
              </h3>
            </div>

            <div className="flex max-w-xl items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Enter email to get offers, discounts and more."
                className="min-w-0 flex-1 border-0 border-b bg-transparent px-1 py-2 text-sm text-white placeholder-gray-400 outline-none"
                style={{ borderBottomColor: COLORS.divider }}
              />
              <button
                onClick={handleSubscribe}
                className="ml-2 rounded-sm px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.accent }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" style={{ color: COLORS.accent }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                For any help you may call us at
              </h3>
            </div>
            <div className="space-y-1 text-sm" style={{ color: COLORS.textMuted }}>
              <p className="text-white">+880 9677 666888</p>
              <p>Customer Service</p>
              <p>Track your order or get help returning an order</p>
            </div>
          </div>
        </div>

        {/* Column 3 — Follow + apps */}
        <div className="lg:col-span-4">
          <div className="mb-3 flex items-center gap-2">
            <Check className="h-4 w-4" style={{ color: COLORS.accent }} />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Follow us
            </h3>
          </div>

          <p className="mb-4 text-sm" style={{ color: COLORS.textMuted }}>
            Stay updated on our latest arrivals, exclusive promotions and events.
          </p>

          {/* Social icons */}
          <div className="mb-6 flex flex-wrap gap-1">
            {SOCIALS.map((s) => (
              <SocialIcon key={s.key} path={ICONS[s.key]} label={s.label} />
            ))}
          </div>

          {/* App buttons */}
          <div className="flex flex-wrap gap-3">
            <StoreButton
              top="Get it on"
              bottom="Google Play"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M3.6 2.3c-.2.2-.3.5-.3.9v17.6c0 .4.1.7.3.9l.1.1L13.5 12 3.7 2.2l-.1.1z" />
                  <path d="M17 15.3l-3.5-3.3 3.5-3.3 4 2.3c1.1.6 1.1 1.7 0 2.3l-4 2z" />
                  <path d="M3.7 21.7l9.8-9.7 3.5 3.3-11 6.3c-.9.5-1.7.4-2.3.1z" />
                  <path d="M3.7 2.3l13.3 7.6-3.5 3.3L3.7 2.3z" opacity=".85" />
                </svg>
              }
            />
            <StoreButton
              top="Download on the"
              bottom="App Store"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1s1.5-.7 2.8-.7 1.6.7 2.7.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2.3-.9-2.3-3.5zM14.3 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${COLORS.divider}` }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs md:flex-row md:px-10">
          <p style={{ color: COLORS.textMuted }}>
            Copyright &copy; 2025{" "}
            <span className="font-semibold text-white">
              Materials &amp; More Enterprise (M&amp;M)
            </span>{" "}
            All rights reserved.
          </p>
          <p style={{ color: COLORS.textMuted }}>
            Developed by{" "}
            <a
              href="https://theatives.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold no-underline hover:underline"
              style={{ color: COLORS.accent }}
            >
              Theatives
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// src/components/AuthLayout.jsx
import { Link } from "react-router-dom";

const BRAND = "var(--brand)";
const Sparkle = ({ size, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="rgba(255,255,255,0.5)" style={style} aria-hidden="true">
    <path d="M12 0c.6 6.2 1.2 6.8 7.4 7.4C13.2 8 12.6 8.6 12 24c-.6-15.4-1.2-16-7.4-16.6C10.8 6.8 11.4 6.2 12 0z" />
  </svg>
);

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #7a0d29 100%)` }}
      >
        <Sparkle size={80} style={{ position: "absolute", top: 40, right: 60 }} />
        <Sparkle size={40} style={{ position: "absolute", top: 120, right: 160 }} />
        <Sparkle size={120} style={{ position: "absolute", bottom: 60, left: -10 }} />

        <Link to="/" className="relative z-10 text-2xl font-extrabold tracking-tight">
          RAINZ<span className="font-light opacity-80">LIFESTYLE</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight">Comfort meets confidence.</h2>
          <p className="mt-3 text-white/80 max-w-sm">
            Discover premium clothing crafted for everyday style. Join RAINZLIFESTYLE for exclusive drops and member-only offers.
          </p>
        </div>

        <p className="relative z-10 text-white/60 text-sm">© 2026 RAINZLIFESTYLE. All rights reserved.</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden block text-center text-2xl font-extrabold mb-8 text-gray-900">
            RAINZ<span className="font-light text-gray-400">LIFESTYLE</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

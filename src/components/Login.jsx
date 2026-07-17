// src/components/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const BRAND = "var(--brand)";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refresh } = useAuth();
  const { settings } = useSettings();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      const profile = await refresh();
      const target = from || (profile?.role === "admin" ? "/admin" : "/");
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[98vh] md:max-h-none">
        {/* Brand Panel */}
        <div
          className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center text-white"
          style={{ background: `linear-gradient(145deg, ${BRAND}, #9f1239)` }}
        >
          <div className="max-w-sm mx-auto w-full">
            {settings.logo && (
              <div className="inline-block bg-gradient-to-br from-white to-gray-100 p-1 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6">
                <img
                  src={settings.logo}
                  alt={settings.storeName}
                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl object-cover"
                />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-tight">
              {settings.storeName || "RAINZLIFESTYLE"}
            </h1>
            <p className="mt-2 sm:mt-3 text-white/80 sm:text-white/90 text-sm sm:text-base leading-relaxed">
              Welcome back. Sign in to manage orders, wishlists, and faster checkout.
            </p>
            <ul className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/70 sm:text-white/80">
              <li className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-white/60 rounded-full flex-shrink-0" />
                Save favorites to your wishlist
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-white/60 rounded-full flex-shrink-0" />
                Track every order in one place
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-white/60 rounded-full flex-shrink-0" />
                Faster, pre‑filled checkout
              </li>
            </ul>
          </div>
        </div>

        {/* Form Panel */}
        <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex items-center justify-center">
          <form onSubmit={submit} className="w-full max-w-sm" noValidate>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              Enter your credentials to access your account.
            </p>

            {error && (
              <div className="mt-3 sm:mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-gray-50/50 px-3 sm:px-4 transition focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-200">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className="flex-1 py-2 sm:py-3 text-sm outline-none bg-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? (
                      <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                    ) : (
                      <VisibilityOutlinedIcon style={{ fontSize: 20 }} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 sm:mt-4 text-xs sm:text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800 transition">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => set("remember", e.target.checked)}
                  className="accent-current rounded border-gray-300"
                  style={{ accentColor: BRAND }}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="font-medium transition hover:underline"
                style={{ color: BRAND }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 sm:mt-6 w-full rounded-xl py-2.5 sm:py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600 text-center">
              New to {settings.storeName || "Brand Name"}?{" "}
              <Link
                to="/register"
                className="font-semibold transition hover:underline"
                style={{ color: BRAND }}
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
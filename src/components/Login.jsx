// src/components/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useAuth } from "../context/AuthContext";

const BRAND = "var(--brand)";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refresh } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If the admin guard bounced the user here, it stored where they were headed.
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
      // refresh() returns the loaded profile so we can route by role
      const profile = await refresh();

      console.log("PROFILE AFTER LOGIN:", profile); const target = from || (profile?.role === "admin" ? "/admin" : "/");
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-center px-12 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND}, #9f1239)` }}
      >
        <h1 className="text-4xl font-black tracking-tight">RAINZLIFESTYLE</h1>
        <p className="mt-3 text-white/90 max-w-sm">
          Welcome back. Sign in to track orders, manage your wishlist, and check out faster.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-white/80">
          <li>• Save your favorites to your wishlist</li>
          <li>• Track every order in one place</li>
          <li>• Faster, pre-filled checkout</li>
        </ul>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <h2 className="text-2xl font-extrabold text-gray-900">Sign in</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your details to continue.</p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <label className="block mt-5">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              placeholder="you@example.com"
            />
          </label>

          <label className="block mt-4">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <div className="mt-1 flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-gray-400">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                ) : (
                  <VisibilityOutlinedIcon style={{ fontSize: 20 }} />
                )}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between mt-3 text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => set("remember", e.target.checked)}
                style={{ accentColor: BRAND }}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium" style={{ color: BRAND }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-5 text-sm text-gray-600 text-center">
            New to RAINZLIFESTYLE?{" "}
            <Link to="/register" className="font-semibold" style={{ color: BRAND }}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
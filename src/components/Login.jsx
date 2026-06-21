// src/components/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const BRAND = "#E11D48";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.id.trim()) e.id = "Enter your email or phone";
    if (!form.password) e.password = "Enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: replace with AuthContext.login(form).then(...)
    setTimeout(() => {
      setLoading(false);
      navigate("/"); // redirect after login
    }, 700);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your RAINZLIFESTYLE account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold" style={{ color: BRAND }}>
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Email / phone */}
        <div>
          <label className="text-sm font-medium text-gray-700">Email or Phone</label>
          <div className="mt-1 flex items-center rounded-md border border-gray-200 px-3 focus-within:border-gray-400">
            <MailOutlineIcon style={{ fontSize: 18, color: "#9ca3af" }} />
            <input
              value={form.id}
              onChange={set("id")}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none"
              placeholder="you@example.com or 01XXXXXXXXX"
            />
          </div>
          {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 flex items-center rounded-md border border-gray-200 px-3 focus-within:border-gray-400">
            <LockOutlinedIcon style={{ fontSize: 18, color: "#9ca3af" }} />
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-gray-400" aria-label="Toggle password">
              {showPw ? <VisibilityOffOutlinedIcon style={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 18 }} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: BRAND }} />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium" style={{ color: BRAND }}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: BRAND }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> OR <span className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Social */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-3.9 6.8-9.7 6.8-17.2z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
          Continue with Google
        </button>
        <button className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>
          Continue with Facebook
        </button>
      </div>
    </AuthLayout>
  );
}

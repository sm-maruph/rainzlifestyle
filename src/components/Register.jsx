// src/components/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useAuth } from "../context/AuthContext";

const BRAND = "#E11D48";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "", terms: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!form.terms) { setError("Please accept the terms to continue."); return; }
    setLoading(true);
    try {
      await register({ full_name: form.full_name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center px-12 text-white" style={{ background: `linear-gradient(135deg, ${BRAND}, #9f1239)` }}>
        <h1 className="text-4xl font-black">RAINZLIFESTYLE</h1>
        <p className="mt-3 text-white/90 max-w-sm">Create an account to save your favorites, track orders, and check out in seconds.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-gray-900">Create account</h2>
          <p className="text-sm text-gray-500 mt-1">It only takes a minute.</p>

          {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

          <label className="block mt-5">
            <span className="text-sm font-medium text-gray-700">Full name</span>
            <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400" placeholder="Your name" />
          </label>
          <label className="block mt-4">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400" placeholder="you@example.com" />
          </label>
          <label className="block mt-4">
            <span className="text-sm font-medium text-gray-700">Phone (optional)</span>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400" placeholder="01XXXXXXXXX" />
          </label>
          <label className="block mt-4">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <div className="mt-1 flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-gray-400">
              <input type={show ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} className="flex-1 py-2.5 text-sm outline-none bg-transparent" placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-gray-400">{show ? <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 20 }} />}</button>
            </div>
          </label>
          <label className="block mt-4">
            <span className="text-sm font-medium text-gray-700">Confirm password</span>
            <input type={show ? "text" : "password"} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400" placeholder="Re-enter password" />
          </label>

          <label className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} style={{ accentColor: BRAND }} />
            I agree to the Terms & Privacy Policy
          </label>

          <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
            {loading ? "Creating…" : "Create account"}
          </button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account? <Link to="/login" className="font-semibold" style={{ color: BRAND }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

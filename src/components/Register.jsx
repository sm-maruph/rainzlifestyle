// src/components/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";

const BRAND = "#E11D48";

const Field = ({ icon: Icon, error, children }) => (
  <div>
    <div className="mt-1 flex items-center rounded-md border border-gray-200 px-3 focus-within:border-gray-400">
      <Icon style={{ fontSize: 18, color: "#9ca3af" }} />
      {children}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!/^[0-9+\-\s]{6,}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    if (!agree) e.agree = "Please accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: replace with AuthContext.register(form).then(...)
    setTimeout(() => {
      setLoading(false);
      navigate("/login"); // or auto-login and go to "/"
    }, 800);
  };

  const inputCls = "flex-1 bg-transparent px-2 py-2.5 text-sm outline-none";

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join RAINZLIFESTYLE in a few seconds"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: BRAND }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <Field icon={PersonOutlineIcon} error={errors.name}>
            <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Your name" />
          </Field>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Field icon={MailOutlineIcon} error={errors.email}>
            <input value={form.email} onChange={set("email")} className={inputCls} placeholder="you@example.com" />
          </Field>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <Field icon={PhoneIphoneOutlinedIcon} error={errors.phone}>
            <input value={form.phone} onChange={set("phone")} className={inputCls} placeholder="01XXXXXXXXX" />
          </Field>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Field icon={LockOutlinedIcon} error={errors.password}>
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              className={inputCls}
              placeholder="At least 6 characters"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-gray-400" aria-label="Toggle password">
              {showPw ? <VisibilityOffOutlinedIcon style={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 18 }} />}
            </button>
          </Field>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
          <Field icon={LockOutlinedIcon} error={errors.confirm}>
            <input
              type={showPw ? "text" : "password"}
              value={form.confirm}
              onChange={set("confirm")}
              className={inputCls}
              placeholder="Re-enter password"
            />
          </Field>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" style={{ accentColor: BRAND }} />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="font-medium" style={{ color: BRAND }}>Terms</Link> &{" "}
              <Link to="/privacy" className="font-medium" style={{ color: BRAND }}>Privacy Policy</Link>.
            </span>
          </label>
          {errors.agree && <p className="text-xs text-red-500 mt-1">{errors.agree}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: BRAND }}
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}

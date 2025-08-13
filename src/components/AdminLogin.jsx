import React, { useState } from "react";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function AdminLogin({ onLogin }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!executeRecaptcha) {
      setError("reCAPTCHA not yet loaded. Try again.");
      setLoading(false);
      return;
    }

    try {
      // Get reCAPTCHA v3 token
      const captchaToken = await executeRecaptcha("admin_login");

      const res = await axios.post(`${API_BASE}/admin/login`, {
        username,
        password,
        captchaToken,
      });

      onLogin(res.data.token);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid credentials or CAPTCHA failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono">
      <div
        className="bg-black border border-green-600 rounded-lg shadow-lg p-8 w-full max-w-sm mx-4
                      backdrop-blur-sm bg-opacity-30"
      >
        <div className="flex justify-center mb-6">
          {/* Hacker style terminal icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-8 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-black border border-green-600 rounded text-green-400 placeholder-green-600
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-black border border-green-600 rounded text-green-400 placeholder-green-600
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 transition text-black font-bold py-3 rounded"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
          {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        </form>
      </div>

      {/* Optional flicker animation */}
      <style>{`
        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 22%, 24%, 55% { opacity: 0.5; }
        }
        div > svg {
          animation: flicker 3s infinite;
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;

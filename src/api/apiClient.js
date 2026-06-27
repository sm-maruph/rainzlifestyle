// Thin fetch wrapper around your Express API.
//   REACT_APP_API_BASE_URL=http://localhost:5000/api

import { supabase } from "./supabaseClient";

const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
console.log("🟢 NEW apiClient LOADED");

// Read the access token directly from localStorage (the key supabase-js writes).
// This avoids getSession() returning stale/empty during fast navigations.
function tokenFromStorage() {
  try {
    const k = Object.keys(localStorage).find((k) => /sb-.*-auth-token/.test(k) || k === "rainz.auth" || k.includes("auth-token"));
    if (!k) return null;
    const raw = JSON.parse(localStorage.getItem(k));
    return raw?.access_token || raw?.currentSession?.access_token || raw?.session?.access_token || null;
  } catch {
    return null;
  }
}

async function authHeader() {
  let token = tokenFromStorage();
  // TEMP DEBUG:
  const keys = Object.keys(localStorage);
  console.log("[authHeader] keys:", keys, "| tokenFromStorage?", !!token);
  if (!token) {
    try {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || null;
      console.log("[authHeader] getSession token?", !!token);
    } catch (e) { console.log("[authHeader] getSession error", e); }
  }
  console.log("[authHeader] FINAL sending token?", !!token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (body && body.error) || res.statusText || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.details = body?.details;
    throw err;
  }
  return body;
}

export const api = {
  async get(path, { params } = {}) {
    const url = new URL(BASE + path);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && v !== "" && url.searchParams.set(k, v));
    return handle(await fetch(url, { headers: { ...(await authHeader()) } }));
  },
  async post(path, body) {
    return handle(await fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(body),
    }));
  },
  async put(path, body) {
    return handle(await fetch(BASE + path, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(body),
    }));
  },
  async patch(path, body) {
    return handle(await fetch(BASE + path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(body),
    }));
  },
  async del(path) {
    return handle(await fetch(BASE + path, { method: "DELETE", headers: { ...(await authHeader()) } }));
  },
  async upload(path, formData, method = "POST") {
    return handle(await fetch(BASE + path, { method, headers: { ...(await authHeader()) }, body: formData }));
  },
};
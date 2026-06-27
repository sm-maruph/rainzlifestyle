export function readStoredToken() {
  try {
    const keys = Object.keys(localStorage);
    const k = keys.find((k) => k === "rainz.auth" || /sb-.*-auth-token/.test(k) || k.includes("auth-token"));
    if (!k) return { key: null, token: null };
    const raw = JSON.parse(localStorage.getItem(k));
    // supabase stores either {access_token,...} or {currentSession:{access_token}}
    const token = raw?.access_token || raw?.currentSession?.access_token || raw?.session?.access_token || null;
    return { key: k, token };
  } catch (e) {
    return { key: null, token: null, error: String(e) };
  }
}

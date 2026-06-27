import { api } from "./apiClient";
import { supabase } from "./supabaseClient";

// Register/login go through your API; the returned session is stored by supabase-js
// so apiClient automatically attaches the token on later requests.
export async function register({ full_name, email, password, phone }) {
  const res = await api.post("/auth/register", { full_name, email, password, phone });
  if (res.session) {
    await supabase.auth.setSession(res.session);
    await supabase.auth.getSession(); // ensure it is persisted before we continue
  }
  return res.user;
}
export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  if (res.session) {
    await supabase.auth.setSession(res.session);
    await supabase.auth.getSession(); // ensure it is persisted before we continue
  }
  return res.user;
}
export async function logout() {
  await supabase.auth.signOut();
}
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) return null;
  return api.get("/auth/me"); // profile row (includes role)
}
export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_e, session) => cb(session?.user || null));
}
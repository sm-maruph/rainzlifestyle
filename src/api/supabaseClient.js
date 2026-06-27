// Browser Supabase client — ANON key only (safe to expose). Handles auth session.
//   REACT_APP_SUPABASE_URL=...
//   REACT_APP_SUPABASE_ANON_KEY=...
import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("[supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "rainz.auth",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
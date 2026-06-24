// Browser Supabase client — ANON key only (safe to expose). Handles auth session.
// Put these in your frontend .env:
//   REACT_APP_SUPABASE_URL=...
//   REACT_APP_SUPABASE_ANON_KEY=...
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

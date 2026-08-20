import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Browser-safe Supabase client.
 * Import this wherever you need database access from Client Components.
 *
 * Example:
 *   import { supabase } from "@/utils/supabase/client";
 *   const { data } = await supabase.from("items").select("*");
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

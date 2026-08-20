import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 * Safe to use in Server Components and Server Actions — never shipped to the browser.
 * Uses the service-role key when available (mutations bypass RLS), otherwise falls
 * back to the anon key so read-only pages keep working without extra env vars.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase URL or key is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  return createClient(url, key);
}

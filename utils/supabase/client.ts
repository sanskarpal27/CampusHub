import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-safe Supabase client for Client Components.
 * Uses @supabase/ssr so it shares the same cookie-based session as the server.
 * Call this inside a component or hook — do not call at module load time.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

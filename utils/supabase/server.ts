import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cookie-aware Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses @supabase/ssr so Supabase Auth sessions are stored in and read from HTTP cookies —
 * this is required for getUser() to work on the server side.
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll() is called from Server Components where cookies() is read-only.
            // The middleware will handle session refreshes in that case.
          }
        },
      },
    }
  )
}

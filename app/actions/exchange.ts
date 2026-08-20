'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/utils/supabase/server'

export type ActionState = {
  error?: string
  success?: boolean
}

/**
 * Server Action — inserts a new item listing into the `items` table.
 *
 * Security notes (per Next.js docs):
 *  - We treat every field as untrusted input.
 *  - We validate required fields server-side.
 *  - seller_id is not accepted from the client; it's derived from the auth
 *    session (or left null for the demo since auth isn't wired up yet).
 */
export async function createListing(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ── 1. Extract & sanitise fields ──────────────────────────────────────────
  const title = (formData.get('title') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim()
  const priceRaw = formData.get('price') as string | null
  const category = (formData.get('category') as string | null)?.trim()
  const condition = (formData.get('condition') as string | null)?.trim()
  const location = (formData.get('location') as string | null)?.trim()
  const sellerName = (formData.get('seller_name') as string | null)?.trim()

  // ── 2. Server-side validation ─────────────────────────────────────────────
  if (!title || !category || !condition) {
    return { error: 'Title, category, and condition are required.' }
  }

  const price = priceRaw ? parseFloat(priceRaw) : null
  if (priceRaw && isNaN(price!)) {
    return { error: 'Price must be a valid number.' }
  }

  const ALLOWED_CATEGORIES = [
    'Books & Textbooks',
    'Electronics',
    'Furniture',
    'Clothing',
    'Sports & Fitness',
    'Stationery',
    'Other',
  ]
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return { error: 'Invalid category.' }
  }

  const ALLOWED_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']
  if (!ALLOWED_CONDITIONS.includes(condition)) {
    return { error: 'Invalid condition.' }
  }

  // ── 3. Insert into Supabase ───────────────────────────────────────────────
  const supabase = createServerClient()

  const { error: dbError } = await supabase.from('items').insert({
    title,
    description: description || null,
    price,
    category,
    condition,
    location: location || null,
    seller_name: sellerName || 'Anonymous',
    status: 'available',
  })

  if (dbError) {
    console.error('[createListing] Supabase error:', dbError)
    // Don't leak raw DB errors to the client
    return { error: 'Failed to create listing. Please try again.' }
  }

  // ── 4. Revalidate & redirect ──────────────────────────────────────────────
  revalidatePath('/exchange')
  redirect('/exchange')
}

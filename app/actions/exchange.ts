'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/utils/supabase/server'

export type ActionState = {
  error?: string
  success?: boolean
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

const ALLOWED_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

/**
 * Server Action — inserts a new item listing into the `items` table.
 *
 * Security:
 *  - seller_id is ALWAYS derived from the authenticated Supabase session.
 *    It is never accepted from the client — even if someone spoofs the form.
 *  - image_url is accepted as a plain public URL string (already uploaded
 *    to Supabase Storage by the client) and stored in the image_urls array.
 *  - category and condition are validated against strict allowlists.
 */
export async function createListing(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ── 1. Extract & sanitise ─────────────────────────────────────────────────
  const title       = (formData.get('title')       as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim()
  const priceRaw    =  formData.get('price')       as string | null
  const category    = (formData.get('category')    as string | null)?.trim()
  const condition   = (formData.get('condition')   as string | null)?.trim()
  const location    = (formData.get('location')    as string | null)?.trim()
  const sellerName  = (formData.get('seller_name') as string | null)?.trim()
  // Public URL already stored in Storage — passed as a hidden field by the client
  const imageUrl    = (formData.get('image_url')   as string | null)?.trim()

  // ── 2. Validation ─────────────────────────────────────────────────────────
  if (!title || !category || !condition) {
    return { error: 'Title, category, and condition are required.' }
  }

  const price = priceRaw ? parseFloat(priceRaw) : null
  if (priceRaw && isNaN(price!)) {
    return { error: 'Price must be a valid number.' }
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return { error: 'Invalid category.' }
  }

  if (!ALLOWED_CONDITIONS.includes(condition)) {
    return { error: 'Invalid condition.' }
  }

  // Validate the image URL if provided — must be a URL, not a script injection
  if (imageUrl) {
    try {
      const parsed = new URL(imageUrl)
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        return { error: 'Invalid image URL.' }
      }
    } catch {
      return { error: 'Invalid image URL.' }
    }
  }

  // ── 3. Resolve authenticated user (server-side only) ──────────────────────
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 4. Insert into Supabase ───────────────────────────────────────────────
  const { error: dbError } = await supabase.from('items').insert({
    title,
    description:  description  || null,
    price,
    category,
    condition,
    location:     location     || null,
    seller_id:    user?.id     ?? null,   // ← always from session, never client
    seller_name:  sellerName   || user?.email?.split('@')[0] || 'Anonymous',
    seller_email: user?.email  ?? null,
    status:       'available',
    // Store in the image_urls array; use empty array if no image
    image_urls:   imageUrl ? [imageUrl] : [],
  })

  if (dbError) {
    console.error('[createListing] Supabase error:', dbError)
    return { error: 'Failed to create listing. Please try again.' }
  }

  // ── 5. Revalidate & redirect ──────────────────────────────────────────────
  revalidatePath('/exchange')
  redirect('/exchange')
}

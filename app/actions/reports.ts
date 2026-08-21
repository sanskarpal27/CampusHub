'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/utils/supabase/server'

export type ReportActionState = {
  error?: string
  success?: boolean
}

const ALLOWED_TYPES = ['lost', 'found'] as const
const ALLOWED_CATEGORIES = [
  'Electronics',
  'Keys',
  'ID Card',
  'Bag',
  'Water Bottle',
  'Clothing',
  'Books',
  'Wallet',
  'Jewellery',
  'Sports Equipment',
  'Other',
]

/**
 * Server Action — creates a new Lost & Found report.
 *
 * Signature is `(prevState, formData)` for compatibility with React's
 * `useActionState` hook as documented in Next.js 16.
 */
export async function createReport(
  _prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  // ── 1. Auth check ─────────────────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to file a report.' }
  }

  // ── 2. Extract & sanitise ─────────────────────────────────────────────────
  const type = (formData.get('type') as string | null)?.trim()
  const title = (formData.get('title') as string | null)?.trim()
  const category = (formData.get('category') as string | null)?.trim()
  const location = (formData.get('location') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim()
  // Accept both field name variants for flexibility
  const dateRaw = (formData.get('date_last_seen') || formData.get('date_occurred')) as string | null
  const reporterName = (formData.get('reporter_name') as string | null)?.trim()
  const contactInfo = (formData.get('contact_info') as string | null)?.trim()

  // ── 3. Server-side validation ─────────────────────────────────────────────
  if (!type || !ALLOWED_TYPES.includes(type as 'lost' | 'found')) {
    return { error: 'Report type must be "lost" or "found".' }
  }
  if (!title) return { error: 'Item title is required.' }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return { error: 'Please select a valid category.' }
  }

  const dateOccurred = dateRaw ? new Date(dateRaw) : null
  if (dateRaw && isNaN(dateOccurred!.getTime())) {
    return { error: 'Date is not valid.' }
  }

  // ── 4. Insert into Supabase ───────────────────────────────────────────────
  const { error: dbError } = await supabase.from('reports').insert({
    reporter_id: user.id,
    type,
    title,
    category,
    location: location || null,
    description: description || null,
    date_occurred: dateOccurred ? dateOccurred.toISOString().split('T')[0] : null,
    reporter_name: reporterName || null,
    contact_info: contactInfo || null,
    status: 'open',
  })

  if (dbError) {
    console.error('[createReport] Supabase error:', dbError)
    return { error: dbError.message }
  }

  // ── 5. Revalidate feed & redirect ─────────────────────────────────────────
  revalidatePath('/lost-found')
  redirect('/lost-found')
}


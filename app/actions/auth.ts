'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'

// ── Allowed email domains ──────────────────────────────────────────────────────
const ALLOWED_DOMAINS = ['student.jssaten.ac.in', 'jssaten.ac.in']

export type AuthActionState = {
  error?: string
  message?: string
}

/**
 * Sign in an existing user with email + password.
 * On success, Supabase sets the session cookie and we redirect to /
 * (or the `next` query param if the user was redirected from a protected route).
 */
export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null
  const next = (formData.get('next') as string | null) ?? '/'

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Don't leak whether the account exists — use a generic message
    return { error: 'Invalid email or password. Please try again.' }
  }

  // Check if profile exists
  let hasProfile = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profile) {
      hasProfile = true
    }
  }

  if (user && !hasProfile) {
    redirect('/onboarding')
  }

  redirect(next)
}

/**
 * Register a new JSS student account.
 */
export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null
  const confirmPassword = formData.get('confirm_password') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (confirmPassword !== null && confirmPassword !== password) {
    return { error: 'Passwords do not match.' }
  }

  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) {
    return { error: 'Please enter a valid email address.' }
  }

  const domain = email.slice(atIndex + 1)

  if (!ALLOWED_DOMAINS.includes(domain)) {
    return {
      error: 'Only verified JSS student emails are allowed.',
    }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with this email already exists. Try signing in.' }
    }
    return { error: error.message }
  }

  redirect('/onboarding')
}

/**
 * Sign the current user out and redirect to /login.
 */
export async function signOut(): Promise<never> {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

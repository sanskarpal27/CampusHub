'use client'

import { useActionState, useState } from 'react'
import { use } from 'react'
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { signIn, signUp, type AuthActionState } from '@/app/actions/auth'

// ── Shared field style ────────────────────────────────────────────────────────
const inputBase =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50'

function PasswordInput({
  name,
  id,
  placeholder,
  disabled,
}: {
  name: string
  id: string
  placeholder?: string
  disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder ?? 'Password'}
        required
        minLength={8}
        disabled={disabled}
        className={`${inputBase} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>
}) {
  const sp = use(searchParams)
  const [mode, setMode] = useState<'login' | 'signup'>(
    sp.mode === 'signup' ? 'signup' : 'login'
  )

  const [loginState, loginAction, loginPending] = useActionState<
    AuthActionState,
    FormData
  >(signIn, {})

  const [signupState, signupAction, signupPending] = useActionState<
    AuthActionState,
    FormData
  >(signUp, {})

  const isPending = loginPending || signupPending
  const state = mode === 'login' ? loginState : signupState
  const action = mode === 'login' ? loginAction : signupAction

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* ── Brand header ── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === 'login' ? 'Welcome back' : 'Join CampusHub'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login'
              ? 'Sign in to your CampusHub account'
              : 'Use your JSS email to create an account'}
          </p>
        </div>

        {/* ── Card ── */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
          {/* Mode toggle tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 p-1.5">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          <div className="p-8">
            {/* Success banner */}
            {state.message && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {state.message}
              </div>
            )}

            {/* Error banner */}
            {state.error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              {/* Pass the `next` redirect through the form */}
              {sp.next && (
                <input type="hidden" name="next" value={sp.next} />
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  JSS Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={isPending}
                    placeholder={
                      mode === 'signup'
                        ? 'you@student.jssaten.ac.in'
                        : 'your@jssaten.ac.in'
                    }
                    className={`${inputBase} pl-10`}
                  />
                </div>
                {mode === 'signup' && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="h-3 w-3" />
                    Only @student.jssaten.ac.in and @jssaten.ac.in addresses accepted
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <a
                      href="/forgot-password"
                      className="text-[11px] font-medium text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <PasswordInput
                  id="auth-password"
                  name="password"
                  placeholder={
                    mode === 'signup' ? 'Min. 8 characters' : 'Your password'
                  }
                  disabled={isPending}
                />
              </div>

              {/* Confirm password (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-confirm"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Confirm Password
                  </label>
                  <PasswordInput
                    id="auth-confirm"
                    name="confirm_password"
                    placeholder="Repeat your password"
                    disabled={isPending}
                  />
                </div>
              )}

              {/* Submit */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-200 ring-2 ring-indigo-100 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Toggle link below card ── */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>
              New to CampusHub?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Create an account →
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Sign in →
              </button>
            </>
          )}
        </p>

        {/* Trust indicators */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> End-to-end secure
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" /> JSS students only
          </span>
        </div>
      </div>
    </div>
  )
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  Search as SearchIcon,
  UserCircle,
  MapPin,
  LogIn,
} from "lucide-react";
import { NotificationsPanel } from "@/components/notifications-panel";
import { signOut } from "@/app/actions/auth";
import type { User } from "@supabase/supabase-js";

// Nav links — same for all users
const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/exchange", label: "Exchange", icon: ArrowLeftRight },
  { href: "/lost-found", label: "Lost & Found", icon: MapPin },
];

// ── Avatar / Sign-in cluster ───────────────────────────────────────────────────
function AuthCluster({ user }: { user: User | null }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    );
  }

  // Derive initials and email label from the Supabase user object
  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {/* Notifications — only shown when authenticated */}
      <NotificationsPanel user={user} />

      {/* Avatar dropdown trigger → profile page */}
      <Link
        href="/profile"
        title={email}
        className="group flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition">
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate lg:block text-slate-700">
          {email.split("@")[0]}
        </span>
      </Link>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          title="Sign out"
          className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

// ── Top nav ────────────────────────────────────────────────────────────────────
export function TopNav({ user }: { user: User | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-indigo-600 hover:opacity-80 transition-opacity"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        {/* ── Search bar ── */}
        <div className="relative mx-auto hidden w-full max-w-sm sm:flex">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search"
            type="search"
            placeholder="Search items, reports…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* ── Desktop nav links ── */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Auth cluster (right edge) ── */}
        <div className="ml-auto">
          <AuthCluster user={user} />
        </div>
      </div>

      {/* ── Mobile bottom-bar links ── */}
      <nav className="flex items-center justify-around border-t border-slate-100 bg-white px-2 py-1 lg:hidden">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : ""}`} />
              {label}
            </Link>
          );
        })}
        {/* Mobile auth icon */}
        {user ? (
          <Link
            href="/profile"
            aria-label="Profile"
            className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium text-slate-500"
          >
            <UserCircle className="h-5 w-5" />
            Profile
          </Link>
        ) : (
          <Link
            href="/login"
            aria-label="Sign In"
            className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium text-indigo-600"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}

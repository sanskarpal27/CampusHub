"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  Search as SearchIcon,
  UserCircle,
  MapPin,
} from "lucide-react";
import { NotificationsPanel } from "@/components/notifications-panel";

// Nav links – Notifications is intentionally omitted; it's handled by the
// NotificationsPanel dropdown mounted directly in the header.
const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/exchange", label: "Exchange", icon: ArrowLeftRight },
  { href: "/lost-found", label: "Lost & Found", icon: MapPin },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function TopNav() {
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
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
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

          {/* Notifications dropdown */}
          <NotificationsPanel />
        </nav>

        {/* ── Mobile: icon-only nav + notifications ── */}
        <nav className="ml-auto flex items-center gap-1 lg:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
          {/* Notifications dropdown on mobile too */}
          <NotificationsPanel />
        </nav>
      </div>
    </header>
  );
}

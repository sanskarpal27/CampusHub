"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Bell,
  X,
  CheckCheck,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type NotifType = "message" | "match" | "claim" | "handoff";

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
  timeAgo: string;
  read: boolean;
};

// ── Placeholder data ────────────────────────────────────────────────────────
const INITIAL_NOTIFS: Notification[] = [
  {
    id: "n1",
    type: "message",
    title: "New message on your listing",
    body: "Priya M. asked: \"Is the HP laptop still available? Can I see it today?\"",
    href: "/exchange",
    timeAgo: "5m ago",
    read: false,
  },
  {
    id: "n2",
    type: "match",
    title: "Lost & Found match found!",
    body: "AI found a possible match for your Black Leather Wallet — 89% confidence at Engineering Block.",
    href: "/lost-found/seed-6",
    timeAgo: "32m ago",
    read: false,
  },
  {
    id: "n3",
    type: "claim",
    title: "Claim accepted",
    body: "Your claim for the Silver Keys with Anchor Keychain has been accepted by Ananya B.",
    href: "/lost-found/seed-4",
    timeAgo: "2h ago",
    read: false,
  },
  {
    id: "n4",
    type: "handoff",
    title: "Handoff scheduled",
    body: "Meet Rohan S. tomorrow at 12:30 PM near the Student Union to collect the Mechanical Keyboard.",
    href: "/exchange",
    timeAgo: "Yesterday",
    read: true,
  },
];

// ── Icon + colours per type ───────────────────────────────────────────────────
const TYPE_META: Record<
  NotifType,
  { icon: React.ElementType; bg: string; text: string }
> = {
  message: {
    icon: MessageSquare,
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
  match: {
    icon: Sparkles,
    bg: "bg-violet-100",
    text: "text-violet-600",
  },
  claim: {
    icon: CheckCircle2,
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },
  handoff: {
    icon: CalendarCheck,
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
};

// ── Panel component ────────────────────────────────────────────────────────────
export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div ref={panelRef} className="relative">
      {/* ── Bell trigger ── */}
      <button
        id="notifications-bell"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          open
            ? "bg-indigo-50 text-indigo-600"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slateigo-600 text-slate-700" />
              <span className="text-sm font-bold text-slate-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <ul className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {notifs.map((notif) => {
              const meta = TYPE_META[notif.type];
              const Icon = meta.icon;
              return (
                <li key={notif.id}>
                  <Link
                    href={notif.href}
                    onClick={() => {
                      markRead(notif.id);
                      setOpen(false);
                    }}
                    className={`flex gap-3 px-4 py-3.5 transition hover:bg-slate-50 ${
                      !notif.read ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {/* Icon bubble */}
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${meta.text}`} />
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs font-semibold leading-snug ${
                            notif.read ? "text-slate-700" : "text-slate-900"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {notif.body}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

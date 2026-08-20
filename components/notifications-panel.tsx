"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Bell, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { formatDistanceToNow } from "date-fns";

export function NotificationsPanel({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch unread messages
  useEffect(() => {
    async function fetchUnread() {
      if (!user) return;
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          item_id,
          items ( title )
        `)
        .eq("receiver_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        setUnreadMessages(data);
      }
    }
    
    fetchUnread();
    
    // Optional: Real-time subscription could go here
  }, [user, supabase]);

  const unreadCount = unreadMessages.length;

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
              <Bell className="h-4 w-4 text-slate-700" />
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
            {unreadMessages.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                You have no unread messages.
              </li>
            ) : (
              unreadMessages.map((msg) => {
                const itemTitle = msg.items?.title || "an item";
                return (
                  <li key={msg.id}>
                    <Link
                      href="/inbox"
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-4 py-3.5 transition hover:bg-slate-50 bg-indigo-50/40"
                    >
                      {/* Icon bubble */}
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold leading-snug text-slate-900">
                            New message regarding {itemTitle}
                          </p>
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {msg.content}
                        </p>
                      </div>

                      {/* Unread dot */}
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    </Link>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-center">
            <Link
              href="/inbox"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Go to Inbox →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

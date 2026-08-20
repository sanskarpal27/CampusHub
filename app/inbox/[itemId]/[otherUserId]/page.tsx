import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerClient } from "@/utils/supabase/server"
import { formatDistanceToNow, format } from "date-fns"
import { ChevronLeft, Package, User } from "lucide-react"
import { ChatReplyInput } from "@/components/chat-reply-input"

export default async function ConversationPage(props: { params: Promise<{ itemId: string; otherUserId: string }> }) {
  const params = await props.params;
  const { itemId, otherUserId } = params
  
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/inbox/${itemId}/${otherUserId}`)
  }

  // 1. Fetch Item Details
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("title, price, image_urls, status")
    .eq("id", itemId)
    .single()

  if (itemError || !item) {
    notFound()
  }

  // 2. Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("item_id", itemId)
    .eq("receiver_id", user.id)
    .eq("sender_id", otherUserId)
    .eq("is_read", false)

  // 3. Fetch Conversation History
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("item_id", itemId)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true })

  // 4. Fetch Other User Details (Using the profiles table or a minimal auth.users join if exposed. Since auth.users is protected, we can derive the name from the messages if they were stored, or just use a generic 'User' fallback if we don't have a public profiles table.)
  // We'll use a generic fallback for now, as CampusHub schema doesn't seem to have a public users table yet besides what's embedded in items/reports.

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col bg-slate-50">
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/inbox"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50 text-indigo-300">
              {item.image_urls?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_urls[0]} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
              <p className="text-xs text-slate-500">
                {item.price ? `₹${item.price.toLocaleString("en-IN")}` : "Free"} · {item.status === 'available' ? 'Available' : 'Reserved/Sold'}
              </p>
            </div>
          </div>
        </div>
        <Link
          href={`/exchange/${itemId}`}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          View Listing
        </Link>
      </div>

      {/* ── Chat Messages Area ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {(!messages || messages.length === 0) ? (
            <div className="mt-20 text-center text-sm text-slate-500">
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user.id
              
              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMine
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-white border border-slate-100 text-slate-900 rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div
                      className={`mt-1 text-[10px] ${
                        isMine ? "text-indigo-200" : "text-slate-400"
                      } text-right`}
                    >
                      {format(new Date(msg.created_at), "h:mm a")}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Bottom Reply Input ── */}
      <ChatReplyInput itemId={itemId} receiverId={otherUserId} />
    </div>
  )
}

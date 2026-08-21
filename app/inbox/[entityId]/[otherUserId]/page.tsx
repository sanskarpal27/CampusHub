import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/utils/supabase/server"
import { format } from "date-fns"
import { ChevronLeft, Package, FileSearch } from "lucide-react"
import { ChatReplyInput } from "@/components/chat-reply-input"

export default async function ConversationPage(props: {
  params: Promise<{ entityId: string; otherUserId: string }>
}) {
  // ── 1. Await params (Next.js 15) ───────────────────────────────────────────
  const { entityId, otherUserId } = await props.params

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/inbox/${entityId}/${otherUserId}`)
  }

  // ── 2. Detect entity type: item first, then report ─────────────────────────
  const { data: item } = await supabase
    .from("items")
    .select("id, title, price, image_urls, status")
    .eq("id", entityId)
    .maybeSingle()

  const { data: report } = !item
    ? await supabase
        .from("reports")
        .select("id, title, type, image_urls, status")
        .eq("id", entityId)
        .maybeSingle()
    : { data: null }

  const isReport = !item && !!report
  const entityTitle = item?.title ?? report?.title ?? "Conversation"
  const entityImage = item?.image_urls?.[0] ?? report?.image_urls?.[0] ?? null
  const viewHref = isReport ? `/lost-found/${entityId}` : `/exchange/${entityId}`
  const viewLabel = isReport ? "View Report" : "View Listing"

  // ── 3. Mark unread messages as read ───────────────────────────────────────
  await supabase
    .from("messages")
    .update({ is_read: true })
    .or(`item_id.eq.${entityId},report_id.eq.${entityId}`)
    .eq("receiver_id", user.id)
    .eq("sender_id", otherUserId)
    .eq("is_read", false)

  // ── 4. Fetch conversation history ──────────────────────────────────────────
  // Find all messages linked to this entityId (via either column)
  // AND strictly between the two participants
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`item_id.eq.${entityId},report_id.eq.${entityId}`)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })

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
              {entityImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entityImage}
                  alt={entityTitle}
                  className="h-full w-full object-cover"
                />
              ) : isReport ? (
                <FileSearch className="h-5 w-5" />
              ) : (
                <Package className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{entityTitle}</h2>
              <p className="text-xs text-slate-500">
                {isReport
                  ? `L&F · ${report?.status === "open" ? "Open" : "Resolved"}`
                  : item?.price
                  ? `₹${item.price.toLocaleString("en-IN")} · ${
                      item.status === "available" ? "Available" : "Sold"
                    }`
                  : "Free"}
              </p>
            </div>
          </div>
        </div>
        <Link
          href={viewHref}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          {viewLabel}
        </Link>
      </div>

      {/* ── Chat Messages Area ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {!messages || messages.length === 0 ? (
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
                    className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[70%] ${
                      isMine
                        ? "rounded-tr-sm bg-indigo-600 text-white"
                        : "rounded-tl-sm border border-slate-100 bg-white text-slate-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div
                      className={`mt-1 text-right text-[10px] ${
                        isMine ? "text-indigo-200" : "text-slate-400"
                      }`}
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
      {/* Pass the correct ID column based on entity type */}
      <ChatReplyInput
        itemId={isReport ? undefined : entityId}
        reportId={isReport ? entityId : undefined}
        receiverId={otherUserId}
      />
    </div>
  )
}

import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Package, FileSearch } from "lucide-react";
import Link from "next/link";

export default async function InboxPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/inbox");
  }

  // ── 1. Fetch all messages the user is involved in ─────────────────────────
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, receiver_id, is_read, item_id, report_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inbox messages:", error);
  }

  const allMessages = messages || [];

  // ── 2. Group by entityId (item_id takes priority over report_id) ──────────
  type GroupEntry = {
    entityId: string;
    isReport: boolean;
    entityTitle: string | null;
    entityImage: string | null;
    messages: typeof allMessages;
  };

  const groupMap = new Map<string, GroupEntry>();

  for (const msg of allMessages) {
    const entityId: string | null = msg.item_id ?? msg.report_id ?? null;
    if (!entityId) continue; // skip orphaned messages (should never happen)

    if (!groupMap.has(entityId)) {
      groupMap.set(entityId, {
        entityId,
        isReport: !msg.item_id && !!msg.report_id,
        entityTitle: null,
        entityImage: null,
        messages: [],
      });
    }
    groupMap.get(entityId)!.messages.push(msg);
  }

  // ── 3. Batch-fetch entity details ─────────────────────────────────────────
  const itemIds = [...groupMap.values()]
    .filter((g) => !g.isReport)
    .map((g) => g.entityId);

  const reportIds = [...groupMap.values()]
    .filter((g) => g.isReport)
    .map((g) => g.entityId);

  const [itemsResult, reportsResult] = await Promise.all([
    itemIds.length > 0
      ? supabase.from("items").select("id, title, image_urls").in("id", itemIds)
      : Promise.resolve({ data: [] as any[] }),
    reportIds.length > 0
      ? supabase.from("reports").select("id, title, image_urls").in("id", reportIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  // Map entity details back into groups
  for (const item of itemsResult.data ?? []) {
    const group = groupMap.get(item.id);
    if (group) {
      group.entityTitle = item.title;
      group.entityImage = item.image_urls?.[0] ?? null;
    }
  }
  for (const report of reportsResult.data ?? []) {
    const group = groupMap.get(report.id);
    if (group) {
      group.entityTitle = report.title;
      group.entityImage = report.image_urls?.[0] ?? null;
    }
  }

  const groups = [...groupMap.values()];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">Inbox</h1>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <MessageSquare className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-lg font-semibold text-slate-700">Your inbox is empty</p>
            <p className="text-sm text-slate-500">
              When you message sellers or reporters, they will appear here.
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Link
              href="/exchange"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Browse Exchange
            </Link>
            <Link
              href="/lost-found"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Lost &amp; Found
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const latestMessage = group.messages[0]; // ordered desc, so index 0 is newest
            const isUnread =
              latestMessage.receiver_id === user.id && !latestMessage.is_read;
            const otherUserId =
              latestMessage.sender_id === user.id
                ? latestMessage.receiver_id
                : latestMessage.sender_id;

            return (
              <div
                key={group.entityId}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {group.entityImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={group.entityImage}
                      alt={group.entityTitle ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : group.isReport ? (
                    <FileSearch className="h-8 w-8 text-slate-400" />
                  ) : (
                    <Package className="h-8 w-8 text-slate-400" />
                  )}
                  {isUnread && (
                    <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-bold text-slate-900">
                      {group.entityTitle ?? "Unknown Item"}
                    </h3>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(latestMessage.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {group.isReport && (
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                      <FileSearch className="h-3 w-3" />
                      Lost &amp; Found
                    </span>
                  )}

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      {latestMessage.sender_id === user.id ? "You said:" : "They said:"}
                    </p>
                    <p
                      className={`text-sm ${
                        isUnread ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {latestMessage.content}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Link
                      href={`/inbox/${group.entityId}/${otherUserId}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      View Conversation →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

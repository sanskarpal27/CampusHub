import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Package } from "lucide-react";
import Link from "next/link";

export default async function InboxPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/inbox");
  }

  // Fetch all messages where user is either sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      sender_id,
      receiver_id,
      is_read,
      item_id,
      items ( title, image_urls )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inbox messages:", error);
  }

  console.log("Inbox Messages Fetched:", messages);

  // Group messages by item_id (a basic way to show conversation threads per item)
  const groupedMessages = (messages || []).reduce((acc: any, msg: any) => {
    if (!acc[msg.item_id]) {
      acc[msg.item_id] = {
        item: msg.items,
        messages: [],
      };
    }
    acc[msg.item_id].messages.push(msg);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
        Inbox
      </h1>

      {Object.keys(groupedMessages).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <MessageSquare className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-lg font-semibold text-slate-700">Your inbox is empty</p>
            <p className="text-sm text-slate-500">
              When you message sellers or receive messages, they will appear here.
            </p>
          </div>
          <Link
            href="/exchange"
            className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Browse Exchange
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([itemId, group]: [string, any]) => {
            const latestMessage = group.messages[0]; // because it's ordered by created_at desc
            const isUnread = latestMessage.receiver_id === user.id && !latestMessage.is_read;
            const itemImage = group.item?.image_urls?.[0];
            const otherUserId = latestMessage.sender_id === user.id ? latestMessage.receiver_id : latestMessage.sender_id;

            return (
              <div
                key={itemId}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {itemImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={itemImage} alt={group.item?.title} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-slate-400" />
                  )}
                  {isUnread && (
                    <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="truncate text-base font-bold text-slate-900">
                      {group.item?.title || "Unknown Item"}
                    </h3>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(latestMessage.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      {latestMessage.sender_id === user.id ? "You said:" : "They said:"}
                    </p>
                    <p className={`text-sm ${isUnread ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                      {latestMessage.content}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Link
                      href={`/inbox/${itemId}/${otherUserId}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      View Conversation & Item →
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

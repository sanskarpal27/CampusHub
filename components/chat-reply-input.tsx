"use client"

import { useRef, useTransition } from "react"
import { Send, Loader2 } from "lucide-react"
import { sendMessage } from "@/app/actions/messages"
import { toast } from "sonner"

export function ChatReplyInput({ itemId, receiverId }: { itemId: string; receiverId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    const content = formData.get("content")?.toString().trim()
    if (!content) return

    startTransition(async () => {
      const result = await sendMessage(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
      <form ref={formRef} action={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-3">
        <input type="hidden" name="item_id" value={itemId} />
        <input type="hidden" name="receiver_id" value={receiverId} />
        
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <textarea
            name="content"
            placeholder="Type your message..."
            required
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                formRef.current?.requestSubmit()
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Send message</span>
        </button>
      </form>
    </div>
  )
}

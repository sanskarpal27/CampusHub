"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2 } from "lucide-react"
import { sendMessage } from "@/app/actions/messages"
import { toast } from "sonner"

export function IFoundThisButton({
  reportId,
  reporterId,
  isLost,
}: {
  reportId: string
  reporterId: string
  isLost: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("report_id", reportId)
      formData.set("receiver_id", reporterId)
      formData.set(
        "content",
        "Hey! I think I found your item. Let me know when you want to meet up."
      )

      const result = await sendMessage(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Message sent! Check your inbox.")
        router.push("/inbox")
      }
    })
  }

  return (
    <button
      id="i-found-this-btn"
      onClick={handleClick}
      disabled={isPending}
      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 ${
        isLost ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-500 hover:bg-rose-600"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      {isLost ? "I Found This" : "I Lost This — Claim"}
    </button>
  )
}

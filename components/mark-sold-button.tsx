"use client"

import { useTransition } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { markItemSold } from "@/app/actions/status"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function MarkSoldButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const result = await markItemSold(itemId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Listing marked as sold!")
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200 transition hover:bg-emerald-50 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CheckCircle2 className="h-3 w-3" />
      )}
      Mark Sold
    </button>
  )
}

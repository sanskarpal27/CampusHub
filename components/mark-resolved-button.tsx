"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { markReportResolved } from "@/app/actions/status"
import { toast } from "sonner"

export function MarkResolvedButton({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const result = await markReportResolved(reportId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Report marked as resolved!")
        router.refresh()
      }
    })
  }

  return (
    <button
      id="mark-resolved-btn"
      onClick={handleClick}
      disabled={isPending}
      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Mark as Found / Resolved
    </button>
  )
}

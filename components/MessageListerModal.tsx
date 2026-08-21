"use client"

import { useState, useTransition } from "react"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { sendMessage } from "@/app/actions/messages"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function MessageListerModal({
  reportId,
  reporterId,
  reporterName,
  isOwnReport,
}: {
  reportId: string
  reporterId: string
  reporterName: string
  isOwnReport: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendMessage(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Message sent! Check your inbox.")
        setOpen(false)
      }
    })
  }

  if (isOwnReport) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            id="message-lister-btn"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <MessageSquare className="h-4 w-4 text-slate-500" />
            Message Lister
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message {reporterName}</DialogTitle>
          <DialogDescription>
            Send a direct message about this report. They will receive it in their inbox.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="report_id" value={reportId} />
          <input type="hidden" name="receiver_id" value={reporterId} />

          <div className="grid gap-2">
            <Label htmlFor="report-message-content" className="sr-only">
              Message
            </Label>
            <Textarea
              id="report-message-content"
              name="content"
              placeholder="Hi, I think I may have found your item..."
              className="min-h-[120px] resize-none"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

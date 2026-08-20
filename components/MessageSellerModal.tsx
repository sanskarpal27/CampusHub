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

export function MessageSellerModal({
  itemId,
  sellerId,
  sellerName,
  isOwnItem,
}: {
  itemId: string
  sellerId: string
  sellerName: string
  isOwnItem: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendMessage(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Message sent successfully!")
        setOpen(false)
      }
    })
  }

  if (isOwnItem) {
    return (
      <Button disabled variant="secondary" className="w-full sm:w-auto">
        <MessageSquare className="mr-2 h-4 w-4" />
        This is your listing
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white" />}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Message Seller
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message {sellerName}</DialogTitle>
          <DialogDescription>
            Send a direct message to the seller about this item. They will receive it in their inbox.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="item_id" value={itemId} />
          <input type="hidden" name="receiver_id" value={sellerId} />
          
          <div className="grid gap-2">
            <Label htmlFor="content" className="sr-only">
              Message
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Hi, is this still available?"
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

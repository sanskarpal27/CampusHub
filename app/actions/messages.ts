"use server"

import { createServerClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData: FormData) {
  const content = formData.get("content")?.toString().trim()
  const itemId = formData.get("item_id")?.toString() || null
  const reportId = formData.get("report_id")?.toString() || null
  const receiverId = formData.get("receiver_id")?.toString()

  if (!content || !receiverId) {
    return { error: "Missing required fields." }
  }

  if (!itemId && !reportId) {
    return { error: "A message must be linked to an item or a report." }
  }

  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to send a message." }
  }

  if (user.id === receiverId) {
    return { error: "You cannot message yourself." }
  }

  const { error: insertError } = await supabase
    .from("messages")
    .insert({
      item_id: itemId,
      report_id: reportId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    })

  if (insertError) {
    console.error("Insert Message Error:", insertError)
    return { error: insertError.message }
  }

  revalidatePath("/inbox", "layout")
  return { success: true }
}

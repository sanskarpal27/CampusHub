"use server"

import { createServerClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData: FormData) {
  const content = formData.get("content")?.toString().trim()
  const itemId = formData.get("item_id")?.toString()
  const receiverId = formData.get("receiver_id")?.toString()

  if (!content || !itemId || !receiverId) {
    return { error: "Missing required fields." }
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
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    })

  if (insertError) {
    console.error("Insert Message Error:", insertError)
    return { error: "Failed to send message. Please try again." }
  }

  revalidatePath("/inbox", "layout")
  return { success: true }
}

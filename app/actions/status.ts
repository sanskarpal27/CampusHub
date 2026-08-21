"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/utils/supabase/server"

/**
 * Mark an item as sold. Only the seller can do this.
 */
export async function markItemSold(itemId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("items")
    .update({ status: "sold" })
    .eq("id", itemId)
    .eq("seller_id", user.id) // RLS double-check: only the seller

  if (error) {
    console.error("[markItemSold] error:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  revalidatePath("/exchange")
  revalidatePath("/")
  return {}
}

/**
 * Mark a Lost & Found report as resolved. Only the reporter can do this.
 */
export async function markReportResolved(reportId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId)
    .eq("reporter_id", user.id) // RLS double-check: only the reporter

  if (error) {
    console.error("[markReportResolved] error:", error)
    return { error: error.message }
  }

  revalidatePath(`/lost-found/${reportId}`)
  revalidatePath("/lost-found")
  revalidatePath("/")
  return {}
}

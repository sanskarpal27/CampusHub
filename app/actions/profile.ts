"use server"

import { createServerClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export type ProfileActionState = {
  error?: string
}

export async function saveProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const fullName = formData.get("full_name")?.toString().trim()
  const address = formData.get("address")?.toString().trim()
  const course = formData.get("course")?.toString()
  const batchYear = formData.get("batch_year")?.toString()

  if (!fullName || !address || !course || !batchYear) {
    return { error: "All fields are required." }
  }

  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to complete your profile." }
  }

  const { error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      address,
      course,
      batch: batchYear,
    })

  if (insertError) {
    console.error("Save Profile Error:", insertError)
    return { error: `Database Error: ${insertError.message}` }
  }

  redirect("/")
}

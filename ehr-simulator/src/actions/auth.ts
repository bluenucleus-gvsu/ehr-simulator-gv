"use server"

import { createServerSupabase } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signOut() {
  const supabase = await createServerSupabase()
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } finally {
    redirect("/auth/login")
  }
}

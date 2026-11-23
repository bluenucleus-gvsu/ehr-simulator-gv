"use server"

import { createServerSupabase } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { routes } from "@/lib/routes"

export async function signOut() {
  const supabase = await createServerSupabase()
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } finally {
    redirect(routes.auth.login.getHref())
  }
}

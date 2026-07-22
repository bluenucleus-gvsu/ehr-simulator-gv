import "server-only"
import { createClient } from "@supabase/supabase-js"
import {
  createFetchWithTimeout,
  SUPABASE_SERVER_TIMEOUT_MS,
} from "./fetchWithTimeout"

export function createServiceRoleSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        fetch: createFetchWithTimeout(
          SUPABASE_SERVER_TIMEOUT_MS,
          "The Supabase server request timed out.",
        ),
      },
    },
  )
}

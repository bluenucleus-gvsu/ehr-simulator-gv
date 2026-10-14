import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";

/** Service-role client for server-side writes that bypass RLS. */
export function createServiceSupabase(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

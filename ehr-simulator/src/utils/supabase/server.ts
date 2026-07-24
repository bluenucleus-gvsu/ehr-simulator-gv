import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  createFetchWithTimeout,
  SUPABASE_SERVER_TIMEOUT_MS,
} from './fetchWithTimeout';

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        fetch: createFetchWithTimeout(
          SUPABASE_SERVER_TIMEOUT_MS,
          'The Supabase server request timed out.',
        ),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
          }
        },
      },
    }
  );
}

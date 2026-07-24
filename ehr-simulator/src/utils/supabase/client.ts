import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../../database.types';
import {
  createFetchWithTimeout,
  SUPABASE_BROWSER_TIMEOUT_MS,
} from './fetchWithTimeout';

export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        fetch: createFetchWithTimeout(
          SUPABASE_BROWSER_TIMEOUT_MS,
          'The Supabase browser request timed out.',
        ),
      },
    },
  );
}

import { vi } from 'vitest'

export const supabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
    update: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
    eq: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
    single: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
  }),
  auth: {
    getUser: vi.fn<() => Promise<{ data: { user: null }; error: null }>>().mockResolvedValue({ data: { user: null }, error: null }),
    signIn: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null }),
  },
}
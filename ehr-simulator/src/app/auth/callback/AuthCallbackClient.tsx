'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectedFrom') || '/user/profile'

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      // use ANON key for browser client
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('Auth callback page loaded, checking session...')
    const getRoleForUser = async (userId: string, fallbackRole?: string) => {
      try {
        const { data: profile, error } = await supabase.from('users').select('role').eq('id', userId).single()
        if (!error && profile?.role) return profile.role as string
      } catch {
        // ignore errors reading users table (RLS or missing row) and fall back
      }
      return fallbackRole || undefined
    }

    const handleSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const fallbackRole = session.user?.user_metadata?.role as string | undefined
        const role = await getRoleForUser(session.user.id, fallbackRole)
        if (typeof window !== 'undefined' && role) {
          try {
            window.localStorage.setItem('role', role)
          } catch {
            // ignore storage errors
          }
        }

        const destination =
          role === 'admin'
            ? '/admin'
            : role === 'faculty'
            ? `/faculty/${session.user.id}`
            : `/user/profile/${session.user.id}`
        router.replace(destination)
      } else {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, sess) => {
            if (sess) {
              const fallbackRole = sess.user?.user_metadata?.role as string | undefined
              const role = await getRoleForUser(sess.user.id, fallbackRole)
              if (typeof window !== 'undefined' && role) {
                try {
                  window.localStorage.setItem('role', role)
                } catch {}
              }
              const destination =
                role === 'admin'
                  ? '/admin'
                  : role === 'faculty'
                  ? `/faculty/${sess.user.id}`
                  : `/user/profile/${sess.user.id}`
              router.replace(destination)
            }
          })
        return () => {
          authListener.subscription.unsubscribe()
        }
      }
    }
    handleSession()
  }, [router, redirectTo])

  return <p>Signing you in…</p>
}

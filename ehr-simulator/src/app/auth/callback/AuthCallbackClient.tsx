'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { resolveAuthRole } from '@/lib/resolveAuthRole'
import { setTesterModeCookies } from '@/utils/testerMode'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectedFrom') || '/user/profile'
  const loginMode = searchParams.get('loginMode')
  const isTesterLogin = loginMode === 'tester'

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
        const resolvedRole = resolveAuthRole(session.user.email ?? undefined, {
          isTesterLogin,
          dbOrMetadataRole: role,
        })
        if (typeof window !== 'undefined' && resolvedRole) {
          try {
            window.localStorage.setItem('role', resolvedRole)
            setTesterModeCookies(resolvedRole === 'tester')
          } catch {
            // ignore storage errors
          }
        }

        const destination =
          resolvedRole === 'tester'
            ? '/auth/tester-destination'
            : resolvedRole === 'admin'
            ? '/admin'
            : resolvedRole === 'faculty'
            ? `/faculty/${session.user.id}`
            : `/user/profile/${session.user.id}`
        router.replace(destination)
      } else {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, sess) => {
            if (sess) {
              const fallbackRole = sess.user?.user_metadata?.role as string | undefined
              const role = await getRoleForUser(sess.user.id, fallbackRole)
              const resolvedRole = resolveAuthRole(sess.user.email ?? undefined, {
                isTesterLogin,
                dbOrMetadataRole: role,
              })
              if (typeof window !== 'undefined' && resolvedRole) {
                try {
                  window.localStorage.setItem('role', resolvedRole)
                  setTesterModeCookies(resolvedRole === 'tester')
                } catch {}
              }
              const destination =
                resolvedRole === 'tester'
                  ? '/auth/tester-destination'
                  : resolvedRole === 'admin'
                  ? '/admin'
                  : resolvedRole === 'faculty'
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
  }, [router, redirectTo, isTesterLogin])

  return <p>Signing you in…</p>
}

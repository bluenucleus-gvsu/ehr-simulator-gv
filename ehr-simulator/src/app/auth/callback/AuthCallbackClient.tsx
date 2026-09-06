'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'
import { emailIsDevAdminAllowlist } from '@/lib/devAdminEmails'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      // use ANON key for browser client
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let isActive = true
    let redirectScheduled = false
    let redirectTimer: ReturnType<typeof setTimeout> | null = null

    const getRoleForUser = async (userId: string, fallbackRole?: string) => {
      try {
        const { data: profile, error } = await supabase.from('users').select('role').eq('id', userId).single()
        if (!error && profile?.role) return profile.role as string
      } catch {
      }
      return fallbackRole || undefined
    }

    const redirectForSession = async (session: Session) => {
      const fallbackRole = session.user.user_metadata?.role as string | undefined
      const role = await getRoleForUser(session.user.id, fallbackRole)

      if (!isActive) return

      const devBypass = emailIsDevAdminAllowlist(session.user.email ?? undefined)
      const resolvedRole = devBypass ? 'admin' : role

      if (resolvedRole) {
        try {
          window.localStorage.setItem('role', resolvedRole)
        } catch {
        }
      }

      const destination =
        resolvedRole === 'admin'
          ? '/admin'
          : resolvedRole === 'faculty'
            ? `/faculty/${session.user.id}`
            : `/user/profile/${session.user.id}`

      router.replace(destination)
    }

    const scheduleRedirect = (session: Session | null) => {
      if (!session || !isActive || redirectScheduled) return

      redirectScheduled = true
      redirectTimer = setTimeout(() => {
        redirectTimer = null
        void redirectForSession(session)
      }, 0)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      scheduleRedirect(session)
    })

    void supabase.auth.getSession().then(({ data: { session } }) => {
      scheduleRedirect(session)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()

      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [router])

  return <p>Signing you in…</p>
}

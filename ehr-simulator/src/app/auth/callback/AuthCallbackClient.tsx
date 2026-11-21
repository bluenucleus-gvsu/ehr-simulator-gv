'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { emailIsDevAdminAllowlist } from '@/lib/devAdminEmails'
import { getUserRole } from '@/actions/users'
import { createBrowserSupabase } from '@/utils/supabase/client'
import { routes } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [hadError, setHadError] = useState(false)

  useEffect(() => {
    const supabase = createBrowserSupabase()

    let isActive = true
    let redirectScheduled = false
    let redirectTimer: ReturnType<typeof setTimeout> | null = null

    const redirectForSession = async (session: Session) => {
      const devBypass = emailIsDevAdminAllowlist(session.user.email ?? undefined)

      let role: string | null = null
      if (!devBypass) {
        try {
          role = await getUserRole(session.user.id)
        } catch {
          if (isActive) setHadError(true)
          return
        }
      }

      if (!isActive) return

      const resolvedRole = devBypass ? 'admin' : role
      const destination = routes.home.forRole(resolvedRole, session.user.id);

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

  if (hadError) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t verify your account role. Please try signing in again.
          </p>
          <Link href="/auth/login" passHref>
            <Button>Back to sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen justify-center items-center">
      <LoaderCircle className="w-5 h-5 animate-spin mr-1" />
      <p>Signing you in…</p>
    </div>
  )
}

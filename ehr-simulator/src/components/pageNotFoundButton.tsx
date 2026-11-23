'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserRole } from '@/actions/users'
import { useUser } from '@/context/UserContext'
import { emailIsDevAdminAllowlist } from '@/lib/devAdminEmails'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { routes } from '@/lib/routes'

export function PageNotFoundButton() {
  const router = useRouter()
  const { user } = useUser()
  const [resolving, setResolving] = useState(false)
  const [failed, setFailed] = useState(false)

  const resolveAndRoute = async () => {
    if (!user || resolving) return

    setResolving(true)
    setFailed(false)
    try {
      const devBypass = emailIsDevAdminAllowlist(user.email ?? undefined)
      const role = devBypass ? 'admin' : await getUserRole(user.id)
      router.replace(routes.home.forRole(role, user.id))
    } catch {
      setFailed(true)
      setResolving(false)
    }
  }

  if (!user) {
    return (
      <Link href={routes.auth.login.getHref()} passHref>
        <Button>Sign in</Button>
      </Link>
    )
  }

  return (
    <div className="space-y-3">
      <Button onClick={resolveAndRoute} disabled={resolving}>
        {resolving && <LoaderCircle className="size-4 animate-spin" />}
        {resolving ? 'Finding your homepage…' : 'Go to my homepage'}
      </Button>
      {failed && (
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t determine your homepage &mdash; please try again.
        </p>
      )}
    </div>
  )
}

'use client'

import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Hourglass } from 'lucide-react'

export default function UnprovisionedAccountPage() {
  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
        <Hourglass className="size-8 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Account not ready yet</h1>
        <p className="text-sm text-muted-foreground">
          If you are a student, an account has not been provisioned for you yet. If you are admin
          or faculty, your account must be granted privilege before you can access the site.
        </p>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

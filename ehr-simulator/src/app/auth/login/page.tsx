'use client'

import { Stethoscope } from 'lucide-react'
import { createBrowserSupabase } from '@/utils/supabase/client'

export default function LoginPage() {
  const supabase = createBrowserSupabase()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-2 bg-[#00519f]"
      />

      <section
        aria-labelledby="sign-in-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
          <div className="flex items-center gap-3 text-[#00519f]">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#00519f] text-white shadow-sm">
              <Stethoscope aria-hidden="true" className="size-6" strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none tracking-tight">
                GVSU
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                EHR Simulation
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-9 sm:px-10">
          <div className="mb-8">
            <h1 id="sign-in-title" className="text-3xl font-bold tracking-tight text-slate-950">
              Welcome to the GVSU EHR Simulator
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in with your university Google account to view your assigned cases and enter the EHR.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            className="flex h-12 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 focus-visible:ring-offset-2"
          >
            Continue With Google
          </button>

        </div>
      </section>
    </main>
  )
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { emailIsDevAdminAllowlist } from '@/lib/devAdminEmails'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type UserRoles = "student" | "admin" | "faculty"

interface UserContextType {
  user: any;
  role: UserRoles | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<UserRoles | null>(null)
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (typeof window !== 'undefined') {
        const cachedRole = window.localStorage.getItem('role')
        if (cachedRole) setRole(cachedRole as UserRoles)
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user)
        const devBypass = emailIsDevAdminAllowlist(user.email ?? undefined)
        const newRole = ((devBypass ? 'admin' : user.user_metadata?.role) || null)
        if (newRole && typeof window !== 'undefined') {
          window.localStorage.setItem('role', newRole)
          setRole(newRole as UserRoles)
        }
      }
      setLoading(false)
    }
    loadUser();
  }, [])

  const value = {
    user,
    role,
    isAdmin: role === "admin",
    loading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)

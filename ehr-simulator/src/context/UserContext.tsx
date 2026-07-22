'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { emailIsDevAdminAllowlist } from '@/lib/devAdminEmails'
import { createBrowserSupabase } from '@/utils/supabase/client'

const supabase = createBrowserSupabase();

type UserRoles = "student" | "admin" | "faculty"

interface UserContextType {
  user: User | null;
  role: UserRoles | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRoles | null>(null)
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
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
      } catch (error) {
        console.error('[user-context] Failed to load the current user', error)
      } finally {
        setLoading(false)
      }
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

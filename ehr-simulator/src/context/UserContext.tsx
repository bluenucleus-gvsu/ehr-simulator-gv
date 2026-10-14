'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { emailIsDevAdminAllowlist } from '@/lib/devAdminEmails'
import { getUserRole } from '@/actions/users'
import { createBrowserSupabase } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user)
        const dbRole = await getUserRole(user.id)
        const devBypass = emailIsDevAdminAllowlist(user.email ?? undefined)
        const newRole = (devBypass ? 'admin' : dbRole) as UserRoles | null
        setRole(newRole)
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

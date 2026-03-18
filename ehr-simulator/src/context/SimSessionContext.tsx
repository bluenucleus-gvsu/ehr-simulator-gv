'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getUsersGroupId } from '@/actions/users';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SimSessionContextType {
  userName: string | null;
  userId: string | null;
  caseId: string | null;
  caseSessionId: string | null;
  loading: boolean;
  simStartTime: number | null;
  groupId: string | null;
}

const SimContext = createContext<SimSessionContextType>({
  userName: null,
  userId: null,
  groupId: null,
  caseId: null,
  caseSessionId: null,
  loading: true,
  simStartTime: null,
})

export function SimSessionProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [caseSessionId, setCaseSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  const [simStartTime, setSimStartTime] = useState<number | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id) {
        setUserId(user.id)
        const response = await getUsersGroupId(user.id)
        if (response.success) {
          setUserName(response.data?.full_name)
          setGroupId(response.data?.group_id)
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [userId])

  const startSimSession = (
    newCaseId: string,
    newCaseSessionId: string,
    startTime: number
  ) => {
    setCaseId(newCaseId);
    setCaseSessionId(newCaseSessionId);
    setSimStartTime(startTime)
  }

  const value = {
    userName,
    userId,
    caseId,
    caseSessionId,
    loading,
    startSimSession,
    simStartTime,
    groupId
  }

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}



export const useSimSessionContext = () => useContext(SimContext)

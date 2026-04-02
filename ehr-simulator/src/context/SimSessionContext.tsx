'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getUsersGroupId } from '@/actions/users';
import { useParams } from 'next/navigation';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SimSessionContextType {
  userName: string | null;
  userId: string | null;
  loading: boolean;
  simStartTime: number | null;
  groupId: string | null;
  isPresim: boolean | null;
  hasUnsavedCharting: boolean | null;
  handleUnsavedCharting: (chartingStatus: boolean) => void;
}

const SimContext = createContext<SimSessionContextType>({
  userName: null,
  userId: null,
  groupId: null,
  loading: true,
  simStartTime: null,
  isPresim: true,
  hasUnsavedCharting: false,
  handleUnsavedCharting: () => { }
});

export function SimSessionProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simStartTime, setSimStartTime] = useState<number | null>(null);
  const [isPresim, setIsPresim] = useState<boolean | null>(true);
  const [hasUnsavedCharting, setHasUnsavedCharting] = useState<boolean | null>(false);


  const params = useParams();
  const sessionId = params?.sessionId as string;

  useEffect(() => {
    async function loadSimData() {
      setLoading(true);

      // 1. Load User Details
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id) {
        setUserId(user.id)
        const response = await getUsersGroupId(user.id)
        if (response.success) {
          setUserName(response.data?.full_name)
          setGroupId(response.data?.group_id)
        }
      }

      // 2. Load Session Details to determine Pre-sim vs Active Sim
      if (sessionId) {
        const { data: sessionData, error } = await supabase
          .from('case_sessions')
          .select('started_at')
          .eq('id', sessionId)
          .single();

        if (!error && sessionData) {
          const hasStarted = !!sessionData.started_at;
          setIsPresim(!hasStarted);

          if (hasStarted) {
            setSimStartTime(new Date(sessionData.started_at).getTime());
          } else {
            // PRE-SIM: Freeze a temporary local time for the UI.
            // This prevents time from jumping around on page navigations,
            // but never writes to database.
            setSimStartTime(Date.now());
          }
        }
      }
      setLoading(false);
    }
    loadSimData();
  }, [sessionId]);

  const handleUnsavedCharting = (chartingStatus: boolean) => {
    setHasUnsavedCharting(chartingStatus);
  }

  const value = {
    userName,
    userId,
    loading,
    simStartTime,
    groupId,
    isPresim,
    hasUnsavedCharting,
    handleUnsavedCharting
  }

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}



export const useSimSessionContext = () => useContext(SimContext)

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
  userRole: string | null;
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
  userRole: null,
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
  const [userRole, setUserRole] = useState<string | null>(null);
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

      let nextUserName: string | null = null;
      let nextUserRole: string | null = null;
      let nextGroupId: string | null = null;
      let nextSimStart: number | null = null;
      let nextIsPresim: boolean | null = true;

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setUserId(user.id);
        const response = await getUsersGroupId(user.id);
        if (response.success && response.data) {
          nextUserName = response.data.full_name ?? null;
          nextUserRole = response.data.role ?? null;
          nextGroupId = response.data.group_id ?? null;
        }
      }

      if (sessionId) {
        const { data: sessionData, error } = await supabase
          .from("case_sessions")
          .select("started_at, status, group_id")
          .eq("id", sessionId)
          .maybeSingle();

        if (!error && sessionData) {
          if (sessionData.group_id) {
            nextGroupId = sessionData.group_id;
          }

          const normalizedStatus = (sessionData.status ?? "").toLowerCase();
          const hasStarted =
            Boolean(sessionData.started_at) ||
            normalizedStatus === "in progress" ||
            normalizedStatus === "completed";
          nextIsPresim = !hasStarted;

          if (hasStarted) {
            const startedMs = sessionData.started_at
              ? new Date(sessionData.started_at).getTime()
              : Date.now();
            nextSimStart = Number.isFinite(startedMs) ? startedMs : Date.now();
          } else {
            nextSimStart = Date.now();
          }
        } else {
          nextSimStart = Date.now();
          nextIsPresim = false;
        }
      }

      if (nextSimStart === null) {
        nextSimStart = Date.now();
      }

      setUserName(nextUserName);
      setUserRole(nextUserRole);
      setGroupId(nextGroupId);
      setSimStartTime(nextSimStart);
      setIsPresim(nextIsPresim);
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
    userRole,
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

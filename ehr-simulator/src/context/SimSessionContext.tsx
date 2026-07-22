'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getUsersGroupId } from '@/actions/users';
import { useParams } from 'next/navigation';
import { Database } from '../../database.types';
import { createBrowserSupabase } from '@/utils/supabase/client';

const supabase = createBrowserSupabase();

type SessionRealtimeRow = Pick<
  Database["public"]["Tables"]["case_sessions"]["Row"],
  "current_phase" | "group_id" | "started_at" | "status"
>;

export interface SimSessionContextType {
  userName: string | null;
  userId: string | null;
  userRole: string | null;
  loading: boolean;
  simStartTime: number | null;
  groupId: string | null;
  isPresim: boolean | null;
  currentPhase: number;
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
  currentPhase: 1,
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
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [hasUnsavedCharting, setHasUnsavedCharting] = useState<boolean | null>(false);


  const params = useParams();
  const sessionId = params?.sessionId as string;

  const applySessionState = (sessionData: SessionRealtimeRow | null) => {
    if (!sessionData) {
      setSimStartTime(Date.now());
      setIsPresim(false);
      setCurrentPhase(1);
      return;
    }

    if (sessionData.group_id) {
      setGroupId(sessionData.group_id);
    }

    const normalizedStatus = (sessionData.status ?? "").toLowerCase();
    const hasStarted =
      Boolean(sessionData.started_at) ||
      normalizedStatus === "in progress" ||
      normalizedStatus === "completed";

    setIsPresim(!hasStarted);
    setCurrentPhase(Number(sessionData.current_phase));

    if (hasStarted) {
      const startedMs = sessionData.started_at
        ? new Date(sessionData.started_at).getTime()
        : Date.now();
      setSimStartTime(Number.isFinite(startedMs) ? startedMs : Date.now());
      return;
    }

    setSimStartTime(Date.now());
  };

  useEffect(() => {
    async function loadSimData() {
      setLoading(true);

      try {
        let nextUserName: string | null = null;
        let nextUserRole: string | null = null;
        let nextGroupId: string | null = null;

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
            .select("started_at, status, group_id, current_phase")
            .eq("id", sessionId)
            .maybeSingle();

          if (!error && sessionData) {
            nextGroupId = sessionData.group_id ?? nextGroupId;
            applySessionState(sessionData);
          } else {
            applySessionState(null);
          }
        } else {
          applySessionState(null);
        }

        setUserName(nextUserName);
        setUserRole(nextUserRole);
        setGroupId(nextGroupId);
      } catch (error) {
        console.error('[simulation-context] Failed to load simulation data', error);
        applySessionState(null);
      } finally {
        setLoading(false);
      }
    }
    loadSimData();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`case-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "case_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          applySessionState(payload.new as SessionRealtimeRow);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
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
    currentPhase,
    hasUnsavedCharting,
    handleUnsavedCharting
  }

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}



export const useSimSessionContext = () => useContext(SimContext)

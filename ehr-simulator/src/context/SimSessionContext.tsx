'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getUsersGroupId } from '@/actions/users';
import { getSessionItemReleases } from '@/actions/faculty';
import {
  PREVIEW_SESSION_ID,
  RELEASABLE_ITEMS,
  applyReleaseDelete,
  applyReleaseInsert,
  buildPreviewReleasedItems,
  createEmptyReleasedItemsMap,
  toReleasedItemsMap,
  type ReleasedItemsMap,
} from '@/lib/faculty/itemRelease';
import { useParams } from 'next/navigation';
import { useSimulationCase } from '@/context/SimulationCaseContext';
import { Database } from '../../database.types';

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SessionRealtimeRow = Pick<
  Database["public"]["Tables"]["case_sessions"]["Row"],
  "group_id" | "started_at" | "status"
>;

export interface SimSessionContextType {
  userName: string | null;
  userId: string | null;
  userRole: string | null;
  loading: boolean;
  simStartTime: number | null;
  groupId: string | null;
  isPresim: boolean | null;
  isAdminPreview: boolean;
  releasedItems: ReleasedItemsMap;
  releasedItemsAtLoad: ReleasedItemsMap;
  hasUnsavedCharting: boolean | null;
  handleUnsavedCharting: (chartingStatus: boolean) => void;
  handlePresimStatusChange: () => void;
}

const SimContext = createContext<SimSessionContextType>({
  userName: null,
  userId: null,
  userRole: null,
  groupId: null,
  loading: true,
  simStartTime: null,
  isPresim: true,
  isAdminPreview: false,
  releasedItems: createEmptyReleasedItemsMap(),
  releasedItemsAtLoad: createEmptyReleasedItemsMap(),
  hasUnsavedCharting: false,
  handleUnsavedCharting: () => { },
  handlePresimStatusChange: () => null,
});

export function SimSessionProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simStartTime, setSimStartTime] = useState<number | null>(null);
  const [isPresim, setIsPresim] = useState<boolean | null>(true);
  const [isAdminPreview, setIsAdminPreview] = useState<boolean>(false);
  const [releasedItems, setReleasedItems] = useState<ReleasedItemsMap>(createEmptyReleasedItemsMap());
  const [releasedItemsAtLoad, setReleasedItemsAtLoad] = useState<ReleasedItemsMap>(createEmptyReleasedItemsMap());
  const [hasUnsavedCharting, setHasUnsavedCharting] = useState<boolean | null>(false);


  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { caseBundle } = useSimulationCase();
  const isPreviewSession = sessionId === PREVIEW_SESSION_ID;

  const applySessionState = (sessionData: SessionRealtimeRow | null) => {
    if (!sessionData) {
      setSimStartTime(Date.now());
      setIsPresim(true);
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

      if (sessionId && !isPreviewSession) {
        const { data: sessionData, error } = await supabase
          .from("case_sessions")
          .select("started_at, status, group_id")
          .eq("id", sessionId)
          .maybeSingle();

        if (!error && sessionData) {
          nextGroupId = sessionData.group_id ?? nextGroupId;
          applySessionState(sessionData);
        } else {
          applySessionState(null);
        }

        const releasesResult = await getSessionItemReleases(sessionId);
        if (releasesResult.success && releasesResult.data) {
          const map = toReleasedItemsMap(releasesResult.data);
          setReleasedItems(map);
          setReleasedItemsAtLoad(map);
        } else {
          const empty = createEmptyReleasedItemsMap();
          setReleasedItems(empty);
          setReleasedItemsAtLoad(empty);
        }
      } else {
        applySessionState(null);
        if (nextUserRole === "admin" && isPreviewSession) {
          const previewMap = buildPreviewReleasedItems(caseBundle, Date.now());
          setReleasedItems(previewMap);
          setReleasedItemsAtLoad(previewMap);
        } else {
          const empty = createEmptyReleasedItemsMap();
          setReleasedItems(empty);
          setReleasedItemsAtLoad(empty);
        }
      }

      setUserName(nextUserName);
      setUserRole(nextUserRole);
      setGroupId(nextGroupId);
      setIsAdminPreview(nextUserRole === "admin" && isPreviewSession);
      setLoading(false);
    }
    loadSimData();
  }, [sessionId, isPreviewSession, caseBundle]);

  useEffect(() => {
    if (!sessionId || isPreviewSession) return;

    let channel = supabase
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
      );
    Object.values(RELEASABLE_ITEMS).forEach(({ releaseTable: table }) => {
      channel = channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table,
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const row = payload.new as { item_id: string; released_at: string };
            if (!row?.item_id) return;
            setReleasedItems(prev => applyReleaseInsert(prev, table, row.item_id, row.released_at));
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table,
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const row = payload.old as { item_id?: string };
            const itemId = row?.item_id;
            if (!itemId) return;
            setReleasedItems(prev => applyReleaseDelete(prev, table, itemId));
          },
        );
    });

    channel = channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId, isPreviewSession]);

  const handleUnsavedCharting = (chartingStatus: boolean) => {
    setHasUnsavedCharting(chartingStatus);
  }

  const handlePresimStatusChange = () => {
    setIsPresim(prev => !prev);
  }

  const value = {
    userName,
    userId,
    userRole,
    loading,
    simStartTime,
    groupId,
    isPresim,
    isAdminPreview,
    releasedItems,
    releasedItemsAtLoad,
    hasUnsavedCharting,
    handleUnsavedCharting,
    handlePresimStatusChange
  }

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}



export const useSimSessionContext = () => useContext(SimContext)

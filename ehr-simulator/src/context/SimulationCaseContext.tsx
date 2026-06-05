"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { SimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import {
  filterCaseBundleForSimulation,
  resolveEffectivePhases,
  resolveSimulationPhaseContext,
  type SimulationEffectivePhases,
  type SimulationPhaseContext,
} from "@/lib/simPhases";
import { isTesterModeClient } from "@/utils/testerMode";

const SESSION_PHASE_POLL_MS = 4_000;

interface SimulationCaseContextValue {
  routeContext: SimulationRouteContext | null;
  /** Phase-filtered bundle for chart tabs (Orders, Labs, MAR). */
  caseBundle: CaseBundle | null;
  rawCaseBundle: CaseBundle | null;
  phaseContext: SimulationPhaseContext;
  effectivePhases: SimulationEffectivePhases | null;
  refreshSessionPhase: () => Promise<void>;
}

const defaultPhaseContext = resolveSimulationPhaseContext({
  phaseCount: 1,
  currentPhase: 1,
});

const SimulationCaseContext = createContext<SimulationCaseContextValue>({
  routeContext: null,
  caseBundle: null,
  rawCaseBundle: null,
  phaseContext: defaultPhaseContext,
  effectivePhases: null,
  refreshSessionPhase: async () => {},
});

export function SimulationCaseProvider({
  children,
  routeContext,
  phaseRouteContext,
  rawCaseBundle,
  initialPhaseContext,
}: {
  children: React.ReactNode;
  routeContext: SimulationRouteContext | null;
  /** Row used for current_phase polling (usually case_sessions). */
  phaseRouteContext: SimulationRouteContext | null;
  rawCaseBundle: CaseBundle | null;
  initialPhaseContext: SimulationPhaseContext;
}) {
  const [phaseContext, setPhaseContext] = useState<SimulationPhaseContext>(initialPhaseContext);

  const caseBundle = useMemo(() => {
    if (!rawCaseBundle) return null;
    return filterCaseBundleForSimulation(rawCaseBundle, phaseContext);
  }, [rawCaseBundle, phaseContext]);

  const effectivePhases = useMemo(() => {
    if (!rawCaseBundle) return null;
    return resolveEffectivePhases(rawCaseBundle, phaseContext);
  }, [rawCaseBundle, phaseContext]);

  const refreshSessionPhase = useCallback(async () => {
    if (!phaseRouteContext || phaseRouteContext.source !== "case_session") return;
    if (isTesterModeClient()) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase
      .from("case_sessions")
      .select("current_phase")
      .eq("id", phaseRouteContext.routeId)
      .maybeSingle();

    if (error || !data) return;

    setPhaseContext((prev) =>
      resolveSimulationPhaseContext({
        phaseCount: prev.phaseCount,
        currentPhase: data.current_phase,
      }),
    );
  }, [phaseRouteContext]);

  useEffect(() => {
    if (!phaseRouteContext || phaseRouteContext.source !== "case_session") return;
    if (isTesterModeClient()) return;

    void refreshSessionPhase();
    const interval = window.setInterval(() => {
      void refreshSessionPhase();
    }, SESSION_PHASE_POLL_MS);

    return () => window.clearInterval(interval);
  }, [phaseRouteContext, refreshSessionPhase]);

  const value = useMemo(
    () => ({
      routeContext,
      caseBundle,
      rawCaseBundle,
      phaseContext,
      effectivePhases,
      refreshSessionPhase,
    }),
    [routeContext, caseBundle, rawCaseBundle, phaseContext, effectivePhases, refreshSessionPhase],
  );

  return (
    <SimulationCaseContext.Provider value={value}>{children}</SimulationCaseContext.Provider>
  );
}

export function useSimulationCase() {
  return useContext(SimulationCaseContext);
}

"use client";

import { createContext, useContext } from "react";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { SimulationRouteContext } from "@/actions/simulation/getSimulationContext";

interface SimulationCaseContextValue {
  routeContext: SimulationRouteContext | null;
  caseBundle: CaseBundle | null;
}

const SimulationCaseContext = createContext<SimulationCaseContextValue>({
  routeContext: null,
  caseBundle: null,
});

export function SimulationCaseProvider({
  children,
  routeContext,
  caseBundle,
}: {
  children: React.ReactNode;
  routeContext: SimulationRouteContext | null;
  caseBundle: CaseBundle | null;
}) {
  return (
    <SimulationCaseContext.Provider value={{ routeContext, caseBundle }}>
      {children}
    </SimulationCaseContext.Provider>
  );
}

export function useSimulationCase() {
  return useContext(SimulationCaseContext);
}

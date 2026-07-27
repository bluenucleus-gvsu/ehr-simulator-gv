"use client";

import { createContext, useContext } from "react";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { SimulationRouteContext } from "@/actions/simulation/getSimulationContext";

interface SimulationCaseContextValue {
  routeContext: SimulationRouteContext | null;
  caseBundle: CaseBundle | null;
  initialPhotoOverride: string | null;
}

const SimulationCaseContext = createContext<SimulationCaseContextValue>({
  routeContext: null,
  caseBundle: null,
  initialPhotoOverride: null,
});

export function SimulationCaseProvider({
  children,
  routeContext,
  caseBundle,
  initialPhotoOverride,
}: {
  children: React.ReactNode;
  routeContext: SimulationRouteContext | null;
  caseBundle: CaseBundle | null;
  initialPhotoOverride: string | null;
}) {
  return (
    <SimulationCaseContext.Provider value={{ routeContext, caseBundle, initialPhotoOverride }}>
      {children}
    </SimulationCaseContext.Provider>
  );
}

export function useSimulationCase() {
  return useContext(SimulationCaseContext);
}

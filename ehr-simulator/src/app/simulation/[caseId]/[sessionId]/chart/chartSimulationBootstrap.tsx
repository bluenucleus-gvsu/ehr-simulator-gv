"use client";

import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { SimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import { SimulationCaseProvider } from "@/context/SimulationCaseContext";

export function ChartSimulationBootstrap({
  routeContext,
  serverCaseBundle,
  initialPhotoOverride,
  children,
}: {
  routeContext: SimulationRouteContext;
  serverCaseBundle: CaseBundle | null;
  initialPhotoOverride: string | null;
  children: React.ReactNode;
}) {
  return (
    <SimulationCaseProvider
      routeContext={routeContext}
      caseBundle={serverCaseBundle}
      initialPhotoOverride={initialPhotoOverride}
    >
      {children}
    </SimulationCaseProvider>
  );
}

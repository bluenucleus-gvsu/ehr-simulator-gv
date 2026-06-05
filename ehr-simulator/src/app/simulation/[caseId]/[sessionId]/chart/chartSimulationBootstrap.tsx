"use client";

import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { SimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import { SimulationCaseProvider } from "@/context/SimulationCaseContext";
import type { SimulationPhaseContext } from "@/lib/simPhases";
import {
  buildTesterCaseBundleFromDraft,
  mergeTesterCaseBundlePreferDraft,
} from "@/utils/buildTesterCaseBundleFromDraft";
import { isTesterModeClient } from "@/utils/testerMode";
import { getTesterCaseDraft } from "@/utils/testerLocalStore";
import { useEffect, useState } from "react";

export function ChartSimulationBootstrap({
  routeContext,
  phaseRouteContext,
  serverCaseBundle,
  initialPhaseContext,
  children,
}: {
  routeContext: SimulationRouteContext;
  phaseRouteContext: SimulationRouteContext;
  serverCaseBundle: CaseBundle | null;
  initialPhaseContext: SimulationPhaseContext;
  children: React.ReactNode;
}) {
  const [rawCaseBundle, setRawCaseBundle] = useState<CaseBundle | null>(serverCaseBundle);

  useEffect(() => {
    if (!isTesterModeClient()) {
      setRawCaseBundle(serverCaseBundle);
      return;
    }

    const draft = getTesterCaseDraft(routeContext.caseId);
    if (!draft) {
      setRawCaseBundle(serverCaseBundle);
      return;
    }

    const fromDraft = buildTesterCaseBundleFromDraft(routeContext.caseId);
    setRawCaseBundle(mergeTesterCaseBundlePreferDraft(fromDraft, serverCaseBundle));
  }, [serverCaseBundle, routeContext.caseId]);

  return (
    <SimulationCaseProvider
      routeContext={routeContext}
      phaseRouteContext={phaseRouteContext}
      rawCaseBundle={rawCaseBundle}
      initialPhaseContext={initialPhaseContext}
    >
      {children}
    </SimulationCaseProvider>
  );
}

"use client";

import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { SimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import { SimulationCaseProvider } from "@/context/SimulationCaseContext";
import {
  buildTesterCaseBundleFromDraft,
  mergeTesterCaseBundlePreferDraft,
} from "@/utils/buildTesterCaseBundleFromDraft";
import { isTesterModeClient } from "@/utils/testerMode";
import { getTesterCaseDraft } from "@/utils/testerLocalStore";
import { useEffect, useState } from "react";

export function ChartSimulationBootstrap({
  routeContext,
  serverCaseBundle,
  children,
}: {
  routeContext: SimulationRouteContext;
  serverCaseBundle: CaseBundle | null;
  children: React.ReactNode;
}) {
  const [caseBundle, setCaseBundle] = useState<CaseBundle | null>(serverCaseBundle);

  useEffect(() => {
    if (!isTesterModeClient()) {
      setCaseBundle(serverCaseBundle);
      return;
    }

    const draft = getTesterCaseDraft(routeContext.caseId);
    if (!draft) {
      setCaseBundle(serverCaseBundle);
      return;
    }

    const fromDraft = buildTesterCaseBundleFromDraft(routeContext.caseId);
    setCaseBundle(mergeTesterCaseBundlePreferDraft(fromDraft, serverCaseBundle));
  }, [serverCaseBundle, routeContext.caseId]);

  return (
    <SimulationCaseProvider routeContext={routeContext} caseBundle={caseBundle}>
      {children}
    </SimulationCaseProvider>
  );
}

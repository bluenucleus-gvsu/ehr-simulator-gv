import ChartTabs from "./components/chartTabs"
import { Toaster } from "sonner"
import ChartSidebar from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartSidebar"
import Header from "@/app/simulation/[caseId]/[sessionId]/chart/components/header"
import SimulationModeBanner from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationModeBanner"
import SimulationShell from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationShell"
import { SimSessionProvider } from "@/context/SimSessionContext";
import {
  getSimulationPhaseState,
  resolveSimulationRouteContext,
} from "@/actions/simulation/getSimulationContext";
import { getCaseBundle } from "@/actions/case_builder/getCase";
import { isTesterModeServer } from "@/utils/testerModeServer";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import { ChartSimulationBootstrap } from "./chartSimulationBootstrap";
import PhaseAdvanceAlert from "./components/phaseAdvanceAlert";

type ChartLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
};

const ChartLayout = async ({ children, params }: ChartLayoutProps) => {
  const { caseId, sessionId } = await params;
  const routeContext = await resolveSimulationRouteContext(caseId);
  const sessionRouteContext = await resolveSimulationRouteContext(sessionId);
  /** Phase polling uses case_sessions row; URL may put case id in segment 1 and session id in segment 2. */
  const phaseRouteContext =
    sessionRouteContext.source === "case_session" ? sessionRouteContext : routeContext;
  const tester = await isTesterModeServer();

  let serverCaseBundle: CaseBundle | null = null;
  try {
    serverCaseBundle = await getCaseBundle(routeContext.caseId);
  } catch {
    if (!tester) throw new Error(`Case not available for simulation: ${routeContext.caseId}`);
  }

  const phaseCount = serverCaseBundle?.caseRow?.phase_count ?? 1;
  const initialPhaseContext = await getSimulationPhaseState(phaseRouteContext, phaseCount);

  return (
    <ChartSimulationBootstrap
      routeContext={routeContext}
      phaseRouteContext={phaseRouteContext}
      serverCaseBundle={serverCaseBundle}
      initialPhaseContext={initialPhaseContext}
    >
      <SimSessionProvider>
        <SimulationShell>
          <PhaseAdvanceAlert />
          <Toaster position="top-right" />
          <Header tabs={<ChartTabs />} />
          <div className="flex min-h-0 flex-1 w-full min-w-0">
            <ChartSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <SimulationModeBanner />
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-hidden">
                {children}
              </div>
            </div>
          </div>
        </SimulationShell>
      </SimSessionProvider>
    </ChartSimulationBootstrap>
  )
}

export default ChartLayout
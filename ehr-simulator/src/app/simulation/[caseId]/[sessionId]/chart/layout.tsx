import ChartTabs from "./components/chartTabs"
import { Toaster } from "sonner"
import ChartSidebar from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartSidebar"
import Header from "@/app/simulation/[caseId]/[sessionId]/chart/components/header"
import SimulationModeBanner from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationModeBanner"
import SimulationShell from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationShell"
import { SimSessionProvider } from "@/context/SimSessionContext";
import { resolveSimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import { getCaseBundle } from "@/actions/case_builder/getCase";
import { isTesterModeServer } from "@/utils/testerModeServer";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import { ChartSimulationBootstrap } from "./chartSimulationBootstrap";

type ChartLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
};

const ChartLayout = async ({ children, params }: ChartLayoutProps) => {
  const { caseId } = await params;
  const routeContext = await resolveSimulationRouteContext(caseId);
  const tester = await isTesterModeServer();

  let serverCaseBundle: CaseBundle | null = null;
  try {
    serverCaseBundle = await getCaseBundle(routeContext.caseId);
  } catch {
    if (!tester) throw new Error(`Case not available for simulation: ${routeContext.caseId}`);
  }

  return (
    <ChartSimulationBootstrap routeContext={routeContext} serverCaseBundle={serverCaseBundle}>
      <SimSessionProvider>
        <SimulationShell>
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
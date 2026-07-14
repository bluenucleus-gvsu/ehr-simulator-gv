import ChartTabs from "./components/chartTabs"
import { Toaster } from "sonner"
import ChartSidebar from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartSidebar"
import Header from "@/app/simulation/[caseId]/[sessionId]/chart/components/header"
import SimulationShell from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationShell"
import { SimSessionProvider } from "@/context/SimSessionContext";
import { resolveSimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import { getCaseBundle } from "@/actions/case_builder/getCase";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import { ChartSimulationBootstrap } from "./chartSimulationBootstrap";
import { SidebarProvider } from "@/components/ui/sidebar"
import FlexSheetSidebar from "./charting/components/flexSheetSidebar"

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
  const serverCaseBundle: CaseBundle | null = await getCaseBundle(routeContext.caseId);

  return (
    <ChartSimulationBootstrap routeContext={routeContext} serverCaseBundle={serverCaseBundle}>
      <SidebarProvider defaultOpen={false}>
        <SimSessionProvider>
          <SimulationShell>
            <Toaster position="top-right" />
            <Header tabs={<ChartTabs />} />
            <div className="flex min-h-0 flex-1 w-full min-w-0">
              <ChartSidebar />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-hidden">
                  {children}
                </div>
              </div>
            </div>
          </SimulationShell>
        </SimSessionProvider>
        <FlexSheetSidebar />
      </SidebarProvider>
    </ChartSimulationBootstrap>
  )
}

export default ChartLayout

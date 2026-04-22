import ChartTabs from "./components/chartTabs"
import { Toaster } from "sonner"
import ChartSidebar from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartSidebar"
import Header from "@/app/simulation/[caseId]/[sessionId]/chart/components/header"
import SimulationModeBanner from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationModeBanner"
import SimulationShell from "@/app/simulation/[caseId]/[sessionId]/chart/components/simulationShell"
import { SimSessionProvider } from "@/context/SimSessionContext";
import { SimulationCaseProvider } from "@/context/SimulationCaseContext";
import { resolveSimulationRouteContext } from "@/actions/simulation/getSimulationContext";
import { getCaseBundle } from "@/actions/case_builder/getCase";

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
  const caseBundle = await getCaseBundle(routeContext.caseId);

  return (
    <SimulationCaseProvider routeContext={routeContext} caseBundle={caseBundle}>
      <SimSessionProvider>
        <SimulationShell>
          <Toaster position="top-right" />
          <Header tabs={<ChartTabs />} />
          <div className="flex w-full h-full">
            <ChartSidebar />
            <div className="flex flex-col w-full h-full">
              <SimulationModeBanner />
              {children}
            </div>
          </div>
        </SimulationShell>
      </SimSessionProvider>
    </SimulationCaseProvider>
  )
}

export default ChartLayout
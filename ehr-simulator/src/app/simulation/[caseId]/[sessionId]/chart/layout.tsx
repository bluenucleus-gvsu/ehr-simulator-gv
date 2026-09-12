import { Toaster } from "sonner"
import ChartSidebar from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartSidebar"
import Header from "@/app/simulation/[caseId]/[sessionId]/chart/components/header"
import { SimSessionProvider } from "@/context/SimSessionContext";
import { getCaseBundle } from "@/actions/case_builder/getCase";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import { SidebarProvider } from "@/components/ui/sidebar"
import FlexSheetSidebar from "./charting/components/flexSheetSidebar"
import { SimulationCaseProvider } from "@/context/SimulationCaseContext"
import PhaseUpdateDialog from "@/app/simulation/[caseId]/[sessionId]/chart/components/phaseUpdateDialog"

type ChartLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
};

const ChartLayout = async ({ children, params }: ChartLayoutProps) => {
  const awaitedParams = await params;
  const serverCaseBundle: CaseBundle | null = await getCaseBundle(awaitedParams.caseId);

  return (
    <SimulationCaseProvider routeContext={awaitedParams} caseBundle={serverCaseBundle}>
      <SidebarProvider defaultOpen={false}>
        <SimSessionProvider>
          <PhaseUpdateDialog />
          <Toaster position="top-right" />
          <div className="h-screen w-full overflow-hidden flex flex-col [--header-height:calc(--spacing(16))]">
            <Header />
            <div className="flex flex-1 overflow-hidden min-h-0 w-full min-w-0">
              <ChartSidebar />
              {children}
            </div>
          </ div>
        </SimSessionProvider>
        <FlexSheetSidebar />
      </SidebarProvider>
    </ SimulationCaseProvider>
  )
}

export default ChartLayout

'use server'
import { getAllDocumentationData } from "@/actions/simulation";
import { VitalsOverview } from "./vitalsOverview";

interface VitalsOverviewContainerProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function VitalsOverviewContainer({ params }: VitalsOverviewContainerProps) {
  const awaitedParams = await params
  const { caseId, sessionId } = awaitedParams
  const response = await getAllDocumentationData(caseId, sessionId);

  console.log(response)
  console.log('help')

  if (!response.success || !response.data) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-sm text-red-600">
        Failed to load recent vitals.
      </div>
    );
  }

  return <VitalsOverview dbDocumentation={response.data} />;
}
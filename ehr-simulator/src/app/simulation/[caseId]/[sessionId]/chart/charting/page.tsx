import { getAllDocumentationData } from "@/actions/simulation"
import FlexSheetView from "./chartingView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function Mar({ params }: PageProps) {
  const awaitedParams = await params;
  const { caseId, sessionId } = awaitedParams;

  const documentationData = await getAllDocumentationData(caseId, sessionId)

  if (!documentationData.success || !documentationData.data) {
    return (
      <div>
        Failed to retrieve documentation.
      </div>
    )
  }
  console.log(documentationData.data)
  return (
    <FlexSheetView params={awaitedParams} dbDocumentation={documentationData.data} />
  )
}
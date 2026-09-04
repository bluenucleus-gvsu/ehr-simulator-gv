import { getAllDocumentationData } from "@/actions/simulation"
import FlexSheetView from "./chartingView";

interface FlexSheetProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function FlexSheets({ params }: FlexSheetProps) {
  const awaitedParams = await params;
  const { caseId, sessionId } = awaitedParams;

  const documentationData = await getAllDocumentationData(caseId, sessionId);

  if (!documentationData?.success) {
    return <div>Failed to retrieve documentation.</div>
  }

  const dbDocumentation = documentationData?.data ?? [];
  return (
    <FlexSheetView
      caseId={caseId}
      sessionId={sessionId}
      documentation={dbDocumentation}
    />
  )
}

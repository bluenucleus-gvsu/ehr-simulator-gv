import { getAllDocumentationData } from "@/actions/simulation"
import FlexSheetView from "./chartingView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function FlexSheets({ params }: PageProps) {
  const awaitedParams = await params;
  const { caseId, sessionId } = awaitedParams;

  const documentationData = await getAllDocumentationData(caseId, sessionId);
  if (!documentationData?.success) {
    return <div>Failed to retrieve documentation.</div>
  }

  const dbDocumentation = documentationData?.data ?? [];
  return (
    <FlexSheetView params={awaitedParams} dbDocumentation={dbDocumentation} />
  )
}

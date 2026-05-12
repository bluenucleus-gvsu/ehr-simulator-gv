import { getAllDocumentationData } from "@/actions/simulation"
import FlexSheetView from "./chartingView";
import { isTesterModeServer } from "@/utils/testerModeServer";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function Mar({ params }: PageProps) {
  const awaitedParams = await params;
  const { caseId, sessionId } = awaitedParams;

  const documentationData = await getAllDocumentationData(caseId, sessionId);
  const testerMode = await isTesterModeServer();
  if (!documentationData?.success && !testerMode) {
    return <div>Failed to retrieve documentation.</div>
  }

  const dbDocumentation = documentationData?.data ?? [];
  return (
    <FlexSheetView params={awaitedParams} dbDocumentation={dbDocumentation} />
  )
}
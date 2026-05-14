import { getAllClinicalDocuments } from "@/actions/simulation";
import NoteView from "./components/noteView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}


const NotePage = async ({ params }: PageProps) => {
  const { caseId, sessionId } = await params;
  const documentData = await getAllClinicalDocuments(caseId, sessionId);

  return (
    <NoteView
      isError={false}
      isLoading={false}
      clinicalDocuments={documentData.data || []}
      caseId={caseId}
      sessionId={sessionId}
    />
  )
}

export default NotePage

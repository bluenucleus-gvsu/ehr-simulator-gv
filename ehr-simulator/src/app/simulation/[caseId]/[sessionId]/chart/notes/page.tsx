import { getAllClinicalDocuments } from "@/actions/simulation";
import NoteView from "./components/noteView";
// import { SimSessionContextType, useSimSessionContext } from "@/context/SimSessionContext";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}


const NotePage = async ({ params }: PageProps) => {
  const { caseId, sessionId } = await params;
  const documentData = await getAllClinicalDocuments(caseId, sessionId);

  if (!documentData.success) {
    console.log(documentData.error!.message)
    return (
      <NoteView
        isError={true}
        isLoading={false}
        clinicalDocuments={documentData.data || []}
        caseId={caseId}
        sessionId={sessionId}
      />
    )
  }

  return (
    <NoteView
      isError={!documentData.success}
      isLoading={false}
      clinicalDocuments={documentData.data || []}
      caseId={caseId}
      sessionId={sessionId}
    />
  )
}

export default NotePage

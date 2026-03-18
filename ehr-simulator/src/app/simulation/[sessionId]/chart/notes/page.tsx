import { getAllClinicalDocuments } from "@/actions/studentSimActions";
import NoteView from "./components/noteView";
import { SimSessionContextType } from "@/context/SimSessionContext";




const NotePage = async (simContext: SimSessionContextType) => {
  const { caseId, caseSessionId } = simContext;

  if (!caseId || !caseSessionId) {
    return (
      <NoteView
        isError={false}
        isLoading={true}
        clinicalDocuments={[]}
      />
    )
  }

  const documentData = await getAllClinicalDocuments(caseId, caseSessionId);

  if (documentData.error) {
    return (
      <NoteView
        isError={true}
        isLoading={false}
        clinicalDocuments={documentData.data || []}
      />
    )
  }


  return (
    <NoteView
      isError={false}
      isLoading={false}
      clinicalDocuments={documentData.data || []}
    />
  )
}

export default NotePage

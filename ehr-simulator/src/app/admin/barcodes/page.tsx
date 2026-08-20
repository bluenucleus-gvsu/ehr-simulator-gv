import { getAllMedications } from "@/actions/simulation"
import BardcodeGenerator from "./barcodeGenerator"
import { getAllSimCases } from "@/actions/cases";
import { mapDatabaseMedToFrontend } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers";

const Formulary = async () => {
  const [medResponse, caseReponse] = await Promise.all([
    getAllMedications(),
    getAllSimCases({ publishedOnly: true }),
  ]);

  if (medResponse.error || !medResponse.success || !caseReponse.success) {
    return <div>Failed to retrieve medication and case data.</div>
  }

  const dbMeds = medResponse.data || []
  const medications = dbMeds.map(dbMed => mapDatabaseMedToFrontend(dbMed))

  const cases = caseReponse.data || []


  return (
    <BardcodeGenerator medications={medications} simCases={cases} />
  )
}

export default Formulary

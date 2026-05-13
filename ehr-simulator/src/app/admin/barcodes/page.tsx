import { getAllMedications } from "@/actions/simulation"
import BardcodeGenerator from "./barcodeGenerator"
import { getAllSimCases } from "@/actions/cases";

const Formulary = async () => {
  const [medResponse, caseReponse] = await Promise.all([
    getAllMedications(),
    getAllSimCases(),
  ]);

  if (medResponse.error || !medResponse.success || !caseReponse.success) {
    return <div>Failed to retrieve medication and case data.</div>
  }

  const medications = medResponse.data || []
  const cases = caseReponse.data || []


  return (
    <BardcodeGenerator medications={medications} simCases={cases} />
  )
}

export default Formulary
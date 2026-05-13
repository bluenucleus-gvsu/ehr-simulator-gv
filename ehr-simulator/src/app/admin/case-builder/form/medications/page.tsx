import { getAllMedications } from "@/actions/simulation"
import MedicationOrderForm from "./MedicationOrderForm";
import { mapDatabaseMedToFrontend } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers";

const MedicationOrders = async () => {
  const medResponse = await getAllMedications();


  if (!medResponse.success || medResponse.error) {
    return (
      <div>{medResponse.message}</div>
    )
  }

  const dbMeds = medResponse.data;
  const medications = dbMeds.map(dbMed => mapDatabaseMedToFrontend(dbMed))


  return (
    <MedicationOrderForm medications={medications} />
  )
}

export default MedicationOrders
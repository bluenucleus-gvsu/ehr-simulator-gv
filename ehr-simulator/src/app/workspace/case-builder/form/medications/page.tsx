import { getCaseBuilderMedications } from "@/actions/case_builder/getCase"
import MedicationOrderForm from "./MedicationOrderForm";
import { mapDatabaseMedToFrontend } from "@/lib/medications";

const MedicationOrders = async () => {
  const dbMeds = await getCaseBuilderMedications();
  const medications = dbMeds.map(dbMed => mapDatabaseMedToFrontend(dbMed))


  return (
    <MedicationOrderForm medications={medications} />
  )
}

export default MedicationOrders

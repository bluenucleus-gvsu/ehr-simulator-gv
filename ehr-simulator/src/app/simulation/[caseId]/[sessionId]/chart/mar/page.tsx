import { getMedicationAdministrations, getMedicationOrders } from "@/actions/simulation";
import { AllMedicationTypes, MedicationOrder } from "./components/marData";
import { mapDatabaseMedToFrontend } from "./components/marHelpers";
import MarView from "./components/marView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

const mar = async ({ params }: PageProps) => {
  const awaitedParams = await params;
  const { caseId, sessionId } = awaitedParams;
  const [medData, administrationData] = await Promise.all([
    getMedicationOrders(caseId),
    getMedicationAdministrations(caseId, sessionId)
  ])

  if (!medData.success || !medData.data || !administrationData.success || !administrationData.data) {
    return <MarView
      medicationOrders={[]}
      medications={[]}
      medicationAdministrations={[]}
      params={awaitedParams}
    />
  }

  const uniqueMedsMap = new Map<string, AllMedicationTypes>();
  const formattedOrders: MedicationOrder[] = [];

  medData.data.forEach((dbOrder) => {
    const dbMed = dbOrder.medications;
    // only add unique medications, no duplicates
    if (dbMed && !uniqueMedsMap.has(dbMed.id)) {
      uniqueMedsMap.set(dbMed.id, mapDatabaseMedToFrontend(dbMed));
    }

    formattedOrders.push({
      id: dbOrder.id,
      medicationId: dbOrder.medication_id,
      dose: dbOrder.dose,
      frequency: dbOrder.frequency,
      priority: dbOrder.priority,
      instructions: dbOrder.instructions || undefined,
      indication: dbOrder.indication || '',
      orderingProvider: dbOrder.ordering_provider || 'Unknown Provider',
      visibleInPresim: dbOrder.is_in_presim,
      infusionRate: dbOrder.infusion_rate || undefined
    });
  });

  // Convert the Map back to an array for the frontend
  const formattedMedications = Array.from(uniqueMedsMap.values());

  return (
    <MarView
      medicationOrders={formattedOrders}
      medications={formattedMedications}
      medicationAdministrations={administrationData.data}
      params={awaitedParams}
    />
  )

}

export default mar;
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

const Mar = async ({ params }: PageProps) => {
  const awaitedParams = await params;
  const { caseId, sessionId } = awaitedParams;

  const [medData, administrationData] = await Promise.all([
    getMedicationOrders(caseId),
    getMedicationAdministrations(caseId, sessionId),
  ]);

  if (!medData.success || !medData.data) {
    return <MarView
      medicationOrders={[]}
      medications={[]}
      medicationAdministrations={[]}
      caseId={caseId}
      sessionId={sessionId}
    />
  }

  const medicationAdministrations =
    administrationData.success && administrationData.data
      ? administrationData.data
      : [];

  const uniqueMedsMap = new Map<string, AllMedicationTypes>();
  const formattedOrders: MedicationOrder[] = [];

  medData.data.forEach((dbOrder) => {
    const dbMed = dbOrder.medications;
    if (!dbMed) {
      return;
    }
    // only add unique medications, no duplicates
    if (!uniqueMedsMap.has(dbMed.id)) {
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
      visibleInPresim: dbOrder.is_in_presim !== false,
      infusionRate: dbOrder.infusion_rate || undefined,
      phase: dbOrder.phase,
    });
  });

  // Convert the Map back to an array for the frontend
  const formattedMedications = Array.from(uniqueMedsMap.values());

  return (
    <MarView
      medicationOrders={formattedOrders}
      medications={formattedMedications}
      medicationAdministrations={medicationAdministrations}
      caseId={caseId}
      sessionId={sessionId}
    />
  )

}

export default Mar;

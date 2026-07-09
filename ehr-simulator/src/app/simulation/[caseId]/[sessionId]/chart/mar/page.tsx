import { getMedicationAdministrations, getMedicationOrders } from "@/actions/simulation";
import { resolveSimulationRouteContext } from "@/actions/simulation/getSimulationContext";
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
  const { caseId: routeCaseId, sessionId } = awaitedParams;
  const routeContext = await resolveSimulationRouteContext(routeCaseId);
  const resolvedCaseId = routeContext.caseId;

  const [medData, administrationData] = await Promise.all([
    getMedicationOrders(resolvedCaseId),
    getMedicationAdministrations(resolvedCaseId, sessionId),
  ]);

  if (!medData.success || !medData.data) {
    return <MarView
      medicationOrders={[]}
      medications={[]}
      medicationAdministrations={[]}
      params={awaitedParams}
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
      params={awaitedParams}
    />
  )

}

export default mar;

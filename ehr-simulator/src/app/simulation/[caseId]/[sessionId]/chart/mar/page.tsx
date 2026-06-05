import { getMedicationAdministrations } from "@/actions/simulation";
import { resolveSimulationRouteContext } from "@/actions/simulation/getSimulationContext";

import SimulationMarPage from "./SimulationMarPage";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function MarPage({ params }: PageProps) {
  const awaitedParams = await params;
  const routeContext = await resolveSimulationRouteContext(awaitedParams.caseId);
  const resolvedCaseId = routeContext.caseId;

  const administrationData = await getMedicationAdministrations(
    resolvedCaseId,
    awaitedParams.sessionId,
  );

  const sessionAdministrations =
    administrationData.success && administrationData.data
      ? administrationData.data.filter((row) => Boolean(row.case_session_id))
      : [];

  return (
    <SimulationMarPage
      params={awaitedParams}
      sessionAdministrations={sessionAdministrations}
    />
  );
}

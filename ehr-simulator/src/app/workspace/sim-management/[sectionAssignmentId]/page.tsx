import SimulationGroupsView from "@/app/workspace/sim-management/[sectionAssignmentId]/components/SimulationGroupsView"
import { getSectionSimulationDetails } from "@/actions/sim-management";

export default async function SimulationPage({ params }: {
  params: Promise<{ sectionAssignmentId: string }>
}) {
  const { sectionAssignmentId } = await params;
  const activeSimView = await getSectionSimulationDetails(sectionAssignmentId)

  if (!activeSimView) {
    return <div className="p-8 text-muted-foreground">No active simulation found for this section.</div>;
  }

  return (
    <div className="max-w-5xl w-full min-h-screen">
      <SimulationGroupsView activeSimView={activeSimView} />
    </div>
  );
}

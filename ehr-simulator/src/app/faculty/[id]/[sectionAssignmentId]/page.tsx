// app/[role]/[sectionId]/page.tsx
import SimulationGroupsView from "@/app/faculty/[id]/[sectionAssignmentId]/components/SimulationGroupsView"
import { getSectionSimulationDetails } from "@/app/faculty/lib/facultyData";

export default async function SimulationPage({
    params,
}: {
    params: Promise<{ id: string; sectionAssignmentId: string }>;
}) {

    const { sectionAssignmentId } = await params;

    const activeSimView = await getSectionSimulationDetails(sectionAssignmentId)

    if (!activeSimView) {
        return <div className="p-8 text-muted-foreground">No active simulation found for this section.</div>;
    }


    return (
        <div className="m-10">
            <SimulationGroupsView activeSimView={activeSimView} />
        </div>
    );
}

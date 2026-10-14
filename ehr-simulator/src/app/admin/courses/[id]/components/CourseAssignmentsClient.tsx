"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import CaseAssignment from "./caseAssignment";
import DeleteCaseButton from "./deleteCaseButton";
import { SimAssignmentTable } from "./simAssignmentTable";
import { isPastArchiveWindow } from "@/utils/assignedSimulationLifecycle";
import AdminSessionActions from "./adminSessionActions";
import { CasesData, SectionSimulationsData, SimAssignment, TerminalAssignmentStatus } from "@/actions/cases";

interface CourseAssignmentsClientProps {
  sectionsData: SectionSimulationsData;
  casesData: CasesData;
}

const TERMINAL_TILE_CLASS: Record<TerminalAssignmentStatus, string> = {
  completed: "text-green-700 border-green-200 bg-green-50",
  archived: "text-slate-600 border-slate-200 bg-slate-50",
};

const TERMINAL_TILE_LABEL: Record<TerminalAssignmentStatus, string> = {
  completed: "Completed",
  archived: "Archived",
};

export default function CourseAssignmentsClient({
  sectionsData,
  casesData,
}: CourseAssignmentsClientProps) {
  const { assigned, past } = useMemo(
    () =>
      sectionsData.assignments.reduce<{ assigned: SimAssignment[]; past: SimAssignment[] }>(
        (acc, item) => {
          if (item.terminalStatus !== null || isPastArchiveWindow(item.simTime)) {
            acc.past.push(item);
          } else {
            acc.assigned.push(item);
          }
          return acc;
        },
        { assigned: [], past: [] },
      ),
    [sectionsData],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Assigned Simulations</h2>
        <CaseAssignment
          sections={sectionsData.sections}
          cases={casesData}
          isEditMode={false}
        />
      </div>
      <SimAssignmentTable
        assignments={assigned}
        emptyMessage="No upcoming simulations scheduled."
        dateFormat="Pp"
        actionLabel="Actions"
        showDiagnosis={true}
        renderAction={(assignment) => (
          <div className="flex items-center gap-2">
            <CaseAssignment
              isEditMode={true}
              sections={sectionsData.sections}
              cases={casesData}
              existing_id={assignment.id}
              initialData={{
                sectionId: assignment.sectionId,
                caseId: assignment.caseId ?? "",
                simTime: assignment.simTime ?? "",
                presimTime: assignment.presimTime ?? "",
              }}
            />
            <AdminSessionActions assignmentId={assignment.id} />
          </div>
        )}
      />
      <h2 className="text-xl pt-4 font-semibold tracking-tight">Past Simulations</h2>
      <SimAssignmentTable
        assignments={past}
        emptyMessage="No past scheduled simulations found."
        dateFormat="P"
        actionLabel="Status"
        showDiagnosis={false}
        renderAction={(assignment) => (
          <div className="flex items-center gap-2">
            {assignment.terminalStatus ? (
              <Badge variant="outline" className={TERMINAL_TILE_CLASS[assignment.terminalStatus]}>
                {TERMINAL_TILE_LABEL[assignment.terminalStatus]}
              </Badge>
            ) : (
              <div className="flex gap-12">
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  &gt;24hr past start time
                </Badge>
                <AdminSessionActions assignmentId={assignment.id} />
              </div>
            )}
            <DeleteCaseButton caseId={assignment.id} />
          </div>
        )}
      />
    </div>
  );
}

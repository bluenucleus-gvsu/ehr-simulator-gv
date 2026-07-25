"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import CaseAssignment from "./caseAssignment";
import DeleteCaseButton from "./deleteCaseButton";
import { SimAssignmentTable } from "./simAssignmentTable";
import { getAssignedSimulationLifecycle } from "@/utils/assignedSimulationLifecycle";
import AdminSessionActions from "./adminSessionActions";
import { CasesData, SectionSimulationsData } from "@/actions/cases";
import type { SimAssignment } from "./simAssignmentTypes";

interface CourseAssignmentsClientProps {
  sectionsData: SectionSimulationsData;
  casesData: CasesData;
  courseId: string;
}

export default function CourseAssignmentsClient({
  sectionsData,
  casesData,
}: CourseAssignmentsClientProps) {
  const processedSims = useMemo(() => {
    const base: SimAssignment[] = sectionsData.flatMap((section) =>
      section.section_assignments.map((assignment) => {
        const sessions = Array.isArray(assignment.sessions) ? assignment.sessions : [];
        return {
          id: assignment.id,
          simTime: assignment.sim_time,
          presimTime: assignment.presim_time,
          sessionId: assignment.session_id ?? null,
          sessionStatus: assignment.session_status ?? null,
          sessions: sessions.map((s) => ({
            id: s.id,
            status: s.status,
            groupId: s.group_id,
            currentPhase: s.current_phase,
          })),
          sectionName: section.name,
          sectionId: section.id,
          caseName: assignment.cases.name || "Unknown Case",
          caseId: assignment.cases.id,
          caseDescription: assignment.cases.description || "",
          caseDiagnosis: assignment.cases.admitting_diagnosis || "",
        };
      }),
    );
    return base.reduce<{ completed: SimAssignment[]; assigned: SimAssignment[] }>(
      (acc, item) => {
        const lifecycle = getAssignedSimulationLifecycle({
          simTime: item.simTime,
          presimTime: item.presimTime,
          sessionStatus: item.sessionStatus,
        });
        if (lifecycle.isPastScheduled) {
          acc.completed.push(item);
        } else {
          acc.assigned.push(item);
        }
        return acc;
      },
      { completed: [], assigned: [] },
    );
  }, [sectionsData]);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Assigned Simulations</h2>
          <CaseAssignment
            sections={sectionsData}
            cases={casesData}
            isEditMode={false}
          />
        </div>
        <SimAssignmentTable
          assignments={processedSims.assigned}
          emptyMessage="No upcoming simulations scheduled."
          dateFormat="Pp"
          actionLabel="Actions"
          showDiagnosis={true}
          renderAction={(assignment) => (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <CaseAssignment
                  isEditMode={true}
                  sections={sectionsData}
                  cases={casesData}
                  existing_id={assignment.id}
                  initialData={{
                    sectionId: assignment.sectionId,
                    caseId: assignment.caseId,
                    simTime: assignment.simTime,
                    presimTime: assignment.presimTime,
                  }}
                />
                <AdminSessionActions
                  assignmentId={assignment.id}
                  sessionCount={assignment.sessions?.length ?? 0}
                  sessionId={assignment.sessionId}
                  sessionStatus={assignment.sessionStatus}
                />
              </div>
              {(assignment.sessions?.length ?? 0) > 0 && (
                <div className="flex flex-wrap justify-end gap-1 max-w-xs">
                  {assignment.sessions!.map((session) => (
                    <Badge key={session.id} variant="outline" className="text-[10px]">
                      {(session.status ?? "unknown") +
                        (session.currentPhase != null
                          ? ` · p${session.currentPhase}`
                          : "")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-gray-700">Past Scheduled Simulations</h2>
        <SimAssignmentTable
          assignments={processedSims.completed}
          emptyMessage="No past scheduled simulations found."
          dateFormat="P"
          actionLabel="Status"
          showDiagnosis={false}
          renderAction={(assignment) => (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  Scheduled Time Passed
                </Badge>
                <AdminSessionActions
                  assignmentId={assignment.id}
                  sessionCount={assignment.sessions?.length ?? 0}
                  sessionId={assignment.sessionId}
                  sessionStatus={assignment.sessionStatus}
                />
                <DeleteCaseButton caseId={assignment.id} />
              </div>
              {(assignment.sessions?.length ?? 0) > 0 && (
                <div className="flex flex-wrap justify-end gap-1 max-w-xs">
                  {assignment.sessions!.map((session) => (
                    <Badge key={session.id} variant="outline" className="text-[10px]">
                      {session.status ?? "unknown"}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import CaseAssignment from "./caseAssignment";
import DeleteCaseButton from "./deleteCaseButton";
import { SimAssignmentTable } from "./simAssignmentTable";
import { getAssignedSimulationLifecycle } from "@/utils/assignedSimulationLifecycle";
import AdminSessionActions from "./adminSessionActions";
import { getTesterCases, getTesterSectionAssignments } from "@/utils/testerLocalStore";
import { isTesterModeClient } from "@/utils/testerMode";
import { CasesData, SectionSimulationsData } from "@/actions/cases";
import { getTesterCourseDraft } from "@/utils/testerLocalStore";

interface SimAssignment {
  id: string;
  simTime: string;
  presimTime: string;
  sessionId: string | null;
  sessionStatus: string | null;
  sectionName: string;
  sectionId: string;
  caseName: string;
  caseId: string;
  caseDescription: string;
  caseDiagnosis: string;
}

interface CourseAssignmentsClientProps {
  courseId: string;
  sectionsData: SectionSimulationsData;
  casesData: CasesData;
}

export default function CourseAssignmentsClient({
  courseId,
  sectionsData,
  casesData,
}: CourseAssignmentsClientProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const mergedCasesData = useMemo(() => {
    if (!hydrated || !isTesterModeClient()) return casesData;
    const localCases = getTesterCases<CasesData[number]>();
    const byId = new Map<string, CasesData[number]>();
    [...casesData, ...localCases].forEach((simCase) => byId.set(simCase.id, simCase));
    return Array.from(byId.values());
  }, [casesData, hydrated]);

  const mergedSectionsData = useMemo(() => {
    const localCourseDraft = hydrated && isTesterModeClient()
      ? getTesterCourseDraft<{ sections?: Array<{ id?: string; name: string; meeting_time?: string | null }> }>(courseId)
      : null;
    return localCourseDraft?.sections
      ? [
          ...sectionsData,
          ...localCourseDraft.sections.map((section, index) => ({
            id: section.id ?? `${courseId}-local-section-${index}`,
            name: section.name,
            meeting_time: section.meeting_time ?? null,
            section_assignments: [],
            course_id: courseId,
          })),
        ]
      : sectionsData;
  }, [courseId, sectionsData, hydrated]);

  const processedSims = useMemo(() => {
    const base = sectionsData.flatMap((section) =>
      section.section_assignments.map((assignment) => ({
        id: assignment.id,
        simTime: assignment.sim_time,
        presimTime: assignment.presim_time,
        sessionId: assignment.session_id ?? null,
        sessionStatus: assignment.session_status ?? null,
        sectionName: section.name,
        sectionId: section.id,
        caseName: assignment.cases.name || "Unknown Case",
        caseId: assignment.cases.id,
        caseDescription: assignment.cases.description || "",
        caseDiagnosis: assignment.cases.admitting_diagnosis || "",
      })),
    );

    const local = hydrated && isTesterModeClient()
      ? getTesterSectionAssignments<{
        id: string;
        section_id: string;
        case_id: string;
        sim_time: string;
        presim_time: string;
        session_id?: string | null;
        session_status?: string | null;
      }>(courseId).map((assignment) => {
        const section = mergedSectionsData.find((s) => s.id === assignment.section_id);
        const caseInfo = mergedCasesData.find((c) => c.id === assignment.case_id);
        return {
          id: assignment.id,
          simTime: assignment.sim_time,
          presimTime: assignment.presim_time,
          sessionId: assignment.session_id ?? null,
          sessionStatus: assignment.session_status ?? null,
          sectionName: section?.name ?? "Unknown Section",
          sectionId: assignment.section_id,
          caseName: caseInfo?.name || "Unknown Case",
          caseId: assignment.case_id,
          caseDescription: caseInfo?.description || "",
          caseDiagnosis: caseInfo?.admitting_diagnosis || "",
        };
      })
      : [];

    const merged = new Map<string, SimAssignment>();
    [...base, ...local].forEach((assignment) => merged.set(assignment.id, assignment));

    return Array.from(merged.values()).reduce<{ completed: SimAssignment[]; assigned: SimAssignment[] }>(
      (acc, item) => {
        const lifecycle = getAssignedSimulationLifecycle({ simTime: item.simTime, presimTime: item.presimTime });
        if (lifecycle.isPastScheduled) {
          acc.completed.push(item);
        } else {
          acc.assigned.push(item);
        }
        return acc;
      },
      { completed: [], assigned: [] },
    );
  }, [courseId, sectionsData, casesData, mergedSectionsData, mergedCasesData, hydrated]);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Assigned Simulations</h2>
          <CaseAssignment
            courseId={courseId}
            sections={mergedSectionsData}
            cases={mergedCasesData}
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
            <div className="flex items-center gap-2">
              <CaseAssignment
                courseId={courseId}
                isEditMode={true}
                sections={mergedSectionsData}
                cases={mergedCasesData}
                existing_id={assignment.id}
                initialData={{
                  sectionId: assignment.sectionId,
                  caseId: assignment.caseId,
                  simTime: assignment.simTime,
                  presimTime: assignment.presimTime,
                }}
              />
              <AdminSessionActions sessionId={assignment.sessionId} sessionStatus={assignment.sessionStatus} />
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                Scheduled Time Passed
              </Badge>
              <AdminSessionActions sessionId={assignment.sessionId} sessionStatus={assignment.sessionStatus} />
              <DeleteCaseButton caseId={assignment.id} />
            </div>
          )}
        />
      </div>
    </>
  );
}

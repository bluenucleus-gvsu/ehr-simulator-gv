"use client";

import { useMemo, useState } from "react";
import CaseAssignmentDialog from "./caseAssignment";
import { SimAssignmentTable } from "./simAssignmentTable";
import { getAssignedSimulationLifecycle } from "@/utils/assignedSimulationLifecycle";
import AdminSessionActions from "./completeAssignmentsButton";
import { CasesData, SectionSimulationsData } from "@/actions/cases";
import type { SimAssignment } from "./simAssignmentTypes";
import { CheckedState } from "@radix-ui/react-checkbox";
import { PastSessionTable } from "./pastSessionTable";
import DeleteAssignmentsButton from "./deleteAssignmentsButton";

interface CourseAssignmentsClientProps {
  sectionsData: SectionSimulationsData;
  casesData: CasesData;
}

export default function CourseAssignmentsClient({
  sectionsData,
  casesData,
}: CourseAssignmentsClientProps) {
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>([]);
  const handleCheck = (id: string, isChecked: CheckedState) => {
    if (isChecked && !selectedAssignmentIds.includes(id)) {
      setSelectedAssignmentIds(prev => {
        return [...prev, id];
      })
    } else {
      setSelectedAssignmentIds(prev => {
        return prev.filter(assignmentId => assignmentId != id);
      })
    }
  }

  const clearSelectedAssignments = () => {
    setSelectedAssignmentIds([]);
  }

  const processedSims = useMemo(() => {
    const base = sectionsData.flatMap((section) =>
      section.section_assignments.map((assignment) => ({
        id: assignment.id,
        simTime: assignment.sim_time,
        presimTime: assignment.presim_time,
        sessionStatus: assignment.session_status ?? null,
        sectionName: section.name,
        sectionId: section.id,
        caseName: assignment.cases.name || "Unknown Case",
        caseId: assignment.cases.id,
        caseDescription: assignment.cases.description || "",
        caseDiagnosis: assignment.cases.admitting_diagnosis || "",
      })),
    );
    const { completed, assigned } = base.reduce<{
      completed: SimAssignment[];
      assigned: SimAssignment[];
    }>(
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

    const time = (s: SimAssignment) => new Date(s.simTime).getTime();

    return {
      completed: completed.sort((a, b) => time(b) - time(a)),
      assigned: assigned.sort((a, b) => time(a) - time(b)),
    };
  }, [sectionsData]);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Assigned Simulations</h2>
          <CaseAssignmentDialog
            sections={sectionsData}
            cases={casesData}
            isEditMode={false}
          />
        </div>
        <SimAssignmentTable
          assignments={processedSims.assigned}
          sections={sectionsData}
          cases={casesData}
          showDiagnosis={true}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Past Scheduled Simulations</h2>
          {selectedAssignmentIds.length > 0 &&
            <div className="flex gap-2">
              <AdminSessionActions assignmentIds={selectedAssignmentIds} onSubmit={clearSelectedAssignments} />
              <DeleteAssignmentsButton assignmentIds={selectedAssignmentIds} onSubmit={clearSelectedAssignments} />
            </div>
          }
        </div>
        <PastSessionTable
          assignments={processedSims.completed}
          selectedAssignments={selectedAssignmentIds}
          onCheck={handleCheck}
        />
      </div >
    </>
  );
}

import { getCourseById } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSectionCaseAssignments } from "@/actions/cases";
import CaseAssignment from "./components/caseAssignment";
import { getCaseByCourseId } from "@/actions/cases";
import DeleteCaseButton from "./components/deleteCaseButton";
import { Database } from "../../../../../database.types";
import { SimAssignmentTable } from "./components/simAssignmentTable";


interface CoursePageProps {
  params: { id: string };
}

interface AssignmentGroups {
  completed: SimAssignment[];
  assigned: SimAssignment[];
}

export interface SimAssignment {
  id: string;
  simTime: string;
  presimTime: string;
  sectionName: string;
  sectionId: string;
  caseName: string;
  caseId: string;
  caseDescription: string;
  caseDiagnosis: string;
}

export type Course = Database['public']['Tables']['courses']['Row'];


export default async function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const coursedId = resolvedParams.id

  const [courseResult, sectionsResult, casesResult] = await Promise.all([
    getCourseById(coursedId),
    getSectionCaseAssignments(coursedId),
    getCaseByCourseId(coursedId)
  ]);

  if (!sectionsResult.success || !casesResult.success || !courseResult.success || !courseResult.data) {
    return <div>Error loading data: {sectionsResult.message || casesResult.message || courseResult.message}</div>
  }

  const sectionsData = sectionsResult.data ?? [];
  const casesData = casesResult.data ?? [];
  const courseData = courseResult.data;

  const processedSims = sectionsData.flatMap((section) =>
    section.section_assignments.map((assignment) => {
      return {
        id: assignment.id,
        simTime: assignment.sim_time,
        presimTime: assignment.presim_time,
        sectionName: section.name,
        sectionId: section.id,
        caseName: assignment.cases.name || "Unknown Case",
        caseId: assignment.cases.id,
        caseDescription: assignment.cases.description || '',
        caseDiagnosis: assignment.cases.admitting_diagnosis || ''
      };
    })
  ).reduce<AssignmentGroups>((acc, item) => {
    const scheduledDate = new Date(item.simTime);
    const now = new Date()

    if (scheduledDate < now) {
      acc.completed.push(item);
    } else {
      acc.assigned.push(item);
    }
    return acc;
  }, { completed: [], assigned: [] });

  return (
    <div className="h-screen w-full bg-gray-50/50">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight text-blue-900">
              {courseData.code}
            </h1>
            <p className="text-xs text-gray-500">Manage assigned for cases this course.</p>
          </div>
          <Button>Edit Course</Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
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
              />)}
          />

        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-gray-700">Past Simulations</h2>
          <SimAssignmentTable
            assignments={processedSims.completed}
            emptyMessage="No completed simulations found."
            dateFormat="P"
            actionLabel="Result"
            showDiagnosis={false}
            renderAction={(assignment) => (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  Completed
                </Badge>
                <DeleteCaseButton caseId={assignment.id} />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
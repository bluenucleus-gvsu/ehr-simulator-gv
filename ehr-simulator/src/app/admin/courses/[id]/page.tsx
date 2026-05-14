import { getCourseById } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { getSectionCaseAssignments } from "@/actions/cases";
import { getCaseByCourseId } from "@/actions/cases";
import { Database } from "../../../../../database.types";
import CourseAssignmentsClient from "./components/CourseAssignmentsClient";
import { isTesterModeServer } from "@/utils/testerModeServer";


interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export type Course = Database['public']['Tables']['courses']['Row'];


export default async function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const coursedId = resolvedParams.id
  const testerMode = await isTesterModeServer();

  const [courseResult, sectionsResult, casesResult] = await Promise.all([
    getCourseById(coursedId),
    getSectionCaseAssignments(coursedId),
    getCaseByCourseId()
  ]);

  if (!sectionsResult.success || !casesResult.success || !courseResult.success || (!courseResult.data && !testerMode)) {
    return <div>Error loading data: {sectionsResult.message || casesResult.message || courseResult.message}</div>
  }

  const sectionsData = sectionsResult.data ?? [];
  const casesData = casesResult.data ?? [];
  const courseData = courseResult.data ?? {
    id: coursedId,
    code: "LOCAL TESTER COURSE",
    name: "Tester Local Course",
    active: true,
  } as Course;

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
        <CourseAssignmentsClient
          courseId={coursedId}
          sectionsData={sectionsData}
          casesData={casesData}
        />
      </div>
    </div>
  );
}

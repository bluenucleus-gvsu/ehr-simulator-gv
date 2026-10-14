import { getCourseById } from "@/actions/courses";
import { getSectionCaseAssignments } from "@/actions/cases";
import { getAllCases } from "@/actions/cases";
import { Database } from "../../../../../database.types";
import CourseAssignmentsClient from "./components/CourseAssignmentsClient";


interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export type Course = Database['public']['Tables']['courses']['Row'];


export default async function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const coursedId = resolvedParams.id

  const [courseResult, sectionsResult, casesResult] = await Promise.all([
    getCourseById(coursedId),
    getSectionCaseAssignments(coursedId),
    getAllCases()
  ]);

  if (!sectionsResult.success || !casesResult.success || !courseResult.success || !courseResult.data) {
    return <div>Error loading data: {sectionsResult.message || casesResult.message || courseResult.message}</div>
  }

  const sectionsData = sectionsResult.data ?? { sections: [], assignments: [] };
  const casesData = casesResult.data ?? [];
  const courseData = courseResult.data;

  return (
    <div className="h-screen w-full bg-gray-50/50">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight text-blue-900">
              {courseData.code}
            </h1>
            <p className="text-xs text-gray-500">Manage simulation assignments for this course.</p>
          </div>
          {/* <Button>Edit Course</Button> */}
        </div>
      </header>

      <div className="flex-1 px-8 py-6 space-y-8">
        <CourseAssignmentsClient
          sectionsData={sectionsData}
          casesData={casesData}
        />
      </div>
    </div>
  );
}

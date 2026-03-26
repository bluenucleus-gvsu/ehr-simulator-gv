import { getCourseCaseAssignments } from "@/actions/cases";
import { getAllCourses } from "@/actions/courses";
import CasesClient from "./casesClient";



export default async function CasesPage() {
  const [courseResults, caseAssignmentResults] = await Promise.all([
    getAllCourses(),
    getCourseCaseAssignments()
  ]);

  if (!courseResults.success || !caseAssignmentResults.success) {
    return (
      <div>Failed to fetch simulation cases or corresponding courses.</div>
    )
  }
  const assignments = caseAssignmentResults.data || [];
  const courses = courseResults.data || [];

  return (
    <CasesClient
      courses={courses}
      caseAssignments={assignments}
    />
  );
}

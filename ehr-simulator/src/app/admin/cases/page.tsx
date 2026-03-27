import { getAllSimCases } from "@/actions/cases";
import CasesClient from "./casesClient";



export default async function CasesPage() {
  const caseData = await getAllSimCases();
  // const [courseResults, caseAssignmentResults] = await Promise.all([
  //   getAllCourses(),
  //   getCourseCaseAssignments()
  // ]);

  if (!caseData.success || !caseData.data) {
    return (
      <div>Failed to fetch sim cases.</div>
    )
  }
  const cases = caseData.data || [];

  return (
    <CasesClient
      cases={cases}
    />
  );
}

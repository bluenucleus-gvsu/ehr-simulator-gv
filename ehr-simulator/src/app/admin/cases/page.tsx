import { getAllSimCases } from "@/actions/cases";
import CasesClient from "../components/casesClient";



export default async function CasesPage() {
  const caseData = await getAllSimCases();

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

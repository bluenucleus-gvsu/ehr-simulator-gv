import { getAllSimCases, getTemplates } from "@/actions/cases";
import CasesClient from "./casesClient";

export default async function CasesPage() {
  const [caseData, templates] = await Promise.all([
    getAllSimCases(),
    getTemplates(),
  ]);

  if (!caseData.success || !caseData.data) {
    return <div>Failed to fetch sim cases.</div>;
  }

  return (
    <CasesClient
      cases={caseData.data}
      templates={templates}
    />
  );
}

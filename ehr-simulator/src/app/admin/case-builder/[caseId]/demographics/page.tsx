import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    caseId: string;
  }>;
}

export default async function LegacyCaseBuilderDemographicsPage({ params }: PageProps) {
  const { caseId } = await params;
  redirect(`/admin/case-builder/form/demographics?caseId=${caseId}`);
}

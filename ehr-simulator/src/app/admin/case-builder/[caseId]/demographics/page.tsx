import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

interface PageProps {
  params: Promise<{
    caseId: string;
  }>;
}

export default async function LegacyCaseBuilderDemographicsPage({ params }: PageProps) {
  const { caseId } = await params;

  redirect(routes.admin.caseBuilder.form.getHref("demographics", caseId));
}

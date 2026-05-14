import { VitalsOverview } from "./vitalsOverview";

interface VitalsOverviewContainerProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

export default async function VitalsOverviewContainer({ params }: VitalsOverviewContainerProps) {
  await params;
  return <VitalsOverview />;
}
import MediaView from "./components/mediaView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

const media = async ({ params }: PageProps) => {
  const { caseId, sessionId } = await params;
  return <MediaView caseId={caseId} sessionId={sessionId} />;
}

export default media;
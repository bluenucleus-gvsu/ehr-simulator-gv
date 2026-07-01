import { getMedia } from "@/actions/simulation";
import MediaView from "./components/mediaView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

const media = async ({ params }: PageProps) => {
    const { caseId, sessionId } = await params;
    const images = await getMedia(caseId)


    return(
        <MediaView
        isError = {false}
        isLoading={false}
        images={images.data || []}
        caseId={caseId}
        sessionId={sessionId}
        />
    )
}

export default media;
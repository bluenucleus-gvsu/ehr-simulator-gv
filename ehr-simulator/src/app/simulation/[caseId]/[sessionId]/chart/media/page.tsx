import { getMedia } from "@/actions/simulation";
import MediaView from "./components/mediaView";

interface PageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

const media = async ({ params }: PageProps) => {
    const { caseId } = await params;
    const images = await getMedia(caseId)


    return(
        <MediaView
        isError = {false}
        isLoading={false}
        images={images.data || []}
        />
    )
}

export default media;
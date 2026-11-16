"use client";

import { useEffect, useState } from "react";
import { getMedia } from "@/actions/simulation";
import { useSimSessionContext } from "@/context/SimSessionContext";

interface MediaViewProps {
  caseId: string;
  sessionId: string;
}

export default function MediaView({ caseId, sessionId }: Readonly<MediaViewProps>) {
  const { isPresim, releasedItems } = useSimSessionContext();
  const mediaReleases = releasedItems.case_image_releases;
  const [images, setImages] = useState<{ id: string; preview_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMedia = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getMedia(caseId, sessionId, Boolean(isPresim));
        if (!active) return;
        if (!result.success) {
          setImages([]);
          setError(result.message || "Error loading images.");
        } else {
          setImages(result.data ?? []);
        }
      } catch (loadError) {
        console.error("Failed to load session media:", loadError);
        if (active) {
          setImages([]);
          setError(loadError instanceof Error ? loadError.message : "Error loading images.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadMedia();
    return () => {
      active = false;
    };
  }, [caseId, sessionId, isPresim, mediaReleases]);

  if (loading) {
    return <div className="flex h-full min-h-0 w-full items-center justify-center bg-gray-100 px-4">Loading...</div>;
  }
  if (error) {
    return <div role="alert" className="flex h-full min-h-0 w-full items-center justify-center bg-gray-100 px-4 text-red-600">{error}</div>;
  }
  if (images.length === 0) {
    return <div className="flex h-full min-h-0 w-full items-center justify-center bg-gray-100 px-4 text-center text-gray-500">No images available to this session.</div>;
  }

  return (
    <div className="h-full min-h-0 w-full overflow-y-auto bg-gray-100 p-4">
      <div className="flex flex-col gap-4 pt-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="mx-auto mb-4 w-full max-w-2xl overflow-hidden rounded-lg border bg-slate-100"
          >
            <img
              src={image.preview_url}
              alt="Case media"
              className="block max-h-80 w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
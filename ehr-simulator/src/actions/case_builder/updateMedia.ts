"use server"

import type { SupabaseClient } from "@supabase/supabase-js";

type MediaImagePayload = {
  previewUrl?: string | null;
  file?: File | null;
  storagePath?: string | null;
} | string;

export async function updateMedia(
  supabase: SupabaseClient,
  payload: MediaImagePayload[] | MediaImagePayload,
  caseId?: string | null,
) {
  if (!caseId) throw new Error("Case ID is required");

  const payloadItems = Array.isArray(payload) ? payload : [payload];
  const images = payloadItems
    .map((item) => (typeof item === "string" ? { previewUrl: item } : item))
    .filter((item) => Boolean(item?.previewUrl || item?.file || item?.storagePath));

  const { data: existingRows, error: existingError } = await supabase
    .from("case_images")
    .select("file_path")
    .eq("case_id", caseId);
  if (existingError) throw new Error(existingError.message);

  const uploadedPaths: string[] = [];
  const rows: { preview_url: string; file_path: string | null }[] = [];

  try {
    for (const image of images) {
      let previewUrl = image.previewUrl?.trim() || null;
      let filePath = image.storagePath?.trim() || null;

      if (image.file) {
        const safeName = image.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${caseId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("case-media")
          .upload(path, image.file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        uploadedPaths.push(path);
        const { data: urlData } = supabase.storage.from("case-media").getPublicUrl(path);
        previewUrl = urlData.publicUrl;
        filePath = path;
      }

      if (!previewUrl) throw new Error("Every image must have a file or preview URL.");
      rows.push({ preview_url: previewUrl, file_path: filePath });
    }

    const { error } = await supabase.rpc("case_builder_replace_media", {
      p_case_id: caseId,
      p_rows: rows,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const cleanup = await supabase.storage.from("case-media").remove(uploadedPaths);
      if (cleanup.error) console.error("Failed to roll back case media uploads", cleanup.error);
    }
    throw error;
  }

  const retainedPaths = new Set(rows.map((row) => row.file_path).filter(Boolean));
  const removedPaths = (existingRows ?? [])
    .map((row) => row.file_path)
    .filter((path): path is string => Boolean(path && !retainedPaths.has(path)));
  if (removedPaths.length > 0) {
    const cleanup = await supabase.storage.from("case-media").remove(removedPaths);
    if (cleanup.error) console.error("Failed to remove replaced case media", cleanup.error);
  }

  return {
    success: true,
    data: rows.map((row) => ({
      id: row.file_path ?? row.preview_url,
      previewUrl: row.preview_url,
      storagePath: row.file_path ?? undefined,
    })),
  };
}

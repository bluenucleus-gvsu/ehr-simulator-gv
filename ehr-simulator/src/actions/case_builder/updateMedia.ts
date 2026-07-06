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
  caseId?: string | null
) {
  const payloadItems = Array.isArray(payload) ? payload : [payload];
  const images = payloadItems
    .map((item) => (typeof item === "string" ? { previewUrl: item } : item))
    .filter(
      (item): item is { previewUrl?: string | null; file?: File | null; storagePath?: string | null } =>
        Boolean(item?.previewUrl || item?.file),
    );

  if (!caseId) {
    throw new Error("Case ID is required");
  }

  if (images.length === 0) {
    return { success: true, data: [] };
  }

  const rows = await Promise.all(
    images.map(async (image) => {
      let previewUrl = image.previewUrl ?? null;
      let filePath = image.storagePath ?? null;

      if (image.file) {
        const path = `${caseId}/${crypto.randomUUID()}-${image.file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from("case-media")
          .upload(path, image.file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = await supabase
          .storage
          .from("case-media")
          .getPublicUrl(path);

        previewUrl = urlData.publicUrl;
        filePath = path;
      }

      if (!previewUrl) {
        throw new Error("Image file or URL is required");
      }

      return {
        case_id: caseId,
        preview_url: previewUrl,
        file_path: filePath,
      };
    }),
  );

  const { error: deleteError } = await supabase
    .from("case_images")
    .delete()
    .eq("case_id", caseId);

  if (deleteError) {
    throw deleteError;
  }

  const { data, error } = await supabase
    .from("case_images")
    .insert(rows)
    .select("*");

  if (error) {
    throw error;
  }

  return { success: true, data };
}
"use server"

import type { SupabaseClient } from "@supabase/supabase-js";

type MediaImagePayload = { previewUrl?: string | null } | string;

export async function updateMedia(
  supabase: SupabaseClient,
  payload: MediaImagePayload[] | MediaImagePayload | any,
  caseId?: string | null
) {
  const payloadItems = Array.isArray(payload) ? payload : [payload];
  const images = payloadItems
    .map((item) => (typeof item === "string" ? { previewUrl: item } : item))
    .filter((item): item is { previewUrl: string } => Boolean(item?.previewUrl));

  if (!caseId) {
    throw new Error("Case ID is required");
  }

  if (images.length === 0) {
    return { success: true, data: [] };
  }

  const rows = images.map(({ previewUrl }) => ({
    case_id: caseId,
    preview_url: previewUrl,
  }));

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
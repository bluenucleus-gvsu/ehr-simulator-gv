"use server"

import type { SupabaseClient } from "@supabase/supabase-js";

type MediaImagePayload = {
  id?: string;
  previewUrl?: string | null;
  file?: File | null;
  storagePath?: string | null;
  title?: string | null;
  description?: string | null;
  timeOffset?: number | null;
  department?: string | null;
  phase?: number;
  isInPresim?: boolean;
} | string;

async function saveMediaRows(
  supabase: SupabaseClient,
  payload: MediaImagePayload[] | MediaImagePayload,
  caseId?: string | null,
  mode: "replace" | "append" = "replace",
) {
  if (!caseId) throw new Error("Case ID is required");

  const payloadItems = Array.isArray(payload) ? payload : [payload];
  const images = payloadItems
    .map((item) => (typeof item === "string" ? { previewUrl: item } : item))
    .filter((item) => Boolean(item?.previewUrl || item?.file || item?.storagePath));

  let existingRows: { file_path: string | null }[] = [];
  if (mode === "replace") {
    const { data, error } = await supabase
      .from("case_images")
      .select("file_path")
      .eq("case_id", caseId);
    if (error) throw new Error(error.message);
    existingRows = data ?? [];
  }

  const uploadedPaths: string[] = [];
  const rows: {
    id?: string;
    preview_url: string;
    file_path: string | null;
    title: string | null;
    description: string | null;
    time_offset: number | null;
    department: string | null;
    phase: number;
    is_in_presim: boolean;
  }[] = [];

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
      const phase = image.phase ?? 1;
      rows.push({
        ...(mode === "append" && image.id ? { id: image.id } : {}),
        preview_url: previewUrl,
        file_path: filePath,
        title: image.title?.trim() || null,
        description: image.description?.trim() || null,
        time_offset: phase > 1 ? null : image.timeOffset ?? null,
        department: image.department?.trim() || null,
        phase,
        is_in_presim: image.isInPresim ?? true,
      });
    }

    if (mode === "append") {
      const { error } = await supabase.from("case_images").insert(rows);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.rpc("case_builder_replace_media", {
        p_case_id: caseId,
        p_rows: rows,
      });
      if (error) throw new Error(error.message);
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const cleanup = await supabase.storage.from("case-media").remove(uploadedPaths);
      if (cleanup.error) console.error("Failed to roll back case media uploads", cleanup.error);
    }
    throw error;
  }

  const retainedPaths = new Set(rows.map((row) => row.file_path).filter(Boolean));
  const removedPaths = mode === "replace"
    ? existingRows
      .map((row) => row.file_path)
      .filter((path): path is string => Boolean(path && !retainedPaths.has(path)))
    : [];
  if (removedPaths.length > 0) {
    const cleanup = await supabase.storage.from("case-media").remove(removedPaths);
    if (cleanup.error) console.error("Failed to remove replaced case media", cleanup.error);
  }

  return {
    success: true,
    data: rows.map((row) => ({
      id: mode === "append" ? row.id ?? row.file_path ?? row.preview_url : row.file_path ?? row.preview_url,
      previewUrl: row.preview_url,
      title: row.title ?? "Untitled media",
      description: row.description ?? "",
      timeOffset: row.time_offset,
      department: row.department ?? "",
      phase: row.phase,
      isInPresim: row.is_in_presim,
      storagePath: row.file_path ?? undefined,
    })),
  };
}

export async function updateMedia(
  supabase: SupabaseClient,
  payload: MediaImagePayload[] | MediaImagePayload,
  caseId?: string | null,
) {
  return saveMediaRows(supabase, payload, caseId);
}

export async function addMedia(
  supabase: SupabaseClient,
  payload: MediaImagePayload[] | MediaImagePayload,
  caseId?: string | null,
) {
  return saveMediaRows(supabase, payload, caseId, "append");
}

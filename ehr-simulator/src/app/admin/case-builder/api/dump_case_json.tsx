"use server";

import { createServiceRoleSupabase } from "@/utils/supabase/service"

export async function saveCaseJsonBlob(payload: any, title?: string) {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from("cases_json_blobs")
    .insert([
      {
        payload: JSON.stringify(payload),
        title: title ?? "Untitled Case",
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Failed to save case JSON blob");
  }
  return data;
}

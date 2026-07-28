"use server";

import { createClient } from "@supabase/supabase-js"

export async function saveCaseJsonBlob(payload: any, title?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

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

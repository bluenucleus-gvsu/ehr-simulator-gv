"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { transformDocumentationTableToSchema } from "@/lib/documentationTypes";
import { DatabaseDocumentationInsert } from "../simulation";

const MISSING_COLUMN_PATTERN = /Could not find the '([^']+)' column/;

function stripColumnFromRows(
  rows: DatabaseDocumentationInsert[],
  column: string,
): DatabaseDocumentationInsert[] {
  return rows.map((row) => {
    const copy = { ...row } as Record<string, unknown>;
    delete copy[column];
    return copy as DatabaseDocumentationInsert;
  });
}

async function insertDocumentationResultsWithSchemaFallback(
  supabase: SupabaseClient,
  rows: DatabaseDocumentationInsert[],
) {
  if (rows.length === 0) return [];

  let payload = rows;
  const maxAttempts = 24;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await supabase
      .from("documentation_results")
      .insert(payload)
      .select("id, case_id, time_offset");

    if (!error) return data ?? [];

    const match = error.message.match(MISSING_COLUMN_PATTERN);
    if (match?.[1]) {
      payload = stripColumnFromRows(payload, match[1]);
      continue;
    }

    throw new Error(error.message);
  }

  throw new Error("Could not save charting: too many schema mismatches with documentation_results.");
}

export async function updateDocumentationResults(
  supabase: SupabaseClient,
  payload: any,
  caseId: string,
) {
  const documentationResults = transformDocumentationTableToSchema(caseId, {
    data: payload.data ?? [],
    timePoints: payload.timePoints ?? [],
    timePointsInPreSim: new Set(payload.timePointsInPreSim ?? []),
  });

  await deleteDocumentationResults(supabase, caseId);
  return await insertDocumentationResultsWithSchemaFallback(supabase, documentationResults);
}

async function deleteDocumentationResults(supabase: SupabaseClient, caseId: string) {
  const { error: delErr } = await supabase
    .from("documentation_results")
    .delete()
    .eq("case_id", caseId);
  if (delErr) throw new Error(delErr.message);
}

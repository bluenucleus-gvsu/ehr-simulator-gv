import { SupabaseClient } from "@supabase/supabase-js"
import type { DemographicFormData } from "@/utils/form"

export async function upsertCaseDemographics(
  supabase: SupabaseClient,
  payload: DemographicFormData,
  caseId?: string | null
) {
  const d = payload

  const relationship_status_id = await resolveRelationshipStatusId(
    supabase,
    d.relationshipStatus,
  )
  const isolation_precautions_id = await resolveLookupId(
    supabase,
    "isolation_precautions",
    d.precautions,
  )
  const now = new Date().toISOString()
  const row = {
    ...(caseId ? { id: caseId } : {}),
    name: "Case " + d.firstName + " " + d.lastName,
    age: d.age,
    description: d.summary,
    first_name: d.firstName,
    last_name: d.lastName,
    code_status: d.codeStatus || null,
    height_ft: toNumeric(d.heightFeet),
    height_in: toNumeric(d.heightInches),
    weight_kg: toNumeric(d.dosingWeight),
    language: d.language ?? null,
    insurance: d.insurance || null,
    employment: d.employment ?? null,
    religion: d.religion ?? null,
    isolation_precautions_id,
    relationship_status_id,
    requires_interpreter: Boolean(d.needsInterpreter),
    admitting_diagnosis: d.admittingDiagnosis ?? null,
    attending_provider: [d.attendingProviderTitle, d.attendingProviderName]
      .map((part: unknown) => String(part ?? "").replace(/,+$/g, "").trim())
      .filter(Boolean)
      .join(" ") || null,
    phase_count: Number(d.phaseCount ?? 1),
    emergency_contact_name: d.contact ?? null,
    emergency_contact_relationship: d.contactRelationship ?? null,
    emergency_contact_phone: (d.contactPhone ?? "").trim() || null,
    updated_at: now,
    ...(!caseId ? { created_at: now } : {}),
  };

  const { data, error } = await supabase
    .from("cases")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
}

async function resolveRelationshipStatusId(
  supabase: SupabaseClient,
  name: string | null | undefined,
): Promise<string | null> {
  return resolveLookupId(supabase, "relationship_statuses", name)
}

async function resolveLookupId(
  supabase: SupabaseClient,
  table: "relationship_statuses" | "isolation_precautions",
  name: string | null | undefined,
): Promise<string | null> {
  const n = (name ?? "").trim()
  if (!n) return null
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("name", n)
    .maybeSingle()
  if (error) {
    throw new Error(`Failed to resolve ${table}: ${error.message}`)
  }
  if (!data?.id) throw new Error(`Unknown ${table.replaceAll("_", " ")} value: ${n}`)
  return data.id
}

function toNumeric(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

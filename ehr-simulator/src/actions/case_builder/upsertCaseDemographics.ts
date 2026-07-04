import { SupabaseClient } from "@supabase/supabase-js"

export async function upsertCaseDemographics(
  supabase: SupabaseClient,
  payload: any,
  caseId?: string | null
) {
  const d = payload

  const relationship_status_id = await resolveRelationshipStatusId(
    supabase,
    d.relationshipStatus,
  )
  const row = {
    ...(caseId ? { id: caseId } : {}),
    name: "Case " + d.firstName + " " + d.lastName,
    age: d.age,
    description: d.summary,
    first_name: d.firstName,
    last_name: d.lastName,
    code_status: d.codeStatus || null,  // Nullish coallescing operator will pass through empty strings which is not a valid member of our code_status enum
    height_ft: toNumeric(d.heightFeet),
    height_in: toNumeric(d.heightInches),
    weight_kg: toNumeric(d.dosingWeight),
    language: d.language ?? null,
    insurance: d.insurance || null,
    employment: d.employment ?? null,
    religion: d.religion ?? null,
    relationship_status_id,
    requires_interpreter: Boolean(d.needsInterpreter),
    admitting_diagnosis: d.admittingDiagnosis ?? null,
    attending_provider: [d.attendingProviderName, d.attendingProviderTitle].filter(Boolean).join(", ") || null,
    emergency_contact_name: d.contact ?? null,
    emergency_contact_relationship: d.contactRelationship ?? null,
    emergency_contact_phone: (d.contactPhone ?? "").trim() || null,
    updated_at: new Date().toISOString(),
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
  const n = (name ?? "").trim()
  if (!n) return null
  const { data, error } = await supabase
    .from("relationship_statuses")
    .select("id")
    .eq("name", n)
    .maybeSingle()
  if (error) {
    console.error("relationship_statuses lookup failed", error)
    return null
  }
  return data?.id ?? null
}

function toNumeric(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}


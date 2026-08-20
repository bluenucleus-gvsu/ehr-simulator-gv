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
    description: d.summary,
    first_name: d.firstName,
    last_name: d.lastName,
    date_of_birth: computeDob(d),
    code_status: d.codeStatus ?? null,
    height_ft: toNumeric(d.heightFeet),
    height_in: toNumeric(d.heightInches),
    weight_kg: toNumeric(d.dosingWeight),
    language: d.language ?? null,
    insurance: d.insurance ?? null,
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
    inpatient_duration_days: toNumeric(d.admissionDateOffest),
    time_of_admission: d.admissionTime,
    emergency_contact_name: d.contact ?? null,
    emergency_contact_relationship: d.contactRelationship ?? null,
    emergency_contact_phone: (d.contactPhone ?? "").trim() || null,
    case_creation_complete: false,
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

/**
 * Build ISO date (yyyy-mm-dd) from month, day, and stated age.
 * Birth year is chosen so calendar age on **today** matches `age` (accounts for
 * "birthday not yet this year" — avoids year = currentYear - age alone, which
 * produced wrong DOBs like 2000-10-14 when the patient should read as `age` now).
 */
function computeDob(d: DemographicFormData) {
  const day = Number(d?.DOBDay);
  if (!Number.isFinite(day) || day <= 0) return null;

  const month = monthToNumber(d?.DOBMonth);
  const targetAge = Number(d?.age);
  if (!Number.isFinite(targetAge) || targetAge < 0) return null;

  const today = new Date();
  let birthYear = today.getFullYear() - targetAge;
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
  if (today < birthdayThisYear) {
    birthYear -= 1;
  }

  const parsedDob = new Date(birthYear, month - 1, day);
  if (
    parsedDob.getFullYear() !== birthYear ||
    parsedDob.getMonth() !== month - 1 ||
    parsedDob.getDate() !== day
  ) {
    throw new Error("Invalid date of birth.");
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${birthYear}-${mm}-${dd}`;
}

function toNumeric(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function monthToNumber(monthName?: string) {
  const m = (monthName ?? "").trim().toLowerCase();
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const idx = months.indexOf(m);
  if (idx < 0) throw new Error("Invalid birth month.");
  return idx + 1;
}

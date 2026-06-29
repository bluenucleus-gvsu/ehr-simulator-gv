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
    description: d.summary,
    first_name: d.firstName,
    last_name: d.lastName,
    date_of_birth: computeDob(d),
    code_status: requiredEnum(d.codeStatus, "Full"),
    height_ft: toNumeric(d.heightFeet),
    height_in: toNumeric(d.heightInches),
    weight_kg: toNumeric(d.dosingWeight),
    language: emptyToNull(d.language),
    insurance: optionalEnum(d.insurance),
    employment: emptyToNull(d.employment),
    religion: emptyToNull(d.religion),
    relationship_status_id,
    requires_interpreter: Boolean(d.needsInterpreter),
    admitting_diagnosis: d.admittingDiagnosis ?? null,
    attending_provider: [d.attendingProviderName, d.attendingProviderTitle].filter(Boolean).join(", ") || null,
    inpatient_duration_days: toNumeric(d.admissionDateOffest),
    time_of_admission: emptyToNull(d.admissionTime),
    emergency_contact_name: emptyToNull(d.contact),
    emergency_contact_relationship: emptyToNull(d.contactRelationship),
    emergency_contact_phone: (d.contactPhone ?? "").trim() || null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(), // Fix: check if exists before setting created_at
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

/**
 * Build ISO date (yyyy-mm-dd) from month, day, and stated age.
 * Birth year is chosen so calendar age on **today** matches `age` (accounts for
 * "birthday not yet this year" — avoids year = currentYear - age alone, which
 * produced wrong DOBs like 2000-10-14 when the patient should read as `age` now).
 */
function computeDob(d: any) {
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

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${birthYear}-${mm}-${dd}`;
}

function toNumeric(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function emptyToNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

/** Postgres enums reject ""; nullable enum columns should use null when unset. */
function optionalEnum(value: unknown): string | null {
  return emptyToNull(value);
}

/** NOT NULL enum columns need a valid value when the form field is blank. */
function requiredEnum(value: unknown, fallback: string): string {
  return emptyToNull(value) ?? fallback;
}

function monthToNumber(monthName?: string) {
  const m = (monthName ?? "").trim().toLowerCase();
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const idx = months.indexOf(m);
  return idx >= 0 ? idx + 1 : 1;
}

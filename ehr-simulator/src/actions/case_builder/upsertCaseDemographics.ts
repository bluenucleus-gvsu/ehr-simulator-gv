import { SupabaseClient } from "@supabase/supabase-js"

export async function upsertCaseDemographics(
  supabase: SupabaseClient,
  payload: any,
  caseId?: string | null
) {
  const d = payload

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
    //insurance
    employment: d.employment ?? null,
    religion: d.religion ?? null,
    requires_interpreter: Boolean(d.needsInterpreter),
    admitting_diagnosis: d.admittingDiagnosis ?? null,
    attending_provider: [d.attendingProviderName, d.attendingProviderTitle].filter(Boolean).join(" ") || null,
    inpatient_duration_days: toNumeric(d.admissionDateOffest),
    time_of_admission: d.admissionTime,
    emergency_contact_name: d.contact ?? null,
    emergency_contact_relationship: d.contactRelationship ?? null,
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

function computeDob(d: any) {
  const day = Number(d?.DOBDay);
  if (!Number.isFinite(day) || day <= 0) return null;

  const month = monthToNumber(d?.DOBMonth);
  const age = Number(d?.age);
  const year = new Date().getFullYear() - (Number.isFinite(age) ? age : 0);

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function toNumeric(v: any): number | null {
  if (v === null || v === undefined) return null;
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
  return idx >= 0 ? idx + 1 : 1;
}

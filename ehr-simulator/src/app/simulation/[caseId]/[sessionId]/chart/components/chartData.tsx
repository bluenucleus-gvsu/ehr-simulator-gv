import { differenceInYears, format, isValid, parseISO, startOfDay, subDays } from "date-fns";

export interface StringValueItem {
  label: string;
  id: string;
  value: string;
}

export interface StringArrayValueItem {
  label: string;
  id: "allergies" | "immunizations" | "pmh" | "surgicalHistory";
  value: string[];
}

export interface NumericValueItem {
  label: string;
  id: string
  value: number;
}

interface IsolationItem extends StringValueItem {
  id: 'isolation';
  tooltip: string;
}

export interface ContactItem {
  id: 'supportPersons';
  label: 'Support Persons';
  value: Contact[]
}

export interface Contact {
  name: string;
  relationship: string;
  phone: string;
}

// all general info that a patient will have, only some of it is useful, the rest
// just provides a sense of completeness/fidelity
export interface ChartData {
  // Identifiers
  name: StringValueItem;
  gender: StringValueItem;
  /** Calendar age in years (from case DOB to reference time), 0 if DOB missing */
  age: NumericValueItem;
  /** Formatted date of birth from `cases.date_of_birth` */
  dob: StringValueItem;
  /** Internal case UUID — there is no separate MRN column in the DB; label shown as “Case ID”. */
  mrn: StringValueItem;
  code: StringValueItem;
  /** Admission date/time from inpatient day offset + `time_of_admission` */
  admissionDate: StringValueItem;
  location: StringValueItem;


  // Clinical Info
  isolation: IsolationItem;
  allergies: StringArrayValueItem;
  immunizations: StringArrayValueItem;
  attending: StringValueItem;
  pmh: StringArrayValueItem;
  surgicalHistory: StringArrayValueItem;
  height: StringValueItem;
  weight: StringValueItem;


  // Social and demographic data
  relationshipStatus: StringValueItem;
  employmentStatus: StringValueItem;
  insurance: StringValueItem;
  language: StringValueItem;
  religion: StringValueItem;
  supportPersons: ContactItem;
  veteranStatus: StringValueItem;
  pronouns: StringValueItem;
  sexAtBirth: StringValueItem;
  genderIdentity: StringValueItem;
  ethnicity: StringValueItem;

}

function stringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }
  const value = String(raw ?? "").trim();
  return value ? [value] : [];
}

function formatHeight(heightFt: unknown, heightIn: unknown): string {
  const feet = String(heightFt ?? "").trim();
  const inches = String(heightIn ?? "").trim();
  if (feet && inches) return `${feet}'${inches}"`;
  if (feet) return `${feet}'`;
  if (inches) return `${inches}"`;
  return "N/A";
}

function formatWeight(weightKg: unknown): string {
  const value = String(weightKg ?? "").trim();
  return value ? `${value} kg` : "N/A";
}

function valueFromJoinedName(raw: unknown): string {
  if (Array.isArray(raw)) {
    const first = raw[0] as { name?: string } | undefined;
    return first?.name?.trim() || "None";
  }
  if (raw && typeof raw === "object") {
    return String((raw as { name?: string }).name ?? "").trim() || "N/A";
  }
  return "None";
}

export type BuildChartDataOptions = {
  /** Age and admission are anchored to this instant (use simulation start when available). */
  referenceTime?: Date;
};

function applyTimeOfAdmission(day: Date, timeRaw: string): Date {
  const t = timeRaw.trim();
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t);
  const out = new Date(day);
  if (!m) {
    out.setHours(0, 0, 0, 0);
    return out;
  }
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    out.setHours(0, 0, 0, 0);
    return out;
  }
  out.setHours(hh, mm, 0, 0);
  return out;
}

export function buildChartDataFromCaseRow(
  caseRow: Record<string, unknown> | null | undefined,
  options?: BuildChartDataOptions,
): ChartData {
  const ref = options?.referenceTime ?? new Date();

  const firstName = String(caseRow?.first_name ?? "").trim();
  const lastName = String(caseRow?.last_name ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown Patient";

  const dobRaw = String(caseRow?.date_of_birth ?? "").trim();
  let dobDate: Date | null = null;
  if (dobRaw) {
    const d = parseISO(dobRaw.length >= 10 ? dobRaw.slice(0, 10) : dobRaw);
    if (isValid(d)) dobDate = d;
  }
  const ageYears = dobDate != null ? differenceInYears(ref, dobDate) : 0;
  const dobDisplay = dobDate != null ? format(dobDate, "P") : "—";

  const daysIp = Number(caseRow?.inpatient_duration_days ?? 0) || 0;
  const admissionDay = startOfDay(subDays(ref, daysIp));
  const admissionWithTime = applyTimeOfAdmission(
    admissionDay,
    String(caseRow?.time_of_admission ?? ""),
  );
  const admissionDisplay = format(admissionWithTime, "P p");

  const caseIdStr = String(caseRow?.id ?? "").trim();

  const supportPersons = String(caseRow?.emergency_contact_name ?? "").trim()
    ? [{
      name: String(caseRow?.emergency_contact_name ?? "").trim(),
      relationship: String(caseRow?.emergency_contact_relationship ?? "").trim() || "Unknown",
      phone: String(caseRow?.emergency_contact_phone ?? "").trim() || "",
    }]
    : [];

  return {
    name: { id: "name", label: "Name", value: fullName },
    gender: { id: "gender", label: "Gender", value: String(caseRow?.gender ?? "").trim() || "N/A" },
    age: { id: "age", label: "Age", value: ageYears },
    dob: { id: "dob", label: "DOB", value: dobDisplay },
    mrn: {
      id: "caseId",
      label: "Case ID",
      value: caseIdStr || "—",
    },
    code: { id: "code", label: "Code Status", value: String(caseRow?.code_status ?? "").trim() || "N/A" },
    admissionDate: { id: "admission", label: "Admission Date", value: admissionDisplay },
    pronouns: { id: "pronouns", label: "Pronouns", value: String(caseRow?.pronouns ?? "").trim() || "N/A" },
    sexAtBirth: { id: "sexAtBirth", label: "Sex Assigned at Birth", value: String(caseRow?.sex_at_birth ?? "").trim() || "N/A" },
    genderIdentity: { id: "genderIdentity", label: "Gender Identity", value: String(caseRow?.gender_identity ?? "").trim() || "N/A" },
    ethnicity: { id: "ethnicity", label: "Ethnicity", value: String(caseRow?.ethnicity ?? "").trim() || "N/A" },
    location: { id: "location", label: "Location", value: "Simulation Suite" },
    isolation: {
      id: "isolation",
      label: "Isolation",
      value: valueFromJoinedName(caseRow?.isolation_precautions),
      tooltip: valueFromJoinedName(caseRow?.isolation_precautions),
    },
    allergies: { id: "allergies", label: "Allergies", value: stringList(caseRow?.allergies) },
    immunizations: { id: "immunizations", label: "Immunizations", value: [] },
    attending: { id: "attending", label: "Attending Provider", value: String(caseRow?.attending_provider ?? "").trim() || "" },
    pmh: { id: "pmh", label: "Past Medical History", value: stringList(caseRow?.medical_history) },
    surgicalHistory: {
      id: "surgicalHistory",
      label: "Surgical History",
      value: stringList(caseRow?.surgical_history),
    },
    height: { id: "height", label: "Height", value: formatHeight(caseRow?.height_ft, caseRow?.height_in) },
    weight: { id: "weight", label: "Weight", value: formatWeight(caseRow?.weight_kg) },
    relationshipStatus: { id: "maritalStatus", label: "Relationship Status", value: valueFromJoinedName(caseRow?.relationship_status) },
    employmentStatus: { id: "employmentStatus", label: "Employment", value: String(caseRow?.employment ?? "").trim() || "N/A" },
    insurance: { id: "insurance", label: "Insurance", value: String(caseRow?.insurance ?? "").trim() || "N/A" },
    language: { id: "language", label: "Language", value: String(caseRow?.language ?? "").trim() || "N/A" },
    religion: { id: "religion", label: "Religion", value: String(caseRow?.religion ?? "").trim() || "N/A" },
    supportPersons: { id: "supportPersons", label: "Support Persons", value: supportPersons },
    veteranStatus: { id: "veteranStatus", label: "Veteran Status", value: String(caseRow?.veteran_status ?? "").trim() || "N/A" },
  };
}


export const jamesAllen: ChartData = {
  name: { id: 'name', label: "Name", value: "Harold Adams" },
  gender: { id: 'gender', label: "Gender", value: "Male" },
  age: { id: "age", label: "Age", value: 72 },
  dob: { id: "dob", label: "DOB", value: "04/04/1954" },
  mrn: { id: "caseId", label: "Case ID", value: "00000000-0000-0000-0000-000000056743" },
  code: { id: "code", label: "Code", value: "Full" },
  admissionDate: { id: "admission", label: "Admission Date", value: "04/02/2026, 7:15 AM" },
  pronouns: { id: "pronouns", label: "Pronouns", value: "He/Him" },
  sexAtBirth: { id: 'sexAtBirth', label: "Sex Assigned at Birth", value: "Male" },
  genderIdentity: { id: 'genderIdentity', label: "Gender Identity", value: "Male" },
  ethnicity: { id: "ethnicity", label: "Ethnicity", value: "" },
  location: { id: "location", label: "Location", value: "CHS Sim Lab" },

  isolation: { id: 'isolation', label: "Isolation", value: "None", tooltip: 'Contact Precautions: Use gloves and gown when entering the patient’s room' }, // TODO: Come back to this
  allergies: { id: 'allergies', label: "Allergies", value: ["Seasonal Allergies"] },
  immunizations: { id: 'immunizations', label: "Immunizations", value: [""] },
  attending: { id: 'attending', label: "Attending Provider", value: "Dr. David Adler, MD" },
  pmh: {
    id: 'pmh', label: "Past Medical History", value: [
      "Hypertension",
      "GERD"
    ]
  },
  surgicalHistory: {
    id: "surgicalHistory",
    label: "Surgical History",
    value: ["Cholecystectomy 2018"],
  },
  height: { id: "height", label: "Height", value: '6\'4\"' },
  weight: { id: "weight", label: "Weight", value: "94kg" },

  relationshipStatus: { id: 'maritalStatus', label: "Relationship Status", value: "Married" },
  employmentStatus: { id: 'employmentStatus', label: "Employment", value: "Retired School Teacher" },
  insurance: { id: 'insurance', label: "Insurance", value: "Medicare" },
  language: { id: 'language', label: "Language", value: "English" },
  religion: { id: "religion", label: "Religion", value: "None" },
  supportPersons: {
    id: 'supportPersons',
    label: "Support Persons",
    value: [
      { name: "Linda Adams", relationship: "Spouse", phone: "" },
    ]
  },
  veteranStatus: { id: 'veteranStatus', label: "Veteran Status", value: "No" }
};

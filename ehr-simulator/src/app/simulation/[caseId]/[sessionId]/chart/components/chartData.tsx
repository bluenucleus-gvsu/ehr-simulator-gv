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

export interface ChartData {
  name: StringValueItem;
  age: StringValueItem;
  code: StringValueItem;
  location: StringValueItem;

  isolation: IsolationItem;
  allergies: StringArrayValueItem;
  immunizations: StringArrayValueItem;
  attending: StringValueItem;
  pmh: StringArrayValueItem;
  surgicalHistory: StringArrayValueItem;
  height: StringValueItem;
  weight: StringValueItem;

  relationshipStatus: StringValueItem;
  employmentStatus: StringValueItem;
  insurance: StringValueItem;
  language: StringValueItem;
  religion: StringValueItem;
  supportPersons: ContactItem;
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
  if (feet && inches) return `${feet}' ${inches}"`;
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


export function buildChartDataFromCaseRow(
  caseRow: Record<string, unknown> | null | undefined,
): ChartData {

  const firstName = String(caseRow?.first_name ?? "").trim();
  const lastName = String(caseRow?.last_name ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown Patient";

  const supportPersons = String(caseRow?.emergency_contact_name ?? "").trim()
    ? [{
      name: String(caseRow?.emergency_contact_name ?? "").trim(),
      relationship: String(caseRow?.emergency_contact_relationship ?? "").trim() || "Unknown",
      phone: String(caseRow?.emergency_contact_phone ?? "").trim() || "",
    }]
    : [];

  return {
    name: { id: "name", label: "Name", value: fullName },
    age: { id: "age", label: "Age", value: String(caseRow?.age) },
    code: { id: "code", label: "Code Status", value: String(caseRow?.code_status ?? "").trim() || "N/A" },
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
  };
}


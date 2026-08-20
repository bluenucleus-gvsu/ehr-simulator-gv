import { differenceInYears } from "date-fns";

import type { CaseBundle, CaseBundleRow } from "@/actions/case_builder/getCase";
import { buildChartingRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/chartingFromBundle";
import { flexSheetTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
import { labTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { medOrderFormStateFromCaseBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";
import { defaultDemographicData, defaultHistoryData } from "@/context/FormContext";
import type { DemographicFormData, FormBlob } from "@/utils/form";
import { intakeOutputBlocksFromCaseRow, months } from "@/utils/form";

function text(row: CaseBundleRow, key: string): string {
  const value = row[key];
  return value == null ? "" : String(value);
}

function nestedName(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const name = (value as CaseBundleRow).name;
  return name == null ? "" : String(name);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function demographicsFromCaseRow(caseRow: CaseBundleRow): DemographicFormData {
  const dob = text(caseRow, "date_of_birth");
  const [, month = "", day = ""] = dob.split("-");
  const monthIndex = Number(month);

  let age = "";
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob.trim());
  if (dateMatch) {
    const parsed = new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]));
    if (!Number.isNaN(parsed.getTime())) age = String(differenceInYears(new Date(), parsed));
  }

  const providerRaw = text(caseRow, "attending_provider").trim();
  const titleMatch = /^(MD|DO|NP|PA)\s+(.+)$/i.exec(providerRaw);
  const trailingTitleMatch = /^(.+?)[,\s]+(MD|DO|NP|PA)$/i.exec(providerRaw);
  const attendingProviderTitle = String(titleMatch?.[1] ?? trailingTitleMatch?.[2] ?? "").toUpperCase();
  const attendingProviderName = String(titleMatch?.[2] ?? trailingTitleMatch?.[1] ?? providerRaw)
    .replace(/,+$/, "")
    .trim();

  return {
    ...defaultDemographicData,
    DOBDay: day ? String(Number(day)) : "",
    DOBMonth: monthIndex >= 1 && monthIndex <= 12 ? months[monthIndex - 1] : "",
    admissionDateOffest: text(caseRow, "inpatient_duration_days"),
    admissionTime: text(caseRow, "time_of_admission").slice(0, 5),
    admittingDiagnosis: text(caseRow, "admitting_diagnosis"),
    age,
    attendingProviderName,
    attendingProviderTitle,
    codeStatus: text(caseRow, "code_status"),
    dosingWeight: text(caseRow, "weight_kg"),
    employment: text(caseRow, "employment"),
    firstName: text(caseRow, "first_name"),
    heightFeet: text(caseRow, "height_ft"),
    heightInches: text(caseRow, "height_in"),
    insurance: text(caseRow, "insurance"),
    language: text(caseRow, "language"),
    needsInterpreter: Boolean(caseRow.requires_interpreter),
    lastName: text(caseRow, "last_name"),
    precautions: nestedName(caseRow.isolation_precautions),
    relationshipStatus: nestedName(caseRow.relationship_status),
    religion: text(caseRow, "religion"),
    summary: text(caseRow, "description"),
    contact: text(caseRow, "emergency_contact_name"),
    contactRelationship: text(caseRow, "emergency_contact_relationship"),
    contactPhone: text(caseRow, "emergency_contact_phone"),
    phaseCount: Math.max(1, Number(caseRow.phase_count ?? 1)),
  };
}

export function caseBundleToFormBlob(bundle: CaseBundle): FormBlob {
  const caseRow = bundle.caseRow ?? {};
  const hydratedLabs = buildLabRowsFromBundle(
    {
      labResults: bundle.labResults ?? [],
      imagingReports: bundle.imagingReports ?? [],
      microbiologyReports: bundle.microbiologyReports ?? [],
    },
    labTemplate,
  );
  const hydratedCharting = buildChartingRowsFromBundle(
    bundle.documentationResults ?? [],
    flexSheetTemplate,
  );

  return {
    demographics: demographicsFromCaseRow(caseRow),
    history: {
      ...defaultHistoryData,
      medicalHistory: stringArray(caseRow.medical_history),
      surgicalHistory: stringArray(caseRow.surgical_history),
      allergies: stringArray(caseRow.allergies),
      socialHistory: stringArray(caseRow.social_habits),
      livingSituation: stringArray(caseRow.living_situation),
      alerts: (bundle.safetyAlerts ?? [])
        .map((row) => nestedName(row.safety_alert))
        .filter(Boolean),
      familyHistory: (bundle.familyHistory ?? [])
        .map((row) => ({
          relation: nestedName(row.relationship),
          condition: text(row, "condition"),
        }))
        .filter((row: { relation: string; condition: string }) => row.relation && row.condition),
    },
    notes: (bundle.clinicalDocuments ?? []).map((note) => ({
      title: `${text(note, "category") || "Progress"} Note`,
      author: text(note, "author"),
      specialty: text(note, "specialty"),
      timeOffset: Number(note.time_offset ?? 0),
      excludedFromPresim: !Boolean(note.is_in_presim),
      content: text(note, "doc_text") || "<p></p>",
      phase: Math.max(1, Number(note.phase ?? 1)),
    })),
    orders: (bundle.orders ?? []).map((order) => ({
      category: text(order, "category") as FormBlob["orders"][number]["category"],
      title: text(order, "title"),
      details: text(order, "details"),
      status: text(order, "status") || "Active",
      orderingProvider: text(order, "provider"),
      important: Boolean(order.is_important),
      visibleInPresim: Boolean(order.is_in_presim),
      phase: Math.max(1, Number(order.phase ?? 1)),
    })),
    labs: {
      data: hydratedLabs.rows,
      timePoints: hydratedLabs.timePoints.length ? hydratedLabs.timePoints : [0],
      timePointsInPreSim: new Set(hydratedLabs.timePointsInPresim),
      visibleItems: new Set(
        hydratedLabs.rows.filter((row) => row.hideable).map((row) => row.field),
      ),
    },
    charting: {
      data: hydratedCharting.rows,
      timePoints: hydratedCharting.timeOffsets,
      timePointsInPreSim: hydratedCharting.timePointsInPreSim,
      visibleItems: hydratedCharting.visibleItems,
    },
    intakeOutput: intakeOutputBlocksFromCaseRow(caseRow.intake_output_blocks),
    medOrders: medOrderFormStateFromCaseBundle(bundle),
    medAdministrationInstances: (bundle.medicationAdministrations ?? []).map(
      (administration, index) => ({
        id: text(administration, "id") || text(administration, "created_at") || `persisted-admin-${index}`,
        medicationOrderId: text(administration, "medication_order_id"),
        administratorId: text(administration, "administrator"),
        adminTimeMinuteOffset: Number(administration.time_offset ?? 0),
        status: (text(administration, "status") || "Due") as FormBlob["medAdministrationInstances"][number]["status"],
        notes: text(administration, "notes"),
        administeredDose: Number(administration.administered_dose ?? 0),
        visibleInPresim: Boolean(administration.is_in_presim),
        phase: Math.max(1, Number(administration.phase ?? 1)),
      }),
    ),
    media: (bundle.caseImages ?? []).map((image) => ({
      id: text(image, "id"),
      previewUrl: text(image, "preview_url"),
      storagePath: text(image, "file_path") || undefined,
    })),
  };
}
